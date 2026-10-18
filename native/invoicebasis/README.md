# Invoicebasis

**Category:** Standalone Intelligent Contract  
**Version:** `0.1.0` development candidate  
**Release gate:** Studionet deployed; positive-path independently consensus-qualified; final reviewer/security gates pending

Resolve disputed revenue-share invoice eligibility while keeping fees, percentages and minor-unit arithmetic deterministic.

## Verified Studionet implementation — October 18, 2026

- Category: **Standalone Intelligent Contract**. Invoice item classification against frozen revenue-share eligibility rules, with strictly deterministic minor-unit arithmetic.
- Network: GenLayer Studionet (chain 61999)
- Address: `0x0f0feAeE0AeAa4c98551622B074436565505A821`
- Deployment tx: `0x0b8959e66e7eac779c3747c55853c90ee51e19a728e2de046e7b0c24f7217613`
- Corrected contract source SHA-256: `6b74512ab8ea611b6800d0efbc7d4e7a45d1c67745d9fac34e03f9f4a63c5c54`
- Live case: `GN-invoicebasis-39111325157`; decision: **ELIGIBLE**
- Adjudication tx: `0x56ccb02f531b22e00cdec65291fe569536ba285dc8e9f8139d0f74b32b5eb012`
- Assessment record hash: `92b2c32fa03512864a5acb1702f7391c9b05a08d9db668030c93609318de3aac`
- Execution proof: [GitHub Actions run](https://github.com/GIFTEDLOV/driftproof/actions/runs/39111325157).
- Source and release package: [GitHub workbench branch](https://github.com/GIFTEDLOV/driftproof/tree/workbench/genlayer-four-native-20261018/native/invoicebasis).

**Evidence limitation:** On-chain validator consensus validates the semantic classification of supplied text; it does not independently authenticate that text's real-world origin. This is not a custody, payment, or legal ruling system. Negative-path live tests and second-round challenge qualification remain pending, as do the separate GitHub repositories requested for final submission.

## Consensus architecture

- Party A creates and freezes an immutable rule and bound deadline; Party B must consent.
- A participating party can submit exactly one immutable evidence object (maximum 4096 UTF-8 bytes); a SHA-256 commitment is recorded.
- `adjudicate()` calls `gl.vm.run_nondet_unsafe`. The leader and each validator independently query an LLM on the exact frozen text and strict closed boolean field schema. Validators compare the entire canonical vector. A formatted output alone cannot pass.
- Python derives the verdict, appeal constraints, and any quantities; the model cannot change amounts or roles.
- Assessments are append-only, sequentially hash-linked; any challenge requires a new validator round and is capped.
- `INCONCLUSIVE`/`REVIEW_REQUIRED` are distinct from rejection and eligibility. A validator disagreement blocks writes.

## Important trust boundary

Terms are not legal advice and the input invoice is not independently certified. No monetary settlement is executed.

Threat model: `docs/THREAT_MODEL.md`. Deployment gate and commands: `docs/DEPLOYMENT.md`. Reviewer submission narrative: `docs/SUBMISSION.md`.

## Verification

From this repository root run `python test_native.py` for **mocked direct-model** checks. Requires GenVM environment for actual `genvm-lint check contracts/invoicebasis.py`, plus live `gltest` integration with independently responding validators. A Python syntax check or mocked tests are not a live consensus qualification.

## Provenance

Canonical corrected contract SHA-256: `217eebe4aa84f1c70b2477443ff5607c67edf828fa286e9ff9fb1000667404f5`. See `manifest.json` for actual deployed transaction provenance and live qualification. Verify code parity on chain before final release.

## Links

- [GenLayer reference](https://docs.genlayer.com/full-documentation.txt)
- [GenLayer development skills](https://github.com/genlayerlabs/skills)
- [Intelligent contract submission guidelines](https://portal.genlayer.foundation/contribution-type/41)