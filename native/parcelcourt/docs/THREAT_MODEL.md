# Threat model — Parcelcourt

**Adversaries:** forged actor, compromised participant, malicious text author, validator with arbitrary output, replay attacker, hostile RPC endpoint, compromised UI or wallet extension.

**Controls present:** actor-bound state transitions; mutual consent before rule freeze; one-time immutable evidence; bounded UTF-8 and model-output schemas; typed boolean results; canonical validator rerun; hash-linked assessment chain; time windows; challenge limit; deterministic business verdict and integer computation.

**Limitations:** Carrier observations and recipient identity are not independently authenticated; the outcome is only an assessment of submitted evidence. Relative timestamp uses GenVM's transaction timestamp, not host real-world time. Content hashes prove immutability *after submission*, not authenticity. No source provenance signatures are independently verified by the contract. Re-running LLMs is substantive consensus but may disagree, rotate leaders or return undetermined. Prompt injection defenses are semantic instructions and strict output parsers, not formal guarantees. No custodied assets or external transfers.

**Release-blocking tests:** GenVM lint/schema and ABI; direct leader tests; independent full-consensus integration for positive, negative, inconclusive and injection cases; success of transaction execution (not only finality); exact deployed source/ABI parity; browser wallet and readback.