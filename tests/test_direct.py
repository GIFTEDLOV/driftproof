from __future__ import annotations

import hashlib
import json
from pathlib import Path

import pytest

from contracts import driftproof as dp
from tests.conftest import FakeResponse, fake_test_hooks


GOOD_URL = "https://policy.example.org/v1/terms"
BASELINE = b"Section 1. Users must protect credentials.\n"
CURRENT = b"Section 1. Users must protect credentials.\n"


def vector(**changes):
    result = {key: False for key in dp.SEMANTIC_KEYS}
    result.update(changes)
    result["evidence_sufficient"] = changes.get("evidence_sufficient", True)
    return result


def make_contract(sender: str = "0x1111111111111111111111111111111111111111"):
    fake_test_hooks.web_get = lambda url, **kwargs: FakeResponse(200, BASELINE, url)
    fake_test_hooks.prompt = lambda prompt, fmt: vector()
    import tests.conftest as c

    c.FakeSender.as_hex = sender
    c.fake.message.raw["datetime"] = "2026-10-01T00:00:00Z"
    contract = dp.DriftProof()
    guard_id = contract.create_guard(
        "policy-main", "policy.example.org", "/v1", GOOD_URL,
        json.dumps(list(dp.PROTECTED_KEYS)), dp.MAX_DOCUMENT_BYTES,
    )
    return contract, guard_id


def freeze(contract, guard_id):
    return contract.freeze_baseline(guard_id)


def test_contract_info_and_initial_state():
    contract, guard_id = make_contract()
    assert contract.get_status(guard_id) == dp.DRAFT
    info = contract.contract_info()
    assert info["name"] == "DriftProof"
    assert info["semantic_schema"] == dp.SEMANTIC_SCHEMA
    assert info["guard_count"] == 1
    assert info["max_document_bytes"] == dp.MAX_DOCUMENT_BYTES
    assert info["public_method_count"] == 11
    assert info["version"] == "0.1.1-rc1"


def test_public_source_retrieval_uses_unsigned_default_get():
    contract, guard_id = make_contract()
    calls = []

    def capture(url, **kwargs):
        calls.append(kwargs)
        return FakeResponse(200, BASELINE, url)

    fake_test_hooks.web_get = capture
    freeze(contract, guard_id)
    assert len(calls) == 2
    assert all("sign" not in kwargs for kwargs in calls)


def test_canonical_source_contains_no_signed_public_get():
    source = Path(__file__).parents[1].joinpath("contracts", "driftproof.py").read_text(encoding="utf-8")
    assert "gl.nondet.web.get(source_url, sign=True)" not in source


def test_guard_normalizes_authority_and_url():
    contract, guard_id = make_contract()
    guard = contract.get_guard(guard_id)
    assert guard["authority_host"] == "policy.example.org"
    assert guard["baseline_url"] == GOOD_URL
    assert guard["authority_path_prefix"] == "/v1"


def test_freeze_stores_authenticated_baseline():
    contract, guard_id = make_contract()
    baseline_id = freeze(contract, guard_id)
    baseline = contract.get_baseline(guard_id)
    assert baseline_id == "BAS-" + guard_id
    assert baseline["baseline_id"] == baseline_id
    assert baseline["guard_id"] == guard_id
    assert baseline["authority_id"] == "policy-main"
    assert baseline["source_url"] == GOOD_URL
    assert baseline["exact_byte_length"] == len(BASELINE)
    assert baseline["content_sha256"] == hashlib.sha256(BASELINE).hexdigest()
    assert baseline["content"] == BASELINE.decode()
    assert baseline["frozen"] is True
    assert contract.get_status(guard_id) == dp.BASELINE_FROZEN


@pytest.mark.parametrize("field", dp.PROTECTED_KEYS)
def test_each_protected_dimension_derives_material_change(field):
    contract, guard_id = make_contract()
    freeze(contract, guard_id)
    fake_test_hooks.prompt = lambda prompt, fmt, field=field: vector(**{field: True})
    assessment_id = contract.assess_current(guard_id)
    assessment = contract.get_assessment(assessment_id)
    assert assessment["verdict"] == dp.MATERIAL_CHANGE
    assert assessment["semantic_vector"][field] is True


