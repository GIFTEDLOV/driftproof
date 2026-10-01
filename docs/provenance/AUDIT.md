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

Residual risks are listed in the final response and are not silently treated as solved by offline tests.

