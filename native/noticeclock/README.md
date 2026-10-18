# Noticeclock

**Category:** Standalone Intelligent Contract  
**Version:** `0.1.0` development candidate  
**Release gate:** NOT DEPLOYED / NOT SUBMISSION READY

Enforce consent-bound notice/cure rules while GenLayer validators independently classify breach identification, applicability and cure specificity.

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

Contract SHA-256 before any further edits: `a2a1e6b027e00dd61efaf18fb1c4e89135c83c9ca07b2c2c0dd14cd5e72cc626`. See `manifest.json` for metadata; source hash must be recomputed before deployment.

## Links

- [GenLayer reference](https://docs.genlayer.com/full-documentation.txt)
- [GenLayer development skills](https://github.com/genlayerlabs/skills)
- [Intelligent contract submission guidelines](https://portal.genlayer.foundation/contribution-type/41)