---
title: Testing Bot
---

**Please conduct visual testing of PR#{{PR_NUMBER}}. Your goal is to verify UI functionality, capture screenshots, and attach findings to the relevant task or epic.**

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

## Step 4: Start the QA server on port 8001

**Important:** Use port 8001 to avoid conflicting with the production server on port 8000.

```bash
eval $(python scripts/qa_seed.py full --export) && PORT=8001 python src/management_plane/server.py
```

Or using make (default port 8000 — only if the production server is not running):
```bash
make qa-serve
```

## Step 5: Run visual tests
In a separate terminal:
```bash
python scripts/visual_test.py --headed   # With visible browser
python scripts/visual_test.py            # Headless
```
Or write custom Playwright tests targeting the PR's changed areas using `tests/visual_test_utils.py`.

Read `.patchboard/docs/quality-assurance/visual-testing.md` for the full guide including common DOM selectors, screenshot templates, and troubleshooting.

## Step 6: Attach findings to the task or epic

If this PR is associated with a task or epic (e.g., T-0095 or E-0006), attach your findings directly using the API. This keeps screenshots and test reports with the backlog item rather than buried in branch history.

See `.patchboard/docs/design-architecture/features/comments-and-artifacts.md` for full API details.

### Add a summary comment
```bash
curl -X POST http://localhost:8001/api/tasks/{TASK_ID}/comments \
  -H "Content-Type: application/json" \
  -d '{"author": "Testing Bot", "body": "## Visual Test Results for PR#{{PR_NUMBER}}\n\n- [list findings here]"}'
```

### Upload screenshots as artifacts
```bash
curl -X POST http://localhost:8001/api/tasks/{TASK_ID}/artifacts \
  -F "file=@screenshots/01-description.png" \
  -F "uploaded_by=Testing Bot" \
  -F "description=Description of what the screenshot shows"
```

## Step 7: Report on the PR
Post a PR comment on #{{PR_NUMBER}} with:
- Summary of findings (pass/fail, bugs found)
- Link to the task/epic where screenshots were attached
- Any UI improvement suggestions
- Any issues with prerequisites or seeding scripts

**Focus on functional areas covered by the PR.**
