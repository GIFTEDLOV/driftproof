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

Historical Deployment #3 state: contract deployment and readback succeeded, but
the observed transaction sender differs from the authorized deployer. No
qualification writes were performed against Deployment #3.

## Deployment #4 runtime-fix deployment

Deployment #4 completed with source SHA-256
`dd99595a3cb50392b4ec991b7ccb3f2ffa275fc77e14cac5628ed75a4a3aca99`.
It removes the unnecessary `sign=True` option from public evidence retrieval;
authority, HTTPS, redirect, byte-limit, UTF-8, digest, semantic, and lifecycle
controls are unchanged.

- Transaction: `0x677637386b8a465fe57f07f1eb07ab181c2c0bf065484c4dff7aef490df3828a`
- Contract: `0x52f6B57373DE9677b5Fc883B59CA4cc3a257B4a1`
- Sender: authorized `agentpact-requester` (`0x61f10cc252ed98ce7596c73fc557cca4cc600c82`)
- Nonce: `142`
- Execution: `FINISHED_WITH_RETURN`
- Status: `Finalized`

Deployment #3 remains preserved as the prior historical deployment. Deployment
#4 live qualification is now complete:

- `create_guard`: `0x92e7c38d5ade14bb6b8d7565247c723c45257d5b8315d86e4e93b5c9afb27b67`, nonce `143`, `FINALIZED / FINISHED_WITH_RETURN`.
- `freeze_baseline`: `0xbade233202339d602501dd04bf3ec414534e364b9f0392ef350c58ef1b2e16e2`, nonce `144`, `FINALIZED / FINISHED_WITH_RETURN`.
- `assess_current`: `0xb62064ea123cafbf6e7fb8719fc1b61d6cd36357b848cee08f8cd99032cc536b`, nonce `145`, `FINALIZED / FINISHED_WITH_RETURN`.

The canonical guard is `GUA-00000001`, baseline `BAS-GUA-00000001`, and first
assessment `ASM-00000001`. The configured source was HTTP 200 and stable at
3,223 UTF-8 bytes with SHA-256
`6affda7436ae97bde0668137f6dcde69c2fa4fc1502c1c22d6d0a6d95da4aaaf` at both
baseline and assessment. Generation `1` returned `NO_MATERIAL_CHANGE` with
`evidence_sufficient=true` and all protected semantic dimensions false.

Settled costs were `78635500000823`, `93323750000823`, and `93992750000823`
wei respectively. Final account state was balance `209638566798427093` wei
and nonce `146/146`. `LIVE_QUALIFICATION=VERIFIED`.
