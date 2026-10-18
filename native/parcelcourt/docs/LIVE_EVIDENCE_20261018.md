# Parcelcourt — verified Studionet evidence and reviewer checklist

**Evidence date:** 18 October 2026 UTC. **Network:** GenLayer Studionet, chain ID 61999, RPC `https://studio.genlayer.com/api`.

## Canonical contract and proof

- Deployed address: `0x14eBe8440453214CC5a923D5498402d5183A5Bcc`
- Deployment transaction: `0x9ceb46a63225d949f4b238843be44ac235c2c52454352ed9ce064ab3fd661db5`
- Deployment source commit: `e35f8d7bc7c8c9a84986610090dd5ca59c569402` on temporary GitHub workbench branch.
- Deployment job: https://github.com/GIFTEDLOV/driftproof/actions/runs/39110122303
- Live qualification job: https://github.com/GIFTEDLOV/driftproof/actions/runs/39111325157
- Live case: `GN-parcelcourt-39111325157`
- Canonical state progression: DRAFT → consented → FROZEN → EVIDENCE_LOCKED → ASSESSED.
- First independently assessed verdict: **SUPPORTED_DELIVERY**.
- Persisted semantic fact vector: handoff_matches_promise=true; authorized_recipient_supported=true; evidence_sufficient=true.
- History entry SHA-256: `46b76e0d387c643f8ac9a269f0a64aaf2c6f31bdff6123d373807c6ffd8cb12b`.
- Live production preview: https://parcelcourt-genlayer.vercel.app (sample dashboard plus read-only GenLayer view; **not** fully live app).

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

`277c62af5e6c8061489e0f5c5d49db25842df4df2422917f61ca0551aecd08ce` (SHA-256 of `contracts/parcelcourt.py`). Do not conflate this checksum with the prior first-deployment source; release evidence pertains to the corrected deployment listed above.