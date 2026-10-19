# MilestoneProof — verified deployment

- Network: Studionet, chain 61999; RPC `https://studio.genlayer.com/api`.
- Address: [0xD4AdDBe785176EfC96da0B371FfBa03C5ff6c0c9](https://explorer-studio.genlayer.com/address/0xD4AdDBe785176EfC96da0B371FfBa03C5ff6c0c9)
- Deployment transaction: `0x7ab4dad98b090ca61919141fe7968f495239af117e7aed3503cb426c5e82aaab`.
- Deployed source SHA-256: `1b7a7424b4195ff6df0bd622aa9cdfce79aba2e49a05feb00a9385dafae8610b`. Source file: `contracts/milestoneproof.py`.
- CLI deployment and installed-source parity both passed [run 39238219709](https://github.com/GIFTEDLOV/driftproof/actions/runs/39238219709).
- Complete successful live qualification: [run 39238668302](https://github.com/GIFTEDLOV/driftproof/actions/runs/39238668302) with case `GNEW-milestoneproof-39238668302`. Every write included GenVM execution success and matching canonical state, not just FINALIZED status.
- No redeployment or source mutation is authorized or needed for documentation.