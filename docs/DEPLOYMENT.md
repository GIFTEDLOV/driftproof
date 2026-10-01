# Studio-dev deployment candidate

Target network: Studio-dev, chain ID 61997.

No deployment is performed in this forensic run. A prior deployment submission reverted before contract creation with `FeeValueMustBeNonZero(1)` because the CLI path supplied only `--fee-value` and the installed SDK normalized the missing distribution to zero defaults. The raw transaction and complete replacement preset are recorded in `docs/provenance/FAILED_DEPLOYMENT_FEE_FORENSICS.json`.

Before any separately authorized deployment:

1. Confirm the release-candidate worktree is clean.
2. Re-run contract tests, adversarial tests, state-machine/property tests, mutation checks, Python compile, Pyright or the documented limitation, GenVM lint, semantic validation, schema extraction, and secret scan.
3. Confirm `docs/provenance/RELEASE_MANIFEST.json` matches the committed contract blob SHA-256.
4. Use the installed GenLayer CLI/Studio workflow for chain 61997. Do not use a different SDK family or a generated frontend.
5. Pass the complete `fees.distribution` and `feeValue` object produced by the official estimator; do not use `--fee-value` alone.
6. Record the deployment transaction/address only after the write succeeds, and update the manifest in a follow-up commit.

Current state: no contract address exists and no successful deployment is recorded. The prior failed submission consumed nonce 120; this forensic run broadcast zero transactions.
