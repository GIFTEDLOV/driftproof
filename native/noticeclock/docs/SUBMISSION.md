# NoticeClock — Consent-bound Notice/Cure Adjudicator — GenLayer Submission Packet

**Contribution category:** Intelligent Contracts  
**Stage:** Deployed and positive-path consensus-qualified on Studionet; additional release checks identified below.  
**Submission preparation date:** 18 October 2026

## The problem

Parties disagree about whether a notice actually identifies the operative breach, relevant clause, and required cure. Treating a submitted LLM answer as binding gives one participant unilateral authority.

## Why GenLayer consensus is essential

Four fixed boolean semantics: `breach_identified`, `clause_applicable`, `requested_cure_clear`, `evidence_sufficient`. A validator independently repeats the analysis and compares the entire canonical object. These checks are evaluated using GenLayer's `gl.vm.run_nondet_unsafe` with a substantive independent validator, not format-only acceptance. The LLM cannot select business amounts, actor authorizations, settlement transfers, or arbitrary new status fields.

## Deterministic protocol and state

Only the deterministic outcome `READY`, `INVALID`, or `INCONCLUSIVE` is stored; input parties must consent to rules, a bounded deadline and evidence commitment, while challenge history is hash-linked. The lifecycle is **DRAFT → FROZEN → EVIDENCE_LOCKED → ASSESSED** with explicit consent, challenge and append-only audit linkage. Untrusted model strings are strict-schema parsed; violations do not become business outcomes. All writes are actor-bound and idempotency protected.

## Reviewer links

- **Repository source path:** https://github.com/GIFTEDLOV/driftproof/tree/workbench/genlayer-four-native-20261018/native/noticeclock
- **Contract source SHA-256:** `7137b72ac8a04debd77a4243a3c54884bd626fd30d623d51044153a3b39787c5`
- **Studionet chain:** 61999
- **Deployed contract:** `0xDC02E6856e8DF12b0FaCB5e62a034Cb65a60eB1c`
- **Deployment transaction:** `0x8577cfc174227d552d3eecf6c57121aae5297b5bfd42e76cbbe1dcf923ef6222`
- **Positive live case:** `NCE2E-39111069673`
- **Final recorded verdict:** `READY`
- **Adjudication transaction:** `0x955416e32d83fc5de1ad561cbcdc83a65298ad4dbc4ea59b3d54e883027db1ce`
- **Audit entry hash:** `a0e4a8c999a610140278d38d2eaa2454a9a12159a766c6ebfc9040e43518d2d6`
- **Independent consensus evidence:** https://github.com/GIFTEDLOV/driftproof/actions/runs/39111069673
- **Contract-linter and mocked tests:** https://github.com/GIFTEDLOV/driftproof/actions/runs/39110033698
- **Working application:** Not applicable: standalone Intelligent Contract
- **Source + security docs:** `contracts/noticeclock.py`, `docs/THREAT_MODEL.md`, `docs/LIVE_EVIDENCE_20261018.md`, `docs/DEPLOYMENT.md`, `manifest.json`.

## Five-step reproducible demonstration

Create notice → counterparty consent → freeze clause → submit notice text → GenLayer adjudication → inspect verdict and audit history.

The live-qualification case above has already exercised two distinct accounts and finalized a semantic result with actual GenLayer validators. This is not a fixture masquerading as a network transaction. The app's sample records are explicitly separate from canonical blockchain records.

## Important limits and reviewer disclosure

- **Evidence authenticity:** the contract guarantees frozen submitted text and independent semantic consensus over that text; it cannot prove the real-world identity or truth of an off-chain issuer, sender, carrier, employer or invoice source.
- **No real-world authority:** no payout, custody, external legal decision, tax assessment or official employment adjudication is performed.
- **Release scope:** First-round positive-path consensus has passed; live adversarial paths, second-round appeals, and third-party wallet browser signing require separate verification. If the published challenge job passes, update this statement with its exact evidence.
- **GitHub layout:** these are four distinct build directories on a temporary branch of `GIFTEDLOV/driftproof`, not four new independent repositories. The connected GitHub API does not expose repository creation.
- **Portal:** ready for reviewer inspection in their current category, but do not assert Portal submission or full release qualification without the outstanding gates.