# Noticeclock — verified Studionet evidence and reviewer checklist

**Evidence date:** 18 October 2026 UTC. **Network:** GenLayer Studionet, chain ID 61999, RPC `https://studio.genlayer.com/api`.

## Canonical contract and proof

- Deployed address: `0xDC02E6856e8DF12b0FaCB5e62a034Cb65a60eB1c`
- Deployment transaction: `0x8577cfc174227d552d3eecf6c57121aae5297b5bfd42e76cbbe1dcf923ef6222`
- Deployment source commit: `e35f8d7bc7c8c9a84986610090dd5ca59c569402` on temporary GitHub workbench branch.
- Deployment job: https://github.com/GIFTEDLOV/driftproof/actions/runs/39110122303
- Live qualification job: https://github.com/GIFTEDLOV/driftproof/actions/runs/39111069673
- Live case: `NCE2E-39111069673`
- Canonical state progression: DRAFT → consented → FROZEN → EVIDENCE_LOCKED → ASSESSED.
- First independently assessed verdict: **READY**.
- Persisted semantic fact vector: breach_identified=true; clause_applicable=true; requested_cure_clear=true; evidence_sufficient=true.
- History entry SHA-256: `a0e4a8c999a610140278d38d2eaa2454a9a12159a766c6ebfc9040e43518d2d6`.
- Live adjudication transaction: `0x955416e32d83fc5de1ad561cbcdc83a65298ad4dbc4ea59b3d54e883027db1ce`.

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

`7137b72ac8a04debd77a4243a3c54884bd626fd30d623d51044153a3b39787c5` (SHA-256 of `contracts/noticeclock.py`). Do not conflate this checksum with the prior first-deployment source; release evidence pertains to the corrected deployment listed above.