from __future__ import annotations

import json

import pytest

from contracts import driftproof as dp
from tests.conftest import FakeResponse, fake_test_hooks
from tests.test_direct import BASELINE, GOOD_URL, freeze, make_contract, vector


@pytest.mark.parametrize("index", range(1, 21))
def test_guard_ids_are_monotonic(index):
    contract = dp.DriftProof()
    last = ""
    for number in range(1, index + 1):
        last = contract.create_guard(
            "policy-main", "policy.example.org", "/v1", GOOD_URL,
            json.dumps(list(dp.PROTECTED_KEYS)), dp.MAX_DOCUMENT_BYTES,
        )
        assert last == f"GUA-{number:08d}"
    assert last == f"GUA-{index:08d}"


@pytest.mark.parametrize("index", range(1, 11))
def test_assessment_generations_are_monotonic(index):
    contract, guard_id = make_contract()
    freeze(contract, guard_id)
    fake_test_hooks.prompt = lambda prompt, fmt: vector()
    for generation in range(1, index + 1):
        body = f"version-{generation}".encode()
        fake_test_hooks.web_get = lambda url, body=body, **kwargs: FakeResponse(200, body, url)
        assessment = contract.get_assessment(contract.assess_current(guard_id))
        assert assessment["generation"] == generation
    assert contract.get_guard(guard_id)["generation"] == index


def test_history_length_matches_successful_assessments():
    contract, guard_id = make_contract()
    freeze(contract, guard_id)
    for generation in range(1, 6):
        body = f"append-{generation}".encode()
        fake_test_hooks.web_get = lambda url, body=body, **kwargs: FakeResponse(200, body, url)
        contract.assess_current(guard_id)
    assert len(contract.get_assessment_history(guard_id)) == 5


def test_failed_freeze_does_not_change_state_or_create_baseline():
    contract, guard_id = make_contract()
    fake_test_hooks.web_get = lambda url, **kwargs: FakeResponse(503, b"", url)
    with pytest.raises(Exception):
        contract.freeze_baseline(guard_id)
    assert contract.get_status(guard_id) == dp.DRAFT
    with pytest.raises(Exception, match="BASELINE_NOT_FOUND"):
        contract.get_baseline(guard_id)


def test_failed_assessment_does_not_advance_generation_when_consensus_rejects():
    contract, guard_id = make_contract()
    freeze(contract, guard_id)
    import tests.conftest as c

    old = c.fake.vm.run_nondet
    c.fake.vm.run_nondet = lambda leader, validator: (_ for _ in ()).throw(c.UserError("CONSENSUS_REJECTED"))
    try:
        with pytest.raises(Exception):
            contract.assess_current(guard_id)
    finally:
        c.fake.vm.run_nondet = old
    assert contract.get_guard(guard_id)["generation"] == 0
    assert contract.get_assessment_history(guard_id) == []


def test_assessment_identity_binds_guard_baseline_generation_and_schema():
    contract, guard_id = make_contract()
    freeze(contract, guard_id)
    fake_test_hooks.web_get = lambda url, **kwargs: FakeResponse(200, b"identity", url)
    record = contract.get_assessment(contract.assess_current(guard_id))
    assert record["guard_id"] == guard_id
    assert record["baseline_sha256"] == contract.get_baseline(guard_id)["content_sha256"]
    assert record["current_sha256"]
    assert record["generation"] == 1
    assert record["semantic_schema_version"] == dp.SEMANTIC_SCHEMA
    assert len(record["identity_sha256"]) == 64


def test_terminal_invariants_no_delete_or_overwrite_path():
    contract, guard_id = make_contract()
    freeze(contract, guard_id)
    baseline = contract.get_baseline(guard_id)
    fake_test_hooks.web_get = lambda url, **kwargs: FakeResponse(200, b"immutable-current", url)
    assessment_id = contract.assess_current(guard_id)
    assert contract.get_baseline(guard_id) == baseline
    assert contract.get_assessment(assessment_id)["assessment_id"] == assessment_id
    assert len(contract.get_assessment_history(guard_id)) == 1


@pytest.mark.parametrize("maximum", [1, 2, 100, 1000, dp.MAX_DOCUMENT_BYTES])
def test_document_boundaries_accept_values_inside_configured_bound(maximum):
    contract = dp.DriftProof()
    fake_test_hooks.web_get = lambda url, **kwargs: FakeResponse(200, BASELINE, url)
    guard_id = contract.create_guard("policy-main", "policy.example.org", "/v1", GOOD_URL, json.dumps(list(dp.PROTECTED_KEYS)), maximum)
    assert contract.get_guard(guard_id)["max_document_bytes"] == maximum


@pytest.mark.parametrize("maximum", [0, -1, dp.MAX_DOCUMENT_BYTES + 1, dp.MAX_DOCUMENT_BYTES * 2])
def test_document_boundaries_reject_values_outside_configured_bound(maximum):
    contract = dp.DriftProof()
    with pytest.raises(Exception, match="INVALID_MAX_DOCUMENT_BYTES"):
        contract.create_guard("policy-main", "policy.example.org", "/v1", GOOD_URL, json.dumps(list(dp.PROTECTED_KEYS)), maximum)
