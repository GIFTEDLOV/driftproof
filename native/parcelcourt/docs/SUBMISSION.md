# ParcelCourt — Proof-of-delivery Resolution Workspace — GenLayer Submission Packet

**Contribution category:** Projects  
**Stage:** Deployed and positive-path consensus-qualified on Studionet; additional release checks identified below.  
**Submission preparation date:** 18 October 2026

## The problem

Carrier-arrival scans and recipient acceptance are not equivalent. Sellers and buyers need a reviewable frozen handoff obligation and evidence trail, rather than a unilateral status assertion.

## Why GenLayer consensus is essential

Three booleans: `handoff_matches_promise`, `authorized_recipient_supported`, `evidence_sufficient`. Leader and validators independently examine the exact same frozen written rule and immutable evidence. These checks are evaluated using GenLayer's `gl.vm.run_nondet_unsafe` with a substantive independent validator, not format-only acceptance. The LLM cannot select business amounts, actor authorizations, settlement transfers, or arbitrary new status fields.

## Deterministic protocol and state

Deterministically records `SUPPORTED_DELIVERY`, other bounded evidence outcomes, and challenge windows, with append-only history and no custody or legal ruling. The lifecycle is **DRAFT → FROZEN → EVIDENCE_LOCKED → ASSESSED** with explicit consent, challenge and append-only audit linkage. Untrusted model strings are strict-schema parsed; violations do not become business outcomes. All writes are actor-bound and idempotency protected.

## Reviewer links

- **Repository source path:** https://github.com/GIFTEDLOV/driftproof/tree/workbench/genlayer-four-native-20261018/native/parcelcourt
- **Contract source SHA-256:** `277c62af5e6c8061489e0f5c5d49db25842df4df2422917f61ca0551aecd08ce`
- **Studionet chain:** 61999
- **Deployed contract:** `0x14eBe8440453214CC5a923D5498402d5183A5Bcc`
- **Deployment transaction:** `0x9ceb46a63225d949f4b238843be44ac235c2c52454352ed9ce064ab3fd661db5`
- **Positive live case:** `GN-parcelcourt-39111325157`
- **Final recorded verdict:** `SUPPORTED_DELIVERY`
- **Adjudication transaction:** `0xff3696bc50a6b988de0146950e6eb21cefde20c1158196c1998d1d959eb80719`
- **Audit entry hash:** `46b76e0d387c643f8ac9a269f0a64aaf2c6f31bdff6123d373807c6ffd8cb12b`
- **Independent consensus evidence:** https://github.com/GIFTEDLOV/driftproof/actions/runs/39111325157
- **Contract-linter and mocked tests:** https://github.com/GIFTEDLOV/driftproof/actions/runs/39110033698
- **Working application:** https://parcelcourt-genlayer.vercel.app
- **Source + security docs:** `contracts/parcelcourt.py`, `docs/THREAT_MODEL.md`, `docs/LIVE_EVIDENCE_20261018.md`, `docs/DEPLOYMENT.md`, `manifest.json`.

## Five-step reproducible demonstration

Open browser → On-chain → read the live contract and qualification case → connect Studionet wallet → create case → counterparty consent → freeze, evidence, assess and challenge.

The live-qualification case above has already exercised two distinct accounts and finalized a semantic result with actual GenLayer validators. This is not a fixture masquerading as a network transaction. The app's sample records are explicitly separate from canonical blockchain records.

## Important limits and reviewer disclosure

- **Evidence authenticity:** the contract guarantees frozen submitted text and independent semantic consensus over that text; it cannot prove the real-world identity or truth of an off-chain issuer, sender, carrier, employer or invoice source.
- **No real-world authority:** no payout, custody, external legal decision, tax assessment or official employment adjudication is performed.
- **Release scope:** First-round positive-path consensus has passed; live adversarial paths, second-round appeals, and third-party wallet browser signing require separate verification. If the published challenge job passes, update this statement with its exact evidence.
- **GitHub layout:** these are four distinct build directories on a temporary branch of `GIFTEDLOV/driftproof`, not four new independent repositories. The connected GitHub API does not expose repository creation.
- **Portal:** ready for reviewer inspection in their current category, but do not assert Portal submission or full release qualification without the outstanding gates.