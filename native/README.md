# GenLayer four-build native workbench

**Staging and QA source — none of the four are yet deployed or submission-ready.**

Four independent build directories: `noticeclock`, `invoicebasis` (standalone Intelligent Contracts), `parcelcourt`, `shiftfair` (contracts and frontend). No Lovable dependencies or generated Lovable assets.

These versions are a fresh clean-room implementation under the user-authorized four-build programme. The contract sources pin the latest documented GenVM runner hash. UI preview mode contains synthetic data and disables writes until verified chain qualification.

## Test

````bash
python test_native.py
python -m compileall -q noticeclock/contracts invoicebasis/contracts parcelcourt/contracts shiftfair/contracts
genvm-lint check noticeclock/contracts/noticeclock.py
````

Run GenVM linter on all four individually. The Python `test_native.py` test is a deterministic mock and cannot qualify live validator consensus.

## Account restrictions / blockers

Studionet RPC confirmed reachable via GitHub Actions on 2026-10-18; chain 61999 HTTP 200. However no contract deploy, canonical readback or SDK runtime validation has occurred. New GitHub repository creation is unavailable to the current connected GitHub tool, and Vercel Sandbox/Railway cloud compute blocked by account quotas. The provided native project packages can be tested/deployed with GitHub Actions on a temporary workbench branch without touching the legacy main branch.