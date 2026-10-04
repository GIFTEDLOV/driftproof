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

### Qualification recovery attempt #2

- Guard: `GUA-00000002`
- Source: `https://docs.genlayer.com/understand-genlayer-protocol/core-concepts/transactions/transaction-statuses.md`
- Create transaction: `0x0d0dea51122b07924b5f3b71f1287fbbf068aada9d8ad875851ce64d2c2848ff`
- Create result: `FINALIZED / FINISHED_WITH_RETURN`
- Freeze fee simulation: `DRIFTPROOF:SOURCE_UNAVAILABLE`
- Freeze transaction: none broadcast
- Assessment: not run

The attempt was stopped without retry. This second independent
`SOURCE_UNAVAILABLE` observation is preserved as evidence for the signed-web
runtime investigation; it does not invalidate Deployment #3.

## Deployment #4 live qualification

The unsigned public-web runtime fix was qualified on the canonical Deployment
#4 contract `0x52f6B57373DE9677b5Fc883B59CA4cc3a257B4a1` using signer
`0x61f10cc252ed98ce7596c73fc557cca4cc600c82`. Exactly three qualification
writes were broadcast, sequentially, with no retry or reassessment:

### create_guard

- Transaction: `0x92e7c38d5ade14bb6b8d7565247c723c45257d5b8315d86e4e93b5c9afb27b67`
- Nonce: `143`
- Final status/execution: `FINALIZED / FINISHED_WITH_RETURN`
- Fee value: `378525600010352` wei; settled cost `78635500000823` wei; refund `299890100009529` wei.
- Canonical guard: `GUA-00000001`
- Creator: `0x61f10cc252ed98ce7596c73fc557cca4cc600c82`
- State after creation: `DRAFT`

The guard binds authority `genlayerlabs/genlayer-docs/transaction-statuses`,
host `docs.genlayer.com`, the exact Markdown path and URL, all six protected
dimensions, and a 16,384-byte maximum.

### freeze_baseline

- Transaction: `0xbade233202339d602501dd04bf3ec414534e364b9f0392ef350c58ef1b2e16e2`
- Nonce: `144`
- Final status/execution: `FINALIZED / FINISHED_WITH_RETURN`
- Fee value: `449029200010352` wei; settled cost `93323750000823` wei; refund `355705450009529` wei.
- Baseline: `BAS-GUA-00000001`
- URL: `https://docs.genlayer.com/understand-genlayer-protocol/core-concepts/transactions/transaction-statuses.md`
- Source: HTTP 200, 3,223 UTF-8 bytes, SHA-256 `6affda7436ae97bde0668137f6dcde69c2fa4fc1502c1c22d6d0a6d95da4aaaf`
- Canonical state: `BASELINE_FROZEN`

### assess_current

- Transaction: `0xb62064ea123cafbf6e7fb8719fc1b61d6cd36357b848cee08f8cd99032cc536b`
- Nonce: `145`
- Final status/execution: `FINALIZED / FINISHED_WITH_RETURN`
- Fee value: `452240400010352` wei; settled cost `93992750000823` wei; refund `358247650009529` wei.
- Assessment: `ASM-00000001`
- Generation: `1`
- Baseline SHA: `6affda7436ae97bde0668137f6dcde69c2fa4fc1502c1c22d6d0a6d95da4aaaf`
- Current SHA: `6affda7436ae97bde0668137f6dcde69c2fa4fc1502c1c22d6d0a6d95da4aaaf`
- Verdict: `NO_MATERIAL_CHANGE`
- Evidence sufficient: `true`
- Semantic vector: all protected dimensions `false`; `evidence_sufficient=true`
- Technical status: `OK`

Final canonical state is one guard (`GUA-00000001`), `ACTIVE`, generation `1`,
with one append-only assessment history entry. Final signer state was balance
`209638566798427093` wei and nonce `146/146`. No deployment, faucet, transfer,
or other-project write occurred in this qualification pass.

`LIVE_QUALIFICATION=VERIFIED`.
