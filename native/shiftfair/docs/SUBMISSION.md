# ShiftFair — Governed Workforce Policy and Overtime Workspace — GenLayer Submission Packet

**Contribution category:** Projects  
**Stage:** Deployed and positive-path consensus-qualified on Studionet; additional release checks identified below.  
**Submission preparation date:** 18 October 2026

## The problem

Hours are arithmetic, but whether a written supervisor instruction authorizes a shift change and whether attendance corresponds to it requires interpreting evidence. A private operator should not decide it unilaterally.

## Why GenLayer consensus is essential

Three booleans: `supervisor_authorized`, `attendance_matches_shift`, `evidence_sufficient`. Leader and validators independently inspect frozen written policy and evidence. These checks are evaluated using GenLayer's `gl.vm.run_nondet_unsafe` with a substantive independent validator, not format-only acceptance. The LLM cannot select business amounts, actor authorizations, settlement transfers, or arbitrary new status fields.

## Deterministic protocol and state

The contract deterministically caps approved minutes: a claimed 120-minute extension results in 90 allowed minutes under a 90-minute cap. No wage transfers or employment-law judgments. The lifecycle is **DRAFT → FROZEN → EVIDENCE_LOCKED → ASSESSED** with explicit consent, challenge and append-only audit linkage. Untrusted model strings are strict-schema parsed; violations do not become business outcomes. All writes are actor-bound and idempotency protected.

## Reviewer links

- **Repository source path:** https://github.com/GIFTEDLOV/driftproof/tree/workbench/genlayer-four-native-20261018/native/shiftfair
- **Contract source SHA-256:** `bdac7c6c778fbef9542350613dfb9fd6d73b8b8d4d1e3124816344d2958874e0`
- **Studionet chain:** 61999
- **Deployed contract:** `0xEEbed1EB184a4BE845286B5EF0003bCbFDB10C0C`
- **Deployment transaction:** `0x8f65e9aaebad130345b24a60ba09d49de3287d4262a957317f1515d001e082d5`
- **Positive live case:** `GN-shiftfair-39111325157`
- **Final recorded verdict:** `APPROVED`
- **Adjudication transaction:** `0xf48e1068c39d404dc4c5063411dbaf2337c67bdcec7194ec30cc7dc9a994aee0`
- **Audit entry hash:** `9d48bf997f005b464f9f2dcfe56479c12b24e96f1e6723af59838f4d0d18447b`
- **Independent consensus evidence:** https://github.com/GIFTEDLOV/driftproof/actions/runs/39111325157
- **Contract-linter and mocked tests:** https://github.com/GIFTEDLOV/driftproof/actions/runs/39110033698
- **Working application:** https://shiftfair-genlayer.vercel.app
- **Source + security docs:** `contracts/shiftfair.py`, `docs/THREAT_MODEL.md`, `docs/LIVE_EVIDENCE_20261018.md`, `docs/DEPLOYMENT.md`, `manifest.json`.

## Five-step reproducible demonstration

Open browser → inspect weekly schedule and sample conflict → On-chain → read actual case → connect Studionet wallet → create, consent, freeze, assess and challenge.

The live-qualification case above has already exercised two distinct accounts and finalized a semantic result with actual GenLayer validators. This is not a fixture masquerading as a network transaction. The app's sample records are explicitly separate from canonical blockchain records.

## Important limits and reviewer disclosure

- **Evidence authenticity:** the contract guarantees frozen submitted text and independent semantic consensus over that text; it cannot prove the real-world identity or truth of an off-chain issuer, sender, carrier, employer or invoice source.
- **No real-world authority:** no payout, custody, external legal decision, tax assessment or official employment adjudication is performed.
- **Release scope:** First-round positive-path consensus has passed; live adversarial paths, second-round appeals, and third-party wallet browser signing require separate verification. If the published challenge job passes, update this statement with its exact evidence.
- **GitHub layout:** these are four distinct build directories on a temporary branch of `GIFTEDLOV/driftproof`, not four new independent repositories. The connected GitHub API does not expose repository creation.
- **Portal:** ready for reviewer inspection in their current category, but do not assert Portal submission or full release qualification without the outstanding gates.