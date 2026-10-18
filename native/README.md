# GenLayer — Four Independent Native Deliverables

**Build mode:** Native GenVM Python contracts + official GenLayer CLI and SDK + GitHub Actions + Vercel. No Lovable-generated files or services are used in this deliverable.

Four GenLayer submissions are presented, with isolated source directories. All four are on **Studionet chain 61999** with full live positive-case adjudication verified via GitHub Actions. The two applications are deployed to production Vercel, and their synthetic sample data is segregated from real GenLayer chain reads and writes.

| Project | Submission category | Live consensus result | Studionet address | Application |
| --- | --- | --- | --- | --- |
| NoticeClock | Intelligent Contracts | READY | `0xDC02E6856e8DF12b0FaCB5e62a034Cb65a60eB1c` | Standalone contract |
| InvoiceBasis | Intelligent Contracts | ELIGIBLE, deterministic 333 minor units | `0x0f0feAeE0AeAa4c98551622B074436565505A821` | Standalone contract |
| ParcelCourt | Projects | SUPPORTED_DELIVERY | `0x14eBe8440453214CC5a923D5498402d5183A5Bcc` | https://parcelcourt-genlayer.vercel.app |
| ShiftFair | Projects | APPROVED, 90-minute cap | `0xEEbed1EB184a4BE845286B5EF0003bCbFDB10C0C` | https://shiftfair-genlayer.vercel.app |

## Verified evidence

- GenVM lint and schema validation: https://github.com/GIFTEDLOV/driftproof/actions/runs/39110033698
- Real NoticeClock consensus: https://github.com/GIFTEDLOV/driftproof/actions/runs/39111069673
- Real InvoiceBasis, ParcelCourt and ShiftFair consensus: https://github.com/GIFTEDLOV/driftproof/actions/runs/39111325157
- Typed-Address corrected four contract deployments: https://github.com/GIFTEDLOV/driftproof/actions/runs/39110122303
- Current source branch: https://github.com/GIFTEDLOV/driftproof/tree/workbench/genlayer-four-native-20261018

Each subfolder includes readable source, bounded semantic schema, deterministic result derivation, threat model, exact source hash, a submission dossier and deploy provenance. Run `python test_native.py -v` for modeled behavior checks; this is not a substitute for live consensus. When releasing a version, use exact checked code and verify finalized execution as well as consensus.

## Outstanding truth-in-advertising gates

All four have passed a positive real-network end-to-end decision. That does **not** establish unauthenticated off-chain evidence authenticity, a fully audited contract, or browser-wallet compatibility for every wallet. Four separately created GitHub repositories have **not** been created; these four project directories are published in an isolated workbench branch of an existing user repository. Portal submission remains a user action. Additional negative-path and challenge re-adjudication checks are continuing.