# MilestoneProof

**GenLayer Studionet (chain 61999) — intelligent contract live and qualified; dedicated repo release pending.**

Resolve freelance milestone acceptance through frozen scopes, independently validated GenLayer consensus, two-party challenges and deterministic payable-basis calculations.

## Contract

- Deployed address: `0xD4AdDBe785176EfC96da0B371FfBa03C5ff6c0c9`
- [Studionet explorer](https://explorer-studio.genlayer.com/address/0xD4AdDBe785176EfC96da0B371FfBa03C5ff6c0c9)
- Deployed Python source SHA-256: `1b7a7424b4195ff6df0bd622aa9cdfce79aba2e49a05feb00a9385dafae8610b`
- Deployment transaction: `0x7ab4dad98b090ca61919141fe7968f495239af117e7aed3503cb426c5e82aaab`
- Historical live qualification: [GitHub Actions run 39238668302](https://github.com/GIFTEDLOV/driftproof/actions/runs/39238668302)
- Canonical case: `GNEW-milestoneproof-39238668302`; **FINALIZED**, round 2, **REVIEW_REQUIRED**; two independent party challenges; verified GenVM execution and hash-linked history. All test source records are synthetic.

## Purpose and native GenLayer justification

Clients and freelancers dispute whether deliverables satisfy agreed natural-language acceptance criteria; AI should not independently change payouts, schedules or responsibilities.

Leader and validators independently classify deliverable_in_scope, acceptance_criteria_met, material_defect_supported and evidence_sufficient as strict booleans. A bounded deterministic state machine and integer arithmetic derive acceptance and a non-custodial payable basis. Model outputs cannot set policy, deadlines, actors, rates, or access permissions. The contract uses a separate nominated attestor wallet, canonical SHA-256 evidence binding, strict typed model responses, challenge rights and terminal finalization.

## Tests and reproducibility

Run `python -m pytest -q --import-mode=importlib tests` and `genvm-lint check contracts/milestoneproof.py` with Python 3.12 and `genvm-linter` installed. `genvm-lint schema` verifies the public ABI. Live byte parity, chain identity and state readback are checked using `scripts/verify-live.mjs`. All 45 aggregate local regression tests and GitHub cloud GenVM/ABI checks have passed.

## Application

https://milestoneproof-genlayer.vercel.app

A genuine Chromium wallet signed a transaction through the public production app. The GenVM receipt finalized successfully and the app itself showed `VERIFIED_FINALIZED_EXECUTION_AND_STATE`. Evidence is in `evidence/production-browser-signed.json`, workflow [39242842521](https://github.com/GIFTEDLOV/driftproof/actions/runs/39242842521). The application has `RELEASE_QUALIFIED=true` and its canonical contract binding verified.

## Explicit trust limits

Wallet attestation does not verify actual client identity, scope completion, source authenticity or an enforceable contractual obligation. The contract does not custody funds, execute payment or ensure physical completion; live demonstration evidence is synthetic. Stored records are public and append-only; errors and non-positive adjudications are surfaced without invented approvals.

- [Deployment provenance](docs/DEPLOYMENT.md)
- [Security review](docs/SECURITY.md)
- [Reviewer demonstration](docs/SUBMISSION.md)
- [Release gates](docs/RELEASE_GATES.md)

**Portal status:** prepared, not submitted. GitHub-independent release repository and version tag are not yet published.