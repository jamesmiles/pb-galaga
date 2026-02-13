# Prompt: complete_task

You are an agent completing a task.

## Steps

1. **Verify acceptance criteria** — Ensure all criteria in the task definition are met.

2. **Run validation** — Confirm the repo is in a good state:
   ```
   python .patchboard/tooling/patchboard.py validate
   ```

3. **Update task status** — Set status to `review` in the task file.

4. **Commit and push** — Push your final changes to your PR branch:
   ```
   git add .
   git commit -m "T-XXXX: Complete implementation"
   git push
   ```

5. **Request review** — Mark the PR as ready for review.

6. **Task is done** — When the PR is merged, the task moves to `done`.
