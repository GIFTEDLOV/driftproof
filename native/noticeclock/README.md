# Noticeclock

**Category:** Standalone Intelligent Contract  
**Version:** `0.1.0` development candidate  
**Release gate:** Studionet deployed; positive-path independently consensus-qualified; final reviewer/security gates pending

Enforce consent-bound notice/cure rules while GenLayer validators independently classify breach identification, applicability and cure specificity.

## Verified Studionet implementation — October 18, 2026

- Category: **Standalone Intelligent Contract**. Consent-bound notice and cure requirements verified by independent GenLayer semantic consensus.
- Network: GenLayer Studionet (chain 61999)
- Address: `0xDC02E6856e8DF12b0FaCB5e62a034Cb65a60eB1c`
- Deployment tx: `0x8577cfc174227d552d3eecf6c57121aae5297b5bfd42e76cbbe1dcf923ef6222`
- Corrected contract source SHA-256: `7137b72ac8a04debd77a4243a3c54884bd626fd30d623d51044153a3b39787c5`
- Live case: `NCE2E-39111069673`; decision: **READY**
- Adjudication tx: `0x955416e32d83fc5de1ad561cbcdc83a65298ad4dbc4ea59b3d54e883027db1ce`
- Assessment record hash: `a0e4a8c999a610140278d38d2eaa2454a9a12159a766c6ebfc9040e43518d2d6`
- Execution proof: [GitHub Actions run](https://github.com/GIFTEDLOV/driftproof/actions/runs/39111069673).
- Source and release package: [GitHub workbench branch](https://github.com/GIFTEDLOV/driftproof/tree/workbench/genlayer-four-native-20261018/native/noticeclock).

**Evidence limitation:** On-chain validator consensus validates the semantic classification of supplied text; it does not independently authenticate that text's real-world origin. This is not a custody, payment, or legal ruling system. Negative-path live tests and second-round challenge qualification remain pending, as do the separate GitHub repositories requested for final submission.

## Consensus architecture

- Party A creates and freezes an immutable rule and bound deadline; Party B must consent.
- A participating party can submit exactly one immutable evidence object (maximum 4096 UTF-8 bytes); a SHA-256 commitment is recorded.
- `adjudicate()` calls `gl.vm.run_nondet_unsafe`. The leader and each validator independently query an LLM on the exact frozen text and strict closed boolean field schema. Validators compare the entire canonical vector. A formatted output alone cannot pass.
- Python derives the verdict, appeal constraints, and any quantities; the model cannot change amounts or roles.
- Assessments are append-only, sequentially hash-linked; any challenge requires a new validator round and is capped.
- `INCONCLUSIVE`/`REVIEW_REQUIRED` are distinct from rejection and eligibility. A validator disagreement blocks writes.

## Important trust boundary

Understands text, does not prove off-chain delivery. Receipts are party-submitted, and a submitted document can be fabricated.

Threat model: `docs/THREAT_MODEL.md`. Deployment gate and commands: `docs/DEPLOYMENT.md`. Reviewer submission narrative: `docs/SUBMISSION.md`.

## Verification

From this repository root run `python test_native.py` for **mocked direct-model** checks. Requires GenVM environment for actual `genvm-lint check contracts/noticeclock.py`, plus live `gltest` integration with independently responding validators. A Python syntax check or mocked tests are not a live consensus qualification.

## Provenance

Canonical corrected contract SHA-256: `a2a1e6b027e00dd61efaf18fb1c4e89135c83c9ca07b2c2c0dd14cd5e72cc626`. See `manifest.json` for actual deployed transaction provenance and live qualification. Verify code parity on chain before final release.

## Links

- [GenLayer reference](https://docs.genlayer.com/full-documentation.txt)
- [GenLayer development skills](https://github.com/genlayerlabs/skills)
- [Intelligent contract submission guidelines](https://portal.genlayer.foundation/contribution-type/41)