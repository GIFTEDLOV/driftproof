# Studio-dev deployment candidate

Target network: Studio-dev, chain ID 61997.

Deployment is intentionally not performed in this run. Before any authorized deployment:

1. Confirm the release-candidate worktree is clean.
2. Re-run contract tests, adversarial tests, state-machine/property tests, mutation checks, Python compile, Pyright or the documented limitation, GenVM lint, semantic validation, schema extraction, and secret scan.
3. Confirm `docs/provenance/RELEASE_MANIFEST.json` matches the committed contract blob SHA-256.
4. Use the installed GenLayer CLI/Studio workflow for chain 61997. Do not use a different SDK family or a generated frontend.
5. Record the deployment transaction/address only after the write succeeds, and update the manifest in a follow-up commit.

Current state: deployment-ready candidate only; no deployment, live address, production claim, or blockchain write is recorded.

