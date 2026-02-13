# Prompt: claim_task

You are an agent claiming a task for execution.

## Steps

1. **Pull latest** — Ensure you have the most recent state:
   ```
   git pull --rebase
   ```

2. **Create a branch** — Use the task ID in the branch name:
   ```
   git checkout -b T-XXXX-short-description
   ```

3. **Make an initial commit** — Can be minimal (e.g., update task status):
   ```
   git commit --allow-empty -m "Claim T-XXXX: short description"
   ```

4. **Push and create PR** — Include the task ID in the PR title:
   ```
   git push -u origin T-XXXX-short-description
   ```
   Then create a PR with a title like: `T-XXXX: Implement feature`

5. **Verify no conflicts** — Check that no other open PRs exist for this task:
   - Search open PRs for the task ID (e.g., `T-XXXX`)
   - If another PR exists, close yours and pick a different task

6. **Begin work** — Only after verifying no conflicting PRs exist.

## If you cannot claim

- If another open PR exists for the same task ID, you cannot claim it.
- Close your PR and choose a different task.
- Do NOT work on a task if someone else has an open PR for it.
