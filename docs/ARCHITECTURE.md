# DriftProof architecture

## Deterministic boundary

The contract owns guard identity, normalized authority metadata, the frozen baseline, state transitions, generation counters, append-only assessment records, duplicate suppression, and verdict derivation. These operations do not depend on model prose.

## Nondeterministic boundary

`_retrieve_document` calls the installed GenLayer `gl.nondet.web.get` API using its default unsigned public-GET behavior. `_semantic_once` calls `gl.nondet.exec_prompt(..., response_format="json")`. `assess_current` invokes both through `gl.vm.run_nondet`; the validator independently performs retrieval and evaluation and compares a schema-exact canonical assessment identity, not just the semantic vector. Request signing is not required for DriftProof's public HTTPS evidence model and is intentionally not requested by the release candidate.

The consensus result is bounded to guard ID, baseline digest, semantic schema, both generation bindings, typed technical status, the eight-key vector, and a complete evidence envelope. Generated prose is never stored or compared. `observed_at` is validated and stored as leader-local provenance, but is explicitly excluded from consensus identity, replay keys, and verdict derivation because wall-clock observations can differ between nodes.

## Authority and evidence

Each guard stores a normalized authority ID, IDNA-normalized hostname, path prefix, baseline URL, protected dimensions, and maximum document size. Baseline retrieval must remain on that host and path. Current retrieval uses the frozen baseline URL; exposed final URLs and redirects are checked again.

Baseline and current evidence use exact UTF-8 byte lengths and SHA-256 digests. Baselines are written once. Current evidence is captured into each assessment with source URL, effective URL, digest, byte length, content, observation time, and generation.

## Storage model

JSON records are canonicalized before being written to `TreeMap` fields. `DynArray` indexes preserve guard and assessment order. Assessment history is append-only; an assessment ID is never reused. The duplicate key includes guard, baseline digest, technical status, source/effective URL, verified content SHA-256, and exact byte length. It deliberately omits generation, observation time, and the semantic vector so the same observed document/status cannot be result-shopped across writes; the full content is already cryptographically bound by the verified SHA-256.
