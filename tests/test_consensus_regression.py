from __future__ import annotations

import hashlib
import json

import pytest

from contracts import driftproof as dp
from tests.conftest import FakeResponse, fake_test_hooks
from tests.test_direct import GOOD_URL, freeze, make_contract, vector


def _legacy_vector_only(left, right):
    """The rejected pre-fix predicate, retained to prove the original defect."""
    left_vector = dp._validate_vector(left.get("vector")) if isinstance(left, dict) else None
    right_vector = dp._validate_vector(right.get("vector")) if isinstance(right, dict) else None
    return left_vector is not None and right_vector is not None and all(
        left_vector[key] is right_vector[key] for key in dp.SEMANTIC_KEYS
    )


def _rejects_first_assessment_result_mutation(monkeypatch, mutation):
    contract, guard_id = make_contract()
    freeze(contract, guard_id)
    original = dp._semantic_once
    calls = 0

    def hooked(guard, baseline, generation):
        nonlocal calls
        result = original(guard, baseline, generation)
        calls += 1
        if calls == 1:
            mutation(result)
        return result

    monkeypatch.setattr(dp, "_semantic_once", hooked)
    with pytest.raises(Exception, match="CONSENSUS_REJECTED"):
        contract.assess_current(guard_id)
    assert calls == 2
    assert contract.get_guard(guard_id)["generation"] == 0
    assert contract.get_assessment_history(guard_id) == []


def test_original_vector_only_vulnerability_is_reproduced_and_actual_path_rejects_status_pair():
    same_vector = {"vector": vector()}
    different_status = {
        "vector": vector(),
        "technical_status": dp.SOURCE_UNAVAILABLE,
    }
    assert _legacy_vector_only(same_vector, different_status) is True

    contract, guard_id = make_contract()
    freeze(contract, guard_id)
    responses = iter(
        [
            FakeResponse(200, b"current", GOOD_URL),
            FakeResponse(503, b"", GOOD_URL),
        ]
    )
    fake_test_hooks.web_get = lambda url, **kwargs: next(responses)
    fake_test_hooks.prompt = lambda prompt, fmt: vector()
    with pytest.raises(Exception, match="CONSENSUS_REJECTED"):
        contract.assess_current(guard_id)


def test_same_vector_different_evidence_sha_is_rejected(monkeypatch):
    def mutate(result):
        result["evidence"]["content_sha256"] = "0" * 64

    _rejects_first_assessment_result_mutation(monkeypatch, mutate)


def test_same_vector_different_document_content_is_rejected(monkeypatch):
    def mutate(result):
        result["evidence"]["content"] = "forged document"

    _rejects_first_assessment_result_mutation(monkeypatch, mutate)


def test_same_vector_different_byte_length_is_rejected(monkeypatch):
    def mutate(result):
        result["evidence"]["exact_byte_length"] += 1

    _rejects_first_assessment_result_mutation(monkeypatch, mutate)


def test_same_vector_different_effective_url_is_rejected(monkeypatch):
    def mutate(result):
        result["evidence"]["effective_url"] = GOOD_URL + "?revision=2"

    _rejects_first_assessment_result_mutation(monkeypatch, mutate)


def test_same_vector_different_source_url_is_rejected(monkeypatch):
    def mutate(result):
        result["evidence"]["source_url"] = "https://other.example.org/v1/terms"

    _rejects_first_assessment_result_mutation(monkeypatch, mutate)


@pytest.mark.parametrize("field", ["generation", "evidence_generation"])
def test_inconsistent_generation_is_rejected(monkeypatch, field):
    def mutate(result):
        if field == "generation":
            result["generation"] += 1
        else:
            result["evidence"]["generation"] += 1

    _rejects_first_assessment_result_mutation(monkeypatch, mutate)


@pytest.mark.parametrize(
    "mutation",
    [
        lambda result: result.pop("technical_status"),
        lambda result: result.pop("evidence"),
        lambda result: result["vector"].pop("scope_changed"),
        lambda result: result["vector"].__setitem__("scope_changed", "false"),
    ],
    ids=["missing_status", "missing_evidence", "missing_vector_key", "malformed_vector"],
)
def test_missing_or_malformed_assessment_fields_are_rejected(monkeypatch, mutation):
    _rejects_first_assessment_result_mutation(monkeypatch, mutation)


def test_forged_evidence_metadata_is_rejected_even_when_vector_matches(monkeypatch):
    def mutate(result):
        result["evidence"]["content_sha256"] = hashlib.sha256(b"forged").hexdigest()
        result["evidence"]["exact_byte_length"] = len(b"forged")

    _rejects_first_assessment_result_mutation(monkeypatch, mutate)


