---
name: triage-crash
description: Triage a production crash, error spike or performance regression (Sentry issue URL/ID, store vitals or user report) into root cause, severity and a fix task brief. Use when something is broken in production.
---

# Triage a production problem

Arguments: Sentry issue URL/ID, or a description of the symptom.

1. Check the Sentry MCP is connected (`/mcp`). If not, ask the user to authenticate, or work from pasted stack traces.
2. Delegate to the `prod-triage` subagent with the issue reference.
3. Present: impact (users, releases, platforms), root cause + confidence, proposed severity, fix path (OTA vs binary).
4. If S1: tell the human now to halt the Play staged rollout / pause the Apple phased release.
5. Once the human agrees, add the fix as a task in the relevant `specs/NNN/tasks.md` (or create `specs/NNN-hotfix-<slug>/` for unrelated bugs) and offer to run `/implement-task`.
6. After the fix ships, verify in Sentry that the issue stops for the new release/update id, and add a short postmortem to `docs/releases/<version>.md`.
