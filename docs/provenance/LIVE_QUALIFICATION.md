# DriftProof live qualification attempt

Network: Studio-dev (chain 61997)  
Contract: `0xf7D72f3736A570559900F6eDec9424ac4Ad81992`  
Signer: `0x61f10cc252ed98ce7596c73fc557cca4cc600c82`  
Contract SHA-256: `82d2f653dde89c8b44176e696f970563f34502f14622151f669251c912cf6e0b`

## Result

The authorized sequence was stopped after `freeze_baseline` finalized with a
technical execution failure. No retry and no assessment transaction were
submitted.

### create_guard

- Transaction nonce: `139`
- Transaction hash: not recovered from the interrupted CLI output
- Canonical guard: `GUA-00000001`
- Canonical creator: `0x61F10Cc252eD98Ce7596c73fc557cca4cc600c82`
- State: `DRAFT`
- Guard count: `1`
- The persisted guard fields match the authorized live-main GitHub document
  authority, URL, path prefix, six protected dimensions, and 16384-byte limit.

The missing hash is preserved as an evidence limitation; the state and nonce
delta prove one create transaction was broadcast and persisted.

### freeze_baseline

- Transaction: `0xf0b8c3029aa9dda9e0e340e3cc1857dfe196820338230f74795da796a32b823a`
- Nonce: `140`
- Final status: `FINALIZED`
- Execution: `FINISHED_WITH_ERROR`
- Result: `DRIFTPROOF:SOURCE_UNAVAILABLE`
- Baseline: not created
- Guard state after reconciliation: `DRAFT`
- Assessment history: `[]`

The receipt recorded a 79,952,000,000,823 wei settled cost and a
303,817,600,009,529 wei refund. The validator/leader result was a technical
source-unavailable outcome for the authoritative raw GitHub URL.

### assess_current

Not submitted. No assessment, generation, verdict, or result-shopping retry
occurred.

## Account accounting

- Before create: nonce `139`, balance `210220564048432854` wei
- After create: nonce `140`, balance `210141927798432031` wei
- After freeze: nonce `141`, balance `210061975798431208` wei
- Final latest/pending nonce: `141` / `141`
- Total qualification writes broadcast: `2`

Qualification is incomplete and remains not proven. A future qualification
attempt requires separate authorization and an authority source reachable by
the Studio-dev validator set; the existing DRAFT guard cannot be refrozen.