def test_conflicting_source_unavailable_and_ok_results_are_rejected():
    contract, guard_id = make_contract()
    freeze(contract, guard_id)
    responses = iter(
        [
            FakeResponse(200, b"current", GOOD_URL),
            FakeResponse(404, b"", GOOD_URL),
        ]
    )
    fake_test_hooks.web_get = lambda url, **kwargs: next(responses)
    fake_test_hooks.prompt = lambda prompt, fmt: vector()
    with pytest.raises(Exception, match="CONSENSUS_REJECTED"):
        contract.assess_current(guard_id)


def test_conflicting_evidence_mismatch_and_ok_results_are_rejected():
    contract, guard_id = make_contract()
    freeze(contract, guard_id)
    responses = iter(
        [
            FakeResponse(200, b"current", GOOD_URL),
            FakeResponse(200, b"x" * (dp.MAX_DOCUMENT_BYTES + 1), GOOD_URL),
        ]
    )
    fake_test_hooks.web_get = lambda url, **kwargs: next(responses)
    fake_test_hooks.prompt = lambda prompt, fmt: vector()
    with pytest.raises(Exception, match="CONSENSUS_REJECTED"):
        contract.assess_current(guard_id)


def test_invalid_model_output_is_consensus_bound_and_inconclusive():
    contract, guard_id = make_contract()
    freeze(contract, guard_id)
    fake_test_hooks.web_get = lambda url, **kwargs: FakeResponse(200, b"current", GOOD_URL)
    fake_test_hooks.prompt = lambda prompt, fmt: json.dumps({"verdict": "NO_MATERIAL_CHANGE"})
    assessment = contract.get_assessment(contract.assess_current(guard_id))
    assert assessment["technical_status"] == dp.INCONCLUSIVE
    assert assessment["verdict"] == dp.INCONCLUSIVE
    assert assessment["semantic_vector"] == {key: False for key in dp.SEMANTIC_KEYS}


def test_matching_canonical_assessments_pass_and_timestamp_is_safe_metadata():
    contract, guard_id = make_contract()
    freeze(contract, guard_id)
    import tests.conftest as c

    calls = 0
    timestamps = iter(["2026-10-11T00:00:01Z", "2026-10-11T00:00:02Z"])

    def web_get(url, **kwargs):
        nonlocal calls
        calls += 1
        c.fake.message.raw["datetime"] = next(timestamps)
        return FakeResponse(200, b"current", GOOD_URL)

    fake_test_hooks.web_get = web_get
    fake_test_hooks.prompt = lambda prompt, fmt: vector()
    assessment = contract.get_assessment(contract.assess_current(guard_id))
    assert assessment["verdict"] == dp.NO_MATERIAL_CHANGE
    assert assessment["technical_status"] == dp.OK
    assert calls == 2


def test_replay_and_history_mutation_remain_rejected():
    contract, guard_id = make_contract()
    freeze(contract, guard_id)
    fake_test_hooks.web_get = lambda url, **kwargs: FakeResponse(200, b"same-current", GOOD_URL)
    fake_test_hooks.prompt = lambda prompt, fmt: vector()
    first_id = contract.assess_current(guard_id)
    first = contract.get_assessment(first_id)
    with pytest.raises(Exception, match="DUPLICATE_OR_REPLAYED_ASSESSMENT"):
        contract.assess_current(guard_id)
    assert contract.get_guard(guard_id)["generation"] == 1
    assert contract.get_assessment_history(guard_id) == [first]


@pytest.mark.parametrize(
    "mutation",
    [
        lambda result: result["evidence"].__setitem__("effective_url", GOOD_URL + "?revision=2"),
        lambda result: result["evidence"].__setitem__("source_url", "https://other.example.org/v1/terms"),
        lambda result: result["evidence"].__setitem__("content_sha256", "0" * 64),
        lambda result: result["evidence"].__setitem__("exact_byte_length", 1),
    ],
    ids=["effective_url", "source_url", "sha256", "byte_length"],
)
def test_freeze_validator_binds_complete_retrieval_identity(monkeypatch, mutation):
    contract, guard_id = make_contract()
    original = dp._retrieve_document
    calls = 0

    def hooked(guard, generation):
        nonlocal calls
        result = original(guard, generation)
        calls += 1
        if calls == 1:
            mutation(result)
        return result

    monkeypatch.setattr(dp, "_retrieve_document", hooked)
    with pytest.raises(Exception, match="CONSENSUS_REJECTED"):
        contract.freeze_baseline(guard_id)
    assert contract.get_status(guard_id) == dp.DRAFT
    with pytest.raises(Exception, match="BASELINE_NOT_FOUND"):
        contract.get_baseline(guard_id)
