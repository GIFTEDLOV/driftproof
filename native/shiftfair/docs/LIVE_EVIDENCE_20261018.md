# Shiftfair — verified Studionet evidence and reviewer checklist

**Evidence date:** 18 October 2026 UTC. **Network:** GenLayer Studionet, chain ID 61999, RPC `https://studio.genlayer.com/api`.

## Canonical contract and proof

- Deployed address: `0xEEbed1EB184a4BE845286B5EF0003bCbFDB10C0C`
- Deployment transaction: `0x8f65e9aaebad130345b24a60ba09d49de3287d4262a957317f1515d001e082d5`
- Deployment source commit: `e35f8d7bc7c8c9a84986610090dd5ca59c569402` on temporary GitHub workbench branch.
- Deployment job: https://github.com/GIFTEDLOV/driftproof/actions/runs/39110122303
- Live qualification job: https://github.com/GIFTEDLOV/driftproof/actions/runs/39111325157
- Live case: `GN-shiftfair-39111325157`
- Canonical state progression: DRAFT → consented → FROZEN → EVIDENCE_LOCKED → ASSESSED; approved_minutes=90 from requested_minutes=120 and max_minutes=90.
- First independently assessed verdict: **APPROVED**.
- Persisted semantic fact vector: supervisor_authorized=true; attendance_matches_shift=true; evidence_sufficient=true.
- History entry SHA-256: `9d48bf997f005b464f9f2dcfe56479c12b24e96f1e6723af59838f4d0d18447b`.
- Live production preview: https://shiftfair-genlayer.vercel.app (sample dashboard plus read-only GenLayer view; **not** fully live app).

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

`bdac7c6c778fbef9542350613dfb9fd6d73b8b8d4d1e3124816344d2958874e0` (SHA-256 of `contracts/shiftfair.py`). Do not conflate this checksum with the prior first-deployment source; release evidence pertains to the corrected deployment listed above.