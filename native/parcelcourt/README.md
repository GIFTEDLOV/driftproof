# Parcelcourt

**Category:** GenLayer application  
**Version:** `0.1.0` development candidate  
**Release gate:** Studionet deployed; positive-path independently consensus-qualified; final reviewer/security gates pending

Maintain frozen parcel handoff promises, signed-party evidence lineage and bounded GenLayer review.

## Verified Studionet implementation — October 18, 2026

- Category: **GenLayer Application**. Buyer/seller proof-of-delivery dispute workflow that independently assesses bounded handoff evidence against frozen promises.
- Network: GenLayer Studionet (chain 61999)
- Address: `0x14eBe8440453214CC5a923D5498402d5183A5Bcc`
- Deployment tx: `0x9ceb46a63225d949f4b238843be44ac235c2c52454352ed9ce064ab3fd661db5`
- Corrected contract source SHA-256: `277c62af5e6c8061489e0f5c5d49db25842df4df2422917f61ca0551aecd08ce`
- Live case: `GN-parcelcourt-39111325157`; decision: **SUPPORTED_DELIVERY**
- Adjudication tx: `0xff3696bc50a6b988de0146950e6eb21cefde20c1158196c1998d1d959eb80719`
- Assessment record hash: `46b76e0d387c643f8ac9a269f0a64aaf2c6f31bdff6123d373807c6ffd8cb12b`
- Execution proof: [GitHub Actions run](https://github.com/GIFTEDLOV/driftproof/actions/runs/39111325157).
- Source and release package: [GitHub workbench branch](https://github.com/GIFTEDLOV/driftproof/tree/workbench/genlayer-four-native-20261018/native/parcelcourt).
- Hosted application: https://parcelcourt-genlayer.vercel.app — includes a verified-chain workspace plus explicitly synthetic sample screens. Browser-wallet signing by third-party wallets not yet independently E2E qualified.

**Evidence limitation:** On-chain validator consensus validates the semantic classification of supplied text; it does not independently authenticate that text's real-world origin. This is not a custody, payment, or legal ruling system. Negative-path live tests and second-round challenge qualification remain pending, as do the separate GitHub repositories requested for final submission.

## Consensus architecture

- Party A creates and freezes an immutable rule and bound deadline; Party B must consent.
- A participating party can submit exactly one immutable evidence object (maximum 4096 UTF-8 bytes); a SHA-256 commitment is recorded.
- `adjudicate()` calls `gl.vm.run_nondet_unsafe`. The leader and each validator independently query an LLM on the exact frozen text and strict closed boolean field schema. Validators compare the entire canonical vector. A formatted output alone cannot pass.
- Python derives the verdict, appeal constraints, and any quantities; the model cannot change amounts or roles.
- Assessments are append-only, sequentially hash-linked; any challenge requires a new validator round and is capped.
- `INCONCLUSIVE`/`REVIEW_REQUIRED` are distinct from rejection and eligibility. A validator disagreement blocks writes.

## Important trust boundary

Carrier observations and recipient identity are not independently authenticated; the outcome is only an assessment of submitted evidence.

Threat model: `docs/THREAT_MODEL.md`. Deployment gate and commands: `docs/DEPLOYMENT.md`. Reviewer submission narrative: `docs/SUBMISSION.md`.

## Verification

From this repository root run `python test_native.py` for **mocked direct-model** checks. Requires GenVM environment for actual `genvm-lint check contracts/parcelcourt.py`, plus live `gltest` integration with independently responding validators. A Python syntax check or mocked tests are not a live consensus qualification.

## Provenance

Canonical corrected contract SHA-256: `6a55f3aca1d8c0c644f25bde9a3727b82cdcaae451bd87e1335974971cf2e2a2`. See `manifest.json` for actual deployed transaction provenance and live qualification. Verify code parity on chain before final release.

## Links

- [GenLayer reference](https://docs.genlayer.com/full-documentation.txt)
- [GenLayer development skills](https://github.com/genlayerlabs/skills)
- [Intelligent contract submission guidelines](https://portal.genlayer.foundation/contribution-type/41)