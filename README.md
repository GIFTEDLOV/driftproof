# NoticeClock — independently reviewed GenLayer Intelligent Contract

Deployed on **GenLayer Studionet (chain 61999)** at `0x99D41333f28913BA45Fc36C64eb0A88D1600F350`.

Installed source SHA-256: `b968431218e2b8e1e24264a13a81c9cadde7a2d321e661df50e907dbed545e13`. This is the exact immutable V4 source deployed in [the Studionet source-parity run](https://github.com/GIFTEDLOV/driftproof/actions/runs/39138161003), not any later undeployed revision.

The contract's complete three-actor create, consent, freeze, evidence, issuer-key attestation, AI assessment, dual-party challenge, reassessment, and terminal finalization lifecycle passed live at case `NCQUAL-39142055216`. Read [the evidence and transaction receipts](https://github.com/GIFTEDLOV/driftproof/actions/runs/39142055216). The tested verdict was **INCONCLUSIVE**, which is an actual valid decision, not automatic approval.

Run `python -m unittest discover -s tests -p test_contract.py -v` and `genvm-lint check contracts/noticeclock.py` locally. GitHub Actions verifies syntax, mocked regressions, linter, ABI, and source digest.

**Trust limitation:** an agreed attestor wallet signature binds a hash to that key; it does not independently prove the wallet belongs to a real-world issuer or that the source record is true. This source branch is temporary staging within DriftProof, not a separate dedicated repository or GenLayer Portal submission.
