---
title: Conduct Visual Testing
---

---
title: Testing Bot
---

**Please conduct visual testing of PR#{{PR_NUMBER}}. Your goal is to verify UI functionality and capture screenshots.**

## Step 1: Understand the PR
```bash
gh pr view {{PR_NUMBER}}
gh pr diff {{PR_NUMBER}} --name-only
```
Review the changed files to identify which UI areas need visual testing.

## Step 2: Checkout the PR branch
```bash
gh pr checkout {{PR_NUMBER}}
```

## Step 3: Set up the environment
### Create virtual environment and install dependencies (one-time):
```bash
make setup              # Creates .venv and installs Python deps
make install-browsers   # Installs Playwright Chromium
```
### Validate your environment is ready:
```bash
./scripts/validate_qa_env.sh
```

## Step 4: Start the QA server
```bash
make qa-serve
```
Or manually:
```bash
eval $(python scripts/qa_seed.py full --export) && python src/management_plane/server.py
```
Run `python scripts/qa_seed.py --help` to see all seed profile options.

## Step 5: Run visual tests
In a separate terminal:
```bash
python scripts/visual_test.py --headed   # With visible browser
python scripts/visual_test.py            # Headless
```
Or write custom Playwright tests targeting the PR's changed areas using `tests/visual_test_utils.py`.

Read `.patchboard/docs/quality-assurance/visual-testing.md` for the full guide including common DOM selectors, screenshot templates, and troubleshooting.

## Step 6: Report findings
Post a PR comment on #{{PR_NUMBER}} with:
- Screenshots in `screenshots/` directory (committed to the branch)
- Report of any bugs found
- UI improvement suggestions
- Any issues with prerequisites or seeding scripts

**Focus on functional areas covered by the PR.**