@pytest.mark.parametrize("field", dp.PROTECTED_KEYS)
def test_each_unprotected_dimension_does_not_change_business_verdict(field):
    contract, guard_id = make_contract()
    dimensions = [key for key in dp.PROTECTED_KEYS if key != field]
    # Recreate a guard with the selected dimension removed.
    contract = dp.DriftProof()
    fake_test_hooks.web_get = lambda url, **kwargs: FakeResponse(200, BASELINE, url)
    fake_test_hooks.prompt = lambda prompt, fmt, field=field: vector(**{field: True})
    guard_id = contract.create_guard("policy-main", "policy.example.org", "/v1", GOOD_URL, json.dumps(dimensions), 1000)
    freeze(contract, guard_id)
    assessment = contract.get_assessment(contract.assess_current(guard_id))
    assert assessment["verdict"] == dp.NO_MATERIAL_CHANGE


def test_evidence_insufficient_is_inconclusive_even_with_changes():
    contract, guard_id = make_contract()
    freeze(contract, guard_id)
    fake_test_hooks.prompt = lambda prompt, fmt: vector(obligation_changed=True, evidence_sufficient=False)
    assessment = contract.get_assessment(contract.assess_current(guard_id))
    assert assessment["verdict"] == dp.INCONCLUSIVE


@pytest.mark.parametrize("status", [404, 408, 429, 500, 503])
def test_non_success_web_status_is_source_unavailable(status):
    contract, guard_id = make_contract()
    freeze(contract, guard_id)
    fake_test_hooks.web_get = lambda url, status=status, **kwargs: FakeResponse(status, b"", url)
    assessment = contract.get_assessment(contract.assess_current(guard_id))
    assert assessment["verdict"] == dp.SOURCE_UNAVAILABLE
    assert assessment["technical_status"] == dp.SOURCE_UNAVAILABLE
    assert assessment["verdict"] != dp.NO_MATERIAL_CHANGE


@pytest.mark.parametrize("body", [b"x" * 1001, b"\xff\xfe", b""])
def test_bad_content_is_evidence_mismatch(body):
    contract, guard_id = make_contract()
    freeze(contract, guard_id)
    fake_test_hooks.web_get = lambda url, body=body, **kwargs: FakeResponse(200, body, url)
    # max=1000 is used by the first fixture only; empty and invalid UTF-8 are also mismatches.
    if body == b"x" * 1001:
        contract = dp.DriftProof()
        fake_test_hooks.web_get = lambda url, **kwargs: FakeResponse(200, BASELINE, url)
        guard_id = contract.create_guard("policy-main", "policy.example.org", "/v1", GOOD_URL, json.dumps(list(dp.PROTECTED_KEYS)), 1000)
        freeze(contract, guard_id)
        fake_test_hooks.web_get = lambda url, **kwargs: FakeResponse(200, body, url)
    assessment = contract.get_assessment(contract.assess_current(guard_id))
    assert assessment["verdict"] == dp.EVIDENCE_MISMATCH


def test_outside_authority_redirect_is_evidence_mismatch():
    contract, guard_id = make_contract()
    freeze(contract, guard_id)
    fake_test_hooks.web_get = lambda url, **kwargs: FakeResponse(200, CURRENT, "https://evil.example.net/v1/terms")
    assessment = contract.get_assessment(contract.assess_current(guard_id))
    assert assessment["verdict"] == dp.EVIDENCE_MISMATCH


def test_assessment_contains_exact_current_evidence_fields():
    contract, guard_id = make_contract()
    freeze(contract, guard_id)
    assessment = contract.get_assessment(contract.assess_current(guard_id))
    evidence = assessment["current_evidence"]
    assert set(evidence) == {"source_url", "effective_url", "content_sha256", "exact_byte_length", "content", "observed_at", "generation"}
    assert evidence["content_sha256"] == hashlib.sha256(CURRENT).hexdigest()
    assert evidence["exact_byte_length"] == len(CURRENT)
    assert evidence["generation"] == 1


def test_generation_and_history_are_append_only():
    contract, guard_id = make_contract()
    freeze(contract, guard_id)
    fake_test_hooks.web_get = lambda url, **kwargs: FakeResponse(200, b"new version", url)
    first = contract.get_assessment(contract.assess_current(guard_id))
    fake_test_hooks.web_get = lambda url, **kwargs: FakeResponse(200, b"newer version", url)
    second = contract.get_assessment(contract.assess_current(guard_id))
    assert first["generation"] == 1
    assert second["generation"] == 2
    assert contract.get_guard(guard_id)["generation"] == 2
    history = contract.get_assessment_history(guard_id)
    assert [item["assessment_id"] for item in history] == [first["assessment_id"], second["assessment_id"]]


