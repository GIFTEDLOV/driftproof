# MilestoneProof — Threat Model and Internal Audit

Scope: `contracts/milestoneproof.py`, public GenVM ABI, actual deployed-byte hash and canonical live case. Audited against previously observed integration, consensus and steward-rejection risks. This is an internal review, **not** an independent external certification.

- Three distinct actors; wrong signer, self-counterparty and zero-address rejection.
- Explicitly frozen rule and deterministic deadline; contract transaction time is authoritative.
- External records hash-bound and signed by pre-nominated attestor wallet; NOT independently authenticated off-chain.
- Fixed model-owned instructions with attacker-controlled evidence/claims canonicalized as JSON data. Strict typed boolean keys; validator independently evaluates.
- Model output never sets recipients, funds, deadlines or contract terms. Mismatches or missing evidence do not silently approve.
- Both parties may challenge first-round assessment; round-two reconsideration and deterministic finalization; 24-hour protection for lone challenger.
- Evidence and rule integrity SHA-256; duplicate case and replay guards; hash-linked case history; bounded input and paginated reads.
- Wallet SDK `Address` objects and valid hex strings supported, regression-checked.
- No reentrant fund transfer, token custody or smart-contract outward payment path.
- GenLayer finality and independent successful GenVM execution plus canonical state verified in live workflow.
- Source SHA-256 exact on Studionet; no Critical or High issue identified by the internal audit.

**External dependence / known risks:** Wallet attestation does not verify actual client identity, scope completion, source authenticity or an enforceable contractual obligation. The contract does not custody funds, execute payment or ensure physical completion; live demonstration evidence is synthetic. Public RPC and validator/model availability can be rate-limited. Cases are append-only without pruning. No formal independent third-party audit or real-world issuer authentication.