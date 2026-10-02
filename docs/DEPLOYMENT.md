# Studio-dev deployment

Target network: Studio-dev, chain ID 61997.

Deployment #3 completed with `FINISHED_WITH_RETURN` and readback verification.

- Contract: `0xf7D72f3736A570559900F6eDec9424ac4Ad81992`
- Transaction: `0xc6b1fed8ae8e20b89a7a1a805bb8cf009d0f865fb073cce14b4fa5e2b2c0aff0`
- Source SHA-256: `82d2f653dde89c8b44176e696f970563f34502f14622151f669251c912cf6e0b`
- Runner: `py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng`
- Execution: `FINISHED_WITH_RETURN`
- Qualification: `PENDING`

Important operational finding: the transaction sender exposed by Studio-dev was `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`, not the authorized deployer `0x61f10cc252ed98ce7596c73fc557cca4cc600c82`. The authorized account remained at nonce 126. This deployment is therefore readback-verified but has a signer-authorization discrepancy; it must not be represented as signed by the authorized account.

Deployments #1 and #2 remain preserved in `docs/provenance/FAILED_DEPLOYMENT_FEE_FORENSICS.json` and `docs/provenance/STUDIO_DEV_DEPLOYMENT.md`.

Before any separately authorized deployment:

1. Confirm the release-candidate worktree is clean.
2. Re-run contract tests, adversarial tests, state-machine/property tests, mutation checks, Python compile, Pyright or the documented limitation, GenVM lint, semantic validation, schema extraction, and secret scan.
3. Confirm `docs/provenance/RELEASE_MANIFEST.json` matches the committed contract blob SHA-256.
4. Use the installed GenLayer CLI/Studio workflow for chain 61997. Do not use a different SDK family or a generated frontend.
5. Pass the complete `fees.distribution` and `feeValue` object produced by the official estimator; do not use `--fee-value` alone.
6. Treat `0xc6b1fed8ae8e20b89a7a1a805bb8cf009d0f865fb073cce14b4fa5e2b2c0aff0` as the only deployment transaction from this run. Do not retry or deploy again. Resolve the signer configuration before any future authorized write.

Current state: contract deployment and readback succeeded, but the observed transaction sender differs from the authorized deployer. No qualification writes were performed.
