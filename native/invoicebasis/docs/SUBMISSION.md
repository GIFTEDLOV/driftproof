# InvoiceBasis — Consensus-bound Invoice Eligibility Classification — GenLayer Submission Packet

**Contribution category:** Intelligent Contracts  
**Stage:** Deployed and positive-path consensus-qualified on Studionet; additional release checks identified below.  
**Submission preparation date:** 18 October 2026

## The problem

Contracting parties may disagree whether an invoice item is an eligible software license charge or an excluded tax/refund. An AI model must not be empowered to set money values or change commercial terms.

## Why GenLayer consensus is essential

Three closed booleans: `in_eligible_class`, `exclusion_applies`, `evidence_sufficient`. Validators independently reevaluate the frozen agreement and invoice evidence, using canonical equality. These checks are evaluated using GenLayer's `gl.vm.run_nondet_unsafe` with a substantive independent validator, not format-only acceptance. The LLM cannot select business amounts, actor authorizations, settlement transfers, or arbitrary new status fields.

## Deterministic protocol and state

Strictly deterministic integer arithmetic computes a 333-minor-unit share for a qualifying 999-unit invoice at 1/3. `REVIEW_REQUIRED` is distinct from `INELIGIBLE`; no funds move. The lifecycle is **DRAFT → FROZEN → EVIDENCE_LOCKED → ASSESSED** with explicit consent, challenge and append-only audit linkage. Untrusted model strings are strict-schema parsed; violations do not become business outcomes. All writes are actor-bound and idempotency protected.

## Reviewer links

- **Repository source path:** https://github.com/GIFTEDLOV/driftproof/tree/workbench/genlayer-four-native-20261018/native/invoicebasis
- **Contract source SHA-256:** `6b74512ab8ea611b6800d0efbc7d4e7a45d1c67745d9fac34e03f9f4a63c5c54`
- **Studionet chain:** 61999
- **Deployed contract:** `0x0f0feAeE0AeAa4c98551622B074436565505A821`
- **Deployment transaction:** `0x0b8959e66e7eac779c3747c55853c90ee51e19a728e2de046e7b0c24f7217613`
- **Positive live case:** `GN-invoicebasis-39111325157`
- **Final recorded verdict:** `ELIGIBLE`
- **Adjudication transaction:** `0x56ccb02f531b22e00cdec65291fe569536ba285dc8e9f8139d0f74b32b5eb012`
- **Audit entry hash:** `92b2c32fa03512864a5acb1702f7391c9b05a08d9db668030c93609318de3aac`
- **Independent consensus evidence:** https://github.com/GIFTEDLOV/driftproof/actions/runs/39111325157
- **Contract-linter and mocked tests:** https://github.com/GIFTEDLOV/driftproof/actions/runs/39110033698
- **Working application:** Not applicable: standalone Intelligent Contract
- **Source + security docs:** `contracts/invoicebasis.py`, `docs/THREAT_MODEL.md`, `docs/LIVE_EVIDENCE_20261018.md`, `docs/DEPLOYMENT.md`, `manifest.json`.

## Five-step reproducible demonstration

Create policy and invoice amount → counterparty consent → freeze → submit immutable line evidence → consensus classify → inspect integer share and audit hash.

The live-qualification case above has already exercised two distinct accounts and finalized a semantic result with actual GenLayer validators. This is not a fixture masquerading as a network transaction. The app's sample records are explicitly separate from canonical blockchain records.

## Important limits and reviewer disclosure

- **Evidence authenticity:** the contract guarantees frozen submitted text and independent semantic consensus over that text; it cannot prove the real-world identity or truth of an off-chain issuer, sender, carrier, employer or invoice source.
- **No real-world authority:** no payout, custody, external legal decision, tax assessment or official employment adjudication is performed.
- **Release scope:** First-round positive-path consensus has passed; live adversarial paths, second-round appeals, and third-party wallet browser signing require separate verification. If the published challenge job passes, update this statement with its exact evidence.
- **GitHub layout:** these are four distinct build directories on a temporary branch of `GIFTEDLOV/driftproof`, not four new independent repositories. The connected GitHub API does not expose repository creation.
- **Portal:** ready for reviewer inspection in their current category, but do not assert Portal submission or full release qualification without the outstanding gates.