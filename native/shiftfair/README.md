# Shiftfair

**Category:** GenLayer application  
**Version:** `0.1.0` development candidate  
**Release gate:** Studionet deployed; positive-path independently consensus-qualified; final reviewer/security gates pending

Agree work policies and shift evidence, then have independent GenLayer validators classify instruction and attendance semantics.

## Verified Studionet implementation — October 18, 2026

- Category: **GenLayer Application**. Workforce shift changes governed by frozen policies, independent evidence classification and deterministic time caps.
- Network: GenLayer Studionet (chain 61999)
- Address: `0xEEbed1EB184a4BE845286B5EF0003bCbFDB10C0C`
- Deployment tx: `0x8f65e9aaebad130345b24a60ba09d49de3287d4262a957317f1515d001e082d5`
- Corrected contract source SHA-256: `bdac7c6c778fbef9542350613dfb9fd6d73b8b8d4d1e3124816344d2958874e0`
- Live case: `GN-shiftfair-39111325157`; decision: **APPROVED**
- Adjudication tx: `0xf48e1068c39d404dc4c5063411dbaf2337c67bdcec7194ec30cc7dc9a994aee0`
- Assessment record hash: `9d48bf997f005b464f9f2dcfe56479c12b24e96f1e6723af59838f4d0d18447b`
- Execution proof: [GitHub Actions run](https://github.com/GIFTEDLOV/driftproof/actions/runs/39111325157).
- Source and release package: [GitHub workbench branch](https://github.com/GIFTEDLOV/driftproof/tree/workbench/genlayer-four-native-20261018/native/shiftfair).
- Hosted application: https://shiftfair-genlayer.vercel.app — includes a verified-chain workspace plus explicitly synthetic sample screens. Browser-wallet signing by third-party wallets not yet independently E2E qualified.

**Evidence limitation:** On-chain validator consensus validates the semantic classification of supplied text; it does not independently authenticate that text's real-world origin. This is not a custody, payment, or legal ruling system. Negative-path live tests and second-round challenge qualification remain pending, as do the separate GitHub repositories requested for final submission.

## Consensus architecture

- Party A creates and freezes an immutable rule and bound deadline; Party B must consent.
- A participating party can submit exactly one immutable evidence object (maximum 4096 UTF-8 bytes); a SHA-256 commitment is recorded.
- `adjudicate()` calls `gl.vm.run_nondet_unsafe`. The leader and each validator independently query an LLM on the exact frozen text and strict closed boolean field schema. Validators compare the entire canonical vector. A formatted output alone cannot pass.
- Python derives the verdict, appeal constraints, and any quantities; the model cannot change amounts or roles.
- Assessments are append-only, sequentially hash-linked; any challenge requires a new validator round and is capped.
- `INCONCLUSIVE`/`REVIEW_REQUIRED` are distinct from rejection and eligibility. A validator disagreement blocks writes.

## Important trust boundary

An employer or worker can submit false facts. The protocol does not determine employment law or execute wages.

Threat model: `docs/THREAT_MODEL.md`. Deployment gate and commands: `docs/DEPLOYMENT.md`. Reviewer submission narrative: `docs/SUBMISSION.md`.

## Verification

From this repository root run `python test_native.py` for **mocked direct-model** checks. Requires GenVM environment for actual `genvm-lint check contracts/shiftfair.py`, plus live `gltest` integration with independently responding validators. A Python syntax check or mocked tests are not a live consensus qualification.

## Provenance

Canonical corrected contract SHA-256: `10f8a287044200212bd5e6ad420b3de97d0e91f45949c12ae27571718fc929f3`. See `manifest.json` for actual deployed transaction provenance and live qualification. Verify code parity on chain before final release.

## Links

- [GenLayer reference](https://docs.genlayer.com/full-documentation.txt)
- [GenLayer development skills](https://github.com/genlayerlabs/skills)
- [Intelligent contract submission guidelines](https://portal.genlayer.foundation/contribution-type/41)