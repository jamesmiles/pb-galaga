# Merge Bot
## Merge Bot Rescue Prompt Template
 Variables available (will be substituted):
### {{PR_NUMBER}}   - The PR number
### {{TITLE}}       - PR title
### {{HEAD_REF}}    - Source branch name
### {{BASE_REF}}    - Target branch name  
### {{ISSUES}}      - Description of issues (e.g., "merge conflict", "failing tests")

I need you to rescue PR#{{PR_NUMBER}} ("{{TITLE}}").

Branch: {{HEAD_REF}} → {{BASE_REF}}
Issues: {{ISSUES}}

## At a high level:
1. First checkout the PR: gh pr checkout {{PR_NUMBER}}
2. Fix the {{ISSUES}}
3. Commit and push your changes

## Notes:
- Pull latest from {{BASE_REF}}: git fetch origin {{BASE_REF}} && git merge origin/{{BASE_REF}}
- Resolve conflicts in the affected files
- NOTE: if the conflict is due to files or folders being added with the same name, you should rename or number files or folders in the blocked PR (treating main/master as authoritative) - this is particularly relevant for patchboard tasks which use a T-XXXX naming standard
- git add the resolved files and commit

Once fixed, push the changes to update the PR.