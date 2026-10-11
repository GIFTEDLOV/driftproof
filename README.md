# DriftProof

DriftProof is a standalone GenLayer Intelligent Contract submission for semantic change control. It freezes an authenticated version of an authoritative public document and later records whether the current version materially changed protected meaning.

## Status

This repository contains the historical Studio-dev Deployment #3 at `0xf7D72f3736A570559900F6eDec9424ac4Ad81992` (chain ID 61997), plus the verified Deployment #4 candidate and live qualification. Deployment #3 was signed by `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`, which differs from the authorized DriftProof deployer; that signer discrepancy remains preserved as a critical historical finding. Earlier failed submissions remain permanently recorded in `docs/provenance/`.

Deployment #4 of the `0.1.1-rc1` unsigned-public-GET runtime fix completed successfully on Studio-dev at `0x52f6B57373DE9677b5Fc883B59CA4cc3a257B4a1`. Its live qualification completed with one guard, one frozen baseline, and one finalized assessment: `NO_MATERIAL_CHANGE` with sufficient evidence. It follows two historical `SOURCE_UNAVAILABLE` observations on the signed path; Deployment #3 and all failed attempts remain historical. This corrected `0.1.2-rc1` consensus-binding candidate is not deployed; the prior deployment must not be treated as source-equivalent.

## Problem and trust model

A byte hash detects any change but cannot tell whether meaning changed. DriftProof uses GenLayer validators to independently evaluate a small, closed semantic fact vector. The contract, not a model, derives the business verdict. A caller cannot replace a frozen baseline, change authority or path after creation, provide an arbitrary verdict, overwrite history, or retry the same current content for a different result.

The leader and validator must agree on a complete canonical assessment identity: technical status, guard/baseline context, schema, generation, semantic vector, source/effective URLs, exact UTF-8 content, SHA-256, and byte length. Observation timestamps are bounded provenance metadata only; they do not affect verdict, replay identity, or the assessment identity hash.

The external document is treated as hostile data. HTTPS, hostname, path prefix, credentials, fragments, ports, ambiguous paths, UTF-8 validity, content bounds, redirect authority, and exact hashes are checked at the contract boundary.

## Semantic vector

Every accepted model response contains exactly eight booleans:

`obligation_changed`, `permission_changed`, `prohibition_changed`, `scope_changed`, `deadline_changed`, `economic_term_changed`, `exception_changed`, `evidence_sufficient`.

No verdict, confidence, score, explanation, amount, address, or free-form prose is accepted. If evidence is insufficient, the verdict is `INCONCLUSIVE`. Otherwise, any true protected dimension yields `MATERIAL_CHANGE`; otherwise `NO_MATERIAL_CHANGE`.

## State machine

`DRAFT -> BASELINE_FROZEN -> ACTIVE`

The creator can freeze the baseline once. Assessments are append-only and have monotonically increasing generations. Technical states are never mapped to `NO_MATERIAL_CHANGE`: `SOURCE_UNAVAILABLE`, `EVIDENCE_MISMATCH`, and `INCONCLUSIVE` remain distinct.

## Public methods

Writes: `create_guard`, `freeze_baseline`, `assess_current`.

Views: `get_guard`, `get_guard_ids`, `get_guard_count`, `get_baseline`, `get_assessment`, `get_assessment_history`, `get_status`, `contract_info`.

## Testing and audit

The test program includes direct behavior tests, adversarial URL/schema/prompt-injection tests, state-machine/property tests, 26 named security mutation checks, and complete consensus regression coverage. Release evidence is recorded in `docs/provenance/`.

## Deployment status

The corrected `0.1.2-rc1` source has not been deployed, and no blockchain transaction was sent for this remediation. Deployment #4 remains historical evidence for the unsigned retrieval path only; its source is not consensus-equivalent to this candidate. No GitHub repository has been pushed. See `docs/DEPLOYMENT.md`, `docs/provenance/AUDIT.md`, and `docs/provenance/RELEASE_MANIFEST.json`.
