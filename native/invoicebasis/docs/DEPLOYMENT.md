# Deployment runbook — invoicebasis

**Status: No deployment transaction was sent from this source package.**

1. Review contract source and SHA-256. Install `genvm-linter` and `genlayer` CLI; pin a supported GenVM runner.
2. Execute `genvm-lint check contracts/invoicebasis.py` and `genvm-lint schema contracts/invoicebasis.py` (ensure documented ABI matches).
3. Execute independent validator tests with `gltest` (e.g. `gltest tests/integration -v -s --network studionet` after writing integration qualification cases). Mock tests alone are insufficient.
4. Use a **controlled signer** and select the built-in network with `genlayer network set studionet`.
5. Deploy with `genlayer deploy --contract contracts/invoicebasis.py`. Do **not** add a generic `--rpc` flag for a built-in network.
6. Inspect the actual transaction with `genlayer receipt <hash>`. Require `FINALIZED` *and* successful `txExecutionResultName`. Verify `genlayer schema <address>` and contract source hash/ABI; a failed finalized deployment creates no contract.
7. Submit a canonical positive/inconclusive/negative assessment, inspect finality and stored state, and record the evidence.
8. For the two apps, configure the verified contract address and fee profile. Before then, UI writes remain disabled.
9. If Studionet is unreachable, use an explicitly configured alternative built-in testnet only after verifying chain ID, signer ownership and funding; preserve failure evidence. Do not blindly rebroadcast uncertain transactions.

**Current source SHA-256:** `217eebe4aa84f1c70b2477443ff5607c67edf828fa286e9ff9fb1000667404f5`

**Deployment fields intentionally unfilled:** transaction hash, contract address, execution result, receipt proof, ABI proof, chain-specific wallet transaction proof.