# DriftProof

DriftProof is a standalone GenLayer Intelligent Contract submission for semantic change control. It freezes an authenticated version of an authoritative public document and later records whether the current version materially changed protected meaning.

## Status

This repository contains a Studio-dev deployment with successful execution and readback verification at `0xf7D72f3736A570559900F6eDec9424ac4Ad81992` (chain ID 61997). Live semantic qualification is still pending, and this is not a production claim. The deployment transaction was signed by the CLI-configured account `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`, which differs from the authorized DriftProof deployer recorded in the release procedure; that signer discrepancy is preserved as a critical operational finding. Earlier failed submissions remain permanently recorded in `docs/provenance/`.

This worktree also contains an undeployed `0.1.1-rc1` runtime-fix candidate. It uses the official default unsigned public GET path after two Studio-dev `SOURCE_UNAVAILABLE` observations on the signed path. Deployment #3 remains historical; Deployment #4 has not been authorized or performed.

## Problem and trust model

A byte hash detects any change but cannot tell whether meaning changed. DriftProof uses GenLayer validators to independently evaluate a small, closed semantic fact vector. The contract, not a model, derives the business verdict. A caller cannot replace a frozen baseline, change authority or path after creation, provide an arbitrary verdict, overwrite history, or retry the same current content for a different result.

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

The test program includes direct behavior tests, adversarial URL/schema/prompt-injection tests, state-machine/property tests, and 25 named security mutation checks. Release evidence is recorded in `docs/provenance/`.

## Deployment status

DriftProof is deployed on Studio-dev at `0xf7D72f3736A570559900F6eDec9424ac4Ad81992`. `contract_info`, initial guard state, deployed schema, and submitted source-byte hash were verified. No qualification writes were performed; `LIVE_QUALIFICATION=PENDING`. No GitHub repository has been created or pushed. See `docs/provenance/STUDIO_DEV_DEPLOYMENT.md` for the full chronology and signer discrepancy.
