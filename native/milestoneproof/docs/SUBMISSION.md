# MilestoneProof — GenLayer Portal Submission Information

**Project name:** MilestoneProof

**One line:** Resolve freelance milestone acceptance through frozen scopes, independently validated GenLayer consensus, two-party challenges and deterministic payable-basis calculations.

## Project description

Resolve freelance milestone acceptance through frozen scopes, independently validated GenLayer consensus, two-party challenges and deterministic payable-basis calculations. The trust problem is: Clients and freelancers dispute whether deliverables satisfy agreed natural-language acceptance criteria; AI should not independently change payouts, schedules or responsibilities.

**Why GenLayer:** Leader and validators independently classify deliverable_in_scope, acceptance_criteria_met, material_defect_supported and evidence_sufficient as strict booleans. A bounded deterministic state machine and integer arithmetic derive acceptance and a non-custodial payable basis. A deterministic state machine enforces immutable terms, actor separation, evidence digests, bounded data and deadlines. Both parties can challenge once; the second consensus round incorporates the challenges. No unbounded natural-language output changes on-chain powers or funds.

## Technical links

- GitHub: dedicated repository **not yet published**. Source is in isolated QA branch `workbench/genlayer-new-warrantylens-milestoneproof-20261019` under `native/milestoneproof` of `GIFTEDLOV/driftproof`.
- Deployment: https://explorer-studio.genlayer.com/address/0xD4AdDBe785176EfC96da0B371FfBa03C5ff6c0c9
- App: https://milestoneproof-genlayer.vercel.app
- Network: 61999 Studionet
- Source SHA-256: `1b7a7424b4195ff6df0bd622aa9cdfce79aba2e49a05feb00a9385dafae8610b`
- Qualification: https://github.com/GIFTEDLOV/driftproof/actions/runs/39238668302
- Demonstration case: `GNEW-milestoneproof-39238668302`, FINALIZED / REVIEW_REQUIRED; two party challenges; historical GenVM receipts in `evidence/live-lifecycle.json`.

## Reviewer steps

1. Open deployed contract on the Studionet explorer and inspect source.
2. Compare installed source to `contracts/milestoneproof.py` using `scripts/verify-live.mjs`.
3. Read canonical case `GNEW-milestoneproof-39238668302`, inspect round 2, two challenges and terminal REVIEW_REQUIRED.
4. Compare every transaction in `evidence/live-lifecycle.json` to its GenVM receipt and canonical state.
5. Open https://milestoneproof-genlayer.vercel.app on Studionet, connect a test wallet and inspect live history. A real signed transaction from the unmodified production app was finalized with GenVM SUCCESS and canonical readback; see evidence/production-browser-signed.json.

**Limits:** Wallet attestation does not verify actual client identity, scope completion, source authenticity or an enforceable contractual obligation. The contract does not custody funds, execute payment or ensure physical completion; live demonstration evidence is synthetic.

**Portal submission status:** NOT SUBMITTED. No steward acceptance is claimed.