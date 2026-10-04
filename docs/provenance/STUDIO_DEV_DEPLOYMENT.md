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

## Deployment #4 runtime-fix deployment

- Candidate version: `0.1.1-rc1`
- Candidate source SHA-256: `dd99595a3cb50392b4ec991b7ccb3f2ffa275fc77e14cac5628ed75a4a3aca99`
- Change: remove `sign=True` from the public `gl.nondet.web.get` call so the SDK default unsigned GET path is used.
- Semantic schema: unchanged, `DRIFTPROOF_SEMANTIC_V1`
- ABI: unchanged, 11 public methods / 8 views / 3 writes
- Deployment #3: preserved as the deployed `0.1.0-rc1` artifact; cannot be patched in place.
- Deployment #4: completed under separate authorization.
- Deployment-time qualification status: pending; the later Deployment #4
  qualification is recorded below and does not alter this historical record.

The candidate preserves the two historical qualification failures, including
`SOURCE_UNAVAILABLE` for `GUA-00000001` and the read-only freeze estimate
failure for `GUA-00000002`.

## Deployment #4 reconciliation record

- Candidate SHA-256: `dd99595a3cb50392b4ec991b7ccb3f2ffa275fc77e14cac5628ed75a4a3aca99`
- Runner: `py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng`
- Signer/account: `agentpact-requester` / `0x61f10cc252ed98ce7596c73fc557cca4cc600c82`
- Nonce: `142`
- Transaction hash: `0x677637386b8a465fe57f07f1eb07ab181c2c0bf065484c4dff7aef490df3828a`
- Fee value: `100000000000010352`
- Fee distribution: authorized complete deployment preset
- Contract: `0x52f6B57373DE9677b5Fc883B59CA4cc3a257B4a1`
- Execution: `FINISHED_WITH_RETURN`
- Lifecycle: `Finalized`
- Stored status code: `7`
- Schema: 11 public methods / 8 views / 3 writes
- Contract info: `DriftProof`, `0.1.1-rc1`, `DRIFTPROOF_SEMANTIC_V1`, 16384 max document bytes
- Initial guard count: `0`
- Initial guard IDs: `[]`
- Source parity: submitted transaction source bytes SHA-256 verified

## Deployment #4 live qualification

Deployment #4 was followed by the authorized three-write qualification on the
same Studio-dev contract. The signer was explicitly verified as
`agentpact-requester` / `0x61f10cc252ed98ce7596c73fc557cca4cc600c82`.

| Operation | Transaction | Nonce | Final status | Execution | Fee value (wei) | Settled cost (wei) | Refund (wei) |
|---|---|---:|---|---|---:|---:|---:|
| `create_guard` | `0x92e7c38d5ade14bb6b8d7565247c723c45257d5b8315d86e4e93b5c9afb27b67` | 143 | Finalized | FINISHED_WITH_RETURN | 378525600010352 | 78635500000823 | 299890100009529 |
| `freeze_baseline` | `0xbade233202339d602501dd04bf3ec414534e364b9f0392ef350c58ef1b2e16e2` | 144 | Finalized | FINISHED_WITH_RETURN | 449029200010352 | 93323750000823 | 355705450009529 |
| `assess_current` | `0xb62064ea123cafbf6e7fb8719fc1b61d6cd36357b848cee08f8cd99032cc536b` | 145 | Finalized | FINISHED_WITH_RETURN | 452240400010352 | 93992750000823 | 358247650009529 |

The canonical guard is `GUA-00000001` and is now `ACTIVE`. The baseline is
`BAS-GUA-00000001`; the first assessment is `ASM-00000001` at generation `1`.
The configured source returned HTTP 200 and two repeated reads matched at
3,223 UTF-8 bytes with SHA-256
`6affda7436ae97bde0668137f6dcde69c2fa4fc1502c1c22d6d0a6d95da4aaaf`. The
baseline and assessment current evidence both match that SHA and byte length.

The canonical verdict is `NO_MATERIAL_CHANGE`, with `evidence_sufficient=true`,
technical status `OK`, and all protected dimensions false. Final account state
was balance `209638566798427093` wei and nonce `146/146`. No retries,
reassessments, deployments, faucet, transfer, or unrelated project writes were
performed in this pass.
