# DriftProof Studio-dev deployment record

Network: `studio-dev`  
Chain ID: `61997`  
RPC: `https://studio-dev.genlayer.com/api`

## Chronology

### Deployment #1 — failed fee encoding

- Transaction: `0x5297032368b68291e0b82784a4f860b8e9bc64f7b53bd8d89fcd42b8a8960d78`
- Nonce: `120`
- Result: failed/reverted
- Error: `FeeValueMustBeNonZero(1)`
- Root cause: partial fee object; omitted distribution fields were zero-filled.

### Deployment #2 — failed runner parsing

- Transaction: `0x797e6a936855695ec088b993d17b26b89e22b3d6b9560e255fe8484b05745dad`
- Nonce: `121`
- Result: `FINALIZED / Accepted / FINISHED_WITH_ERROR`
- Error: `invalid_contract runner malformed`
- Root cause: the runner dependency comment was not terminated by a blank line.

### Deployment #3 — execution and readback

- Transaction / GenLayer transaction ID: `0xc6b1fed8ae8e20b89a7a1a805bb8cf009d0f865fb073cce14b4fa5e2b2c0aff0`
- Contract: `0xf7D72f3736A570559900F6eDec9424ac4Ad81992`
- Observed execution result: `FINISHED_WITH_RETURN`
- Consensus status: `ACCEPTED`
- Source SHA-256: `82d2f653dde89c8b44176e696f970563f34502f14622151f669251c912cf6e0b`
- Runner: `py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng`
- Submitted source bytes: 24,448; wire hash matched the frozen source.
- Fee value: `100000000000010352`
- Fee distribution: leader `100`, validator `200`, appeal rounds `0`, execution budget `25000000000000000`, rotations `[3]`, max price `2`, storage cap `300000000`, receipt cap `300000000`, message allocations `[]`.

## Readback

`contract_info` returned:

- name: `DriftProof`
- version: `0.1.0-rc1`
- semantic schema: `DRIFTPROOF_SEMANTIC_V1`
- max document bytes: `16384`
- public method count: `11`

Initial state:

- guard count: `0`
- guard IDs: `[]`
- deployed schema: 11 public methods, 8 views, 3 writes

## Signer discrepancy

Authorized deployer: `0x61f10cc252ed98ce7596c73fc557cca4cc600c82`  
Observed transaction sender: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

The authorized account remained at nonce `126/126` after deployment. The CLI keystore/configuration therefore used a different account than the authorized signer. This is recorded as a critical operational finding. No replacement deployment was attempted.

`LIVE_QUALIFICATION=PENDING`  
`QUALIFICATION_WRITES=0`  
`GITHUB_PUSHED=NO`
