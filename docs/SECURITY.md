# Security model

## Threats addressed

Critical findings addressed by construction are baseline replacement, arbitrary verdict submission, authority substitution, history overwrite, and incomplete consensus binding. High-risk controls cover replay/duplicate writes, URL confusion, path-prefix bypass, prompt injection, result shopping by repeated identical content, technical-failure separation, strict schema validation, and UTF-8 byte bounds.

## Input controls

- HTTPS is required; credentials, fragments, unexpected ports, controls, ambiguous path spellings, traversal segments, malformed hosts, and host suffix confusion are rejected.
- Hostnames are IDNA-normalized and compared as complete labels. Paths match exactly or on a segment boundary.
- Document bytes are bounded at 16,384 UTF-8 bytes by default and all stored lengths are byte lengths.
- SHA-256 values must be exactly 64 hexadecimal characters and are normalized to lowercase.
- Model output must be a JSON object with exactly eight keys whose values are native booleans. Missing, extra, nested, null, string-boolean, oversized, or malformed output is rejected.
- Both document bodies are explicitly marked untrusted data in the prompt. Embedded instructions are not executable instructions.
- Public evidence retrieval uses the SDK's default unsigned GET path. This does not weaken source binding: HTTPS, complete host equality, path-prefix rules, redirect checks, exact SHA-256, exact UTF-8 byte length, and validator-independent retrieval remain enforced. HTTP request signing would authenticate a request to an operator signer, not the public document itself.
- The complete nondeterministic assessment envelope is schema-checked before comparison and after consensus. Technical status, guard/baseline context, semantic schema, generation, all eight booleans, source/effective URL, content, SHA-256, and exact byte length are canonicalized and independently bound. Missing, extra, inconsistent, or forged fields reject consensus.
- `observed_at` is the only stored observation metadata excluded from the canonical identity. It is bounded, control-character checked, documented as leader-local provenance, and cannot affect verdict, replay protection, or `identity_sha256`. Replay keys use the verified content SHA-256 and byte length rather than placing the full document in a storage key.

## Failure separation

Network/DNS/timeout/non-2xx failures become `SOURCE_UNAVAILABLE`. Redirect, authority, content-size, UTF-8, and evidence-integrity failures become `EVIDENCE_MISMATCH`. Malformed or unavailable semantic output becomes `INCONCLUSIVE`. None can become `NO_MATERIAL_CHANGE`.

## Audit discipline

The independent red-team record is in `docs/provenance/AUDIT.md`; mutation evidence is in `docs/provenance/MUTATION_AUDIT.json`. Findings are recorded before fixes and the release checks are rerun after fixes.