def test_duplicate_current_digest_is_rejected():
    contract, guard_id = make_contract()
    freeze(contract, guard_id)
    fake_test_hooks.web_get = lambda url, **kwargs: FakeResponse(200, b"new version", url)
    contract.assess_current(guard_id)
    with pytest.raises(Exception, match="DUPLICATE_OR_REPLAYED_ASSESSMENT"):
        contract.assess_current(guard_id)


def test_baseline_replacement_and_refreeze_are_rejected():
    contract, guard_id = make_contract()
    freeze(contract, guard_id)
    baseline_before = contract.get_baseline(guard_id)
    with pytest.raises(Exception, match="BASELINE_ALREADY_FROZEN"):
        contract.freeze_baseline(guard_id)
    assert contract.get_baseline(guard_id) == baseline_before


def test_contract_has_no_force_verdict_or_baseline_rewrite_methods():
    public_names = {name for name in dir(dp.DriftProof) if not name.startswith("_")}
    assert "force_verdict" not in public_names
    assert "rewrite_baseline" not in public_names
    assert "delete_history" not in public_names


@pytest.mark.parametrize("dimensions", [list(dp.PROTECTED_KEYS[:count]) for count in range(1, 8)])
def test_valid_protected_dimension_subsets_are_frozen(dimensions):
    contract = dp.DriftProof()
    guard_id = contract.create_guard("policy-main", "policy.example.org", "/v1", GOOD_URL, json.dumps(dimensions), 1000)
    assert contract.get_guard(guard_id)["protected_dimensions"] == dimensions


@pytest.mark.parametrize(
    "changes",
    [
        {},
        {"obligation_changed": True},
        {"permission_changed": True},
        {"prohibition_changed": True},
        {"scope_changed": True},
        {"deadline_changed": True},
        {"economic_term_changed": True},
        {"exception_changed": True},
    ],
)
def test_business_derivation_matrix(changes):
    contract, guard_id = make_contract()
    freeze(contract, guard_id)
    fake_test_hooks.prompt = lambda prompt, fmt, changes=changes: vector(**changes)
    assessment = contract.get_assessment(contract.assess_current(guard_id))
    expected = dp.MATERIAL_CHANGE if changes else dp.NO_MATERIAL_CHANGE
    assert assessment["verdict"] == expected


@pytest.mark.parametrize("url", ["https://policy.example.org:443/v1/terms", "HTTPS://POLICY.EXAMPLE.ORG/v1/terms", "https://policy.example.org/v1/terms?rev=1", "https://policy.example.org/v1"])
def test_valid_https_url_variants_are_canonicalized(url):
    contract = dp.DriftProof()
    target = url if url != "https://policy.example.org/v1" else "https://policy.example.org/v1"
    guard_id = contract.create_guard("policy-main", "policy.example.org", "/v1", target, json.dumps(list(dp.PROTECTED_KEYS)), 1000)
    assert contract.get_guard(guard_id)["baseline_url"].startswith("https://policy.example.org/v1")


@pytest.mark.parametrize("body", [b"current-a", b"current-b", b"current-c", b"current-d", b"current-e", b"current-f"])
def test_distinct_current_hashes_append_distinct_records(body):
    contract, guard_id = make_contract()
    freeze(contract, guard_id)
    fake_test_hooks.web_get = lambda url, body=body, **kwargs: FakeResponse(200, body, url)
    record = contract.get_assessment(contract.assess_current(guard_id))
    assert record["current_sha256"] == hashlib.sha256(body).hexdigest()
    assert len(contract.get_assessment_history(guard_id)) == 1


@pytest.mark.parametrize("observed", ["2026-10-01T00:00:00Z", "", "2026-10-01T00:00:00.123Z", "2026-10-01"])
def test_observation_timestamp_is_historical_evidence(observed):
    contract, guard_id = make_contract()
    fake_test_hooks.web_get = lambda url, observed=observed, **kwargs: FakeResponse(200, BASELINE, url)
    import tests.conftest as c

    c.fake.message.raw["datetime"] = observed
    baseline_id = freeze(contract, guard_id)
    baseline = contract.get_baseline(guard_id)
    assert baseline["baseline_id"] == baseline_id
    assert isinstance(baseline["captured_at"], str)
