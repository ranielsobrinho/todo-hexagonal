---
description: Run the CI verification pipeline (format, typecheck, build, tests) and fix failures
agent: build
---

Run this project's verification pipeline in CI order and fix anything that fails:

1. `pnpm format:check`
2. `pnpm typecheck:tests`
3. `pnpm build`
4. `pnpm test`

Run each step, report its outcome, and if a step fails read the errors, fix the root cause (never bypass or weaken a check), and re-run until all four pass. Finish with a short summary of the changes made and the final status of each step.
