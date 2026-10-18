# Invoicebasis — verified Studionet evidence and reviewer checklist

**Evidence date:** 18 October 2026 UTC. **Network:** GenLayer Studionet, chain ID 61999, RPC `https://studio.genlayer.com/api`.

## Canonical contract and proof

- Deployed address: `0x0f0feAeE0AeAa4c98551622B074436565505A821`
- Deployment transaction: `0x0b8959e66e7eac779c3747c55853c90ee51e19a728e2de046e7b0c24f7217613`
- Deployment source commit: `e35f8d7bc7c8c9a84986610090dd5ca59c569402` on temporary GitHub workbench branch.
- Deployment job: https://github.com/GIFTEDLOV/driftproof/actions/runs/39110122303
- Live qualification job: https://github.com/GIFTEDLOV/driftproof/actions/runs/39111325157
- Live case: `GN-invoicebasis-39111325157`
- Canonical state progression: DRAFT → consented → FROZEN → EVIDENCE_LOCKED → ASSESSED; payable_minor=333 for gross_minor=999, rate 1/3.
- First independently assessed verdict: **ELIGIBLE**.
- Persisted semantic fact vector: in_eligible_class=true; exclusion_applies=false; evidence_sufficient=true.
- History entry SHA-256: `92b2c32fa03512864a5acb1702f7391c9b05a08d9db668030c93609318de3aac`.

## Verification scope

GitHub-hosted execution confirmed state after every signed lifecycle write. An independent read-only GenLayerJS GitHub Actions runner retrieved contract state and canonical transaction status from Studionet. The validator fact vector was persisted in the contract's append-only history. Source-quality CI passed GenVM lint and nine mocked deterministic tests. These results establish a **successful positive-path live semantic decision** but do not establish full adversarial coverage, browser-wallet integration, or production readiness.

## Outstanding gates

- Run negative-path tests on the live contract: unauthorized caller, duplicate case/evidence, malformed data, insufficient evidence and deadline enforcement.
- Exercise challenge/reconsideration, verify two-round hash-linked history, challenge limits and exact transaction finality.
- Independently verify byte-for-byte parity of released source against the deployed code and document immutable checksums.
- For the applications, replace or clearly segregate every synthetic sample screen from live case views, validate browser wallet signing, transaction fees, finalization and errors end-to-end.
- Publish this contract in its **own** clean GitHub repository and run exact-HEAD CI; no four separate repositories have been verified yet.
- Complete a reviewer dossier, threat-model evidence and manual Portal submission.

**Status:** On-chain positive-path qualified; **not submission-ready**.

## Canonical corrected source checksum

`6b74512ab8ea611b6800d0efbc7d4e7a45d1c67745d9fac34e03f9f4a63c5c54` (SHA-256 of `contracts/invoicebasis.py`). Do not conflate this checksum with the prior first-deployment source; release evidence pertains to the corrected deployment listed above.