# Independent red-team audit record

Audit scope was performed against the first implementation before release-candidate hardening. Findings were recorded here before fixes were applied; the final test and toolchain gates were then rerun.

| ID | Severity | Finding | Fix / verification |
|---|---|---|---|
| DP-001 | Critical | A mutable baseline would let later assessments change the reference. | Baseline written only during `freeze_baseline`; refreeze and replacement are rejected; immutability tests pass. |
| DP-002 | Critical | Caller-supplied business verdict would allow arbitrary outcomes. | No verdict input exists; verdict is derived from the strict vector; schema and derivation tests pass. |
| DP-003 | Critical | Host suffix matching could admit an attacker-controlled authority. | IDNA-normalized complete-host equality plus path-boundary checks; URL adversarial tests pass. |
| DP-004 | Critical | Rewriting assessment records could erase historical outcomes. | New IDs and append-only history only; state/property tests pass. |
| DP-005 | High | Replaying an identical current document could create result-shopping writes. | Duplicate key blocks the same guard/baseline/current/status tuple; replay test passes. |
| DP-006 | High | Prompt injection in either document could influence the evaluator. | Both texts are untrusted data with explicit injection defenses and exact schema; adversarial tests pass. |
| DP-007 | High | Source failure could collapse into `NO_MATERIAL_CHANGE`. | Typed technical status is persisted and wins over business derivation; failure tests pass. |
| DP-008 | High | UTF-8 character count could under-bound byte content. | All bounds use encoded UTF-8 bytes; mutation test kills character-count weakening. |
| DP-009 | Medium | Extra semantic fields could smuggle a model verdict. | Exact key-set validation rejects extras; schema adversarial tests pass. |
| DP-010 | Medium | Non-2xx or out-of-authority effective URLs could be stored as evidence. | Retrieval classifies failures and rechecks final URL authority; redirect/status tests pass. |
| DP-011 | High | The first Studio-dev deployment path supplied only `feeValue`; the v0.6 SDK filled the omitted distribution with zero defaults and the consensus call reverted before contract creation. | Raw transaction/receipt, command path, zero-filled reconstruction, and complete estimator output are recorded in `FAILED_DEPLOYMENT_FEE_FORENSICS.json`; no contract source change was made. |
| DP-012 | Critical | Deployment #3 executed successfully, but the observed sender was `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` rather than the authorized deployer `0x61f10cc252ed98ce7596c73fc557cca4cc600c82`. | Deployment hash, sender, unchanged authorized-account nonce, source parity, schema, and readback are recorded in `STUDIO_DEV_DEPLOYMENT.md`; no additional transaction was sent. |
| DP-013 | High | The candidate hard-coded `sign=True` for public evidence retrieval, adding a GenVM external signer preflight that failed closed as `SOURCE_UNAVAILABLE` for two independent public authorities. | The candidate removes the optional signing request, preserves all source/authority/digest controls, adds unsigned-path regression coverage, and remains undeployed pending separate authorization. |

## Runtime-fix candidate

The undeployed `0.1.1-rc1` candidate changes exactly one executable retrieval
call from `gl.nondet.web.get(source_url, sign=True)` to
`gl.nondet.web.get(source_url)`. The deployed `0.1.0-rc1` source and all
qualification failures remain historical records. The exact internal
`SIGN_URL_*` failure was not exposed by Studio-dev, so the diagnosis is
conservatively recorded as `SIGNED_WEB_REQUEST_PATH_INCOMPATIBLE_OR_UNRELIABLE_ON_CURRENT_STUDIO_DEV`.

Residual risks are listed in the final response and are not silently treated as solved by offline tests.
