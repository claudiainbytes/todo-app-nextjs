---
name: task-documentation
description: "Use this skill when you need to document a completed task, summarize implementation work, and capture verification details in a reusable format."
---

# Task Documentation Skill

Use this skill to turn completed work into clear, structured documentation for a project.

## What this skill produces
A concise markdown document that includes:
- task summary
- files changed
- implementation highlights
- verification steps
- notes and follow-up items

## Recommended workflow
1. Review the completed work and identify the main outcome.
2. List the files involved and the relevant changes.
3. Summarize the implementation in plain language.
4. Capture how the change was verified with concrete evidence.
5. Add any caveats, risks, or next steps.
6. Save the documentation in a clear place such as a project notes file or docs folder.

## Suggested structure

### Task Summary
- What was implemented or fixed
- Why it was needed

### Files Changed
- Main files affected
- Short explanation of each change

### Implementation Highlights
- Key technical decisions
- Important behavior changes

### Verification
- Commands run
- Result observed
- Evidence of success

### Notes
- Known limitations
- Optional next improvements

## Documentation template
```md
# Task Documentation

## Summary
- Implemented: ...
- Reason: ...

## Files Changed
- ...

## Implementation Highlights
- ...

## Verification
- Command: ...
- Result: ...

## Notes
- ...
```

## Quality checklist
- The document is short and easy to scan.
- It mentions the actual outcome, not just the process.
- It includes verification evidence.
- It is useful for future reference or handoff.

## Example prompts
- "Document the authentication work completed in this project, including files changed and verification steps."
- "Summarize the UI cleanup work and turn it into project documentation."
- "Create a handoff note for the backend auth changes with verification details."
