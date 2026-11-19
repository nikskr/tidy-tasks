# Feature 001 — Task List (v1.0)

Status: Implemented · Owner: product · Target version: 1.0.0

## Problem / why
People want a fast, private place to jot down things to do and tick them off, without
creating an account or handing their data to a server. v1 is a single local list.

## User stories
- **US-1** As a user, I want to add a task quickly so I don't forget it.
- **US-2** As a user, I want to mark tasks done/undone so I can track progress.
- **US-3** As a user, I want to edit or delete a task to fix mistakes.
- **US-4** As a user, I want to filter and clean up completed tasks to keep the list focused.
- **US-5** As a user, I want my tasks to still be there after closing the app or updating it.
- **US-6** As a user, I want to see app version and the privacy policy.

## Acceptance criteria
- **AC-1** Given the list screen, when I type a title and submit, then the task appears at the top of the list as active, and the input clears.
- **AC-2** Given the input is empty or whitespace only, when I submit, then nothing is added.
- **AC-3** Given a title longer than 200 characters, when I type, then input stops at 200 characters.
- **AC-4** Given a task, when I tap its checkbox, then it toggles between active and completed, and completed tasks render struck-through.
- **AC-5** Given a task, when I tap its title, then I can edit it inline; submitting a non-empty title saves it; submitting empty restores the previous title.
- **AC-6** Given a task, when I tap its delete button, then it is removed.
- **AC-7** Given filters All / Active / Done, when I select one, then only matching tasks are shown, and the selection is announced to screen readers.
- **AC-8** Given at least one completed task, when I tap "Clear completed", then all completed tasks are removed; the button is hidden when none are completed.
- **AC-9** Given tasks exist, when the app is killed and reopened (or updated to a newer version), then all tasks and their states are preserved.
- **AC-10** Given no tasks match the filter, then an empty-state message appropriate to the filter is shown.
- **AC-11** The header shows the count of active tasks ("3 left").
- **AC-12** Given the About screen, then app version + build number and a link to the privacy policy are shown.

## Edge cases
- Empty state: see AC-10.
- Limits: 200 chars per title; list must stay smooth with 1,000 tasks.
- Offline: whole app is offline.
- Interrupted writes: each mutation is a single SQL statement (atomic).
- Accessibility: checkbox role with checked state; delete button labeled "Delete <title>"; works at 200% font scale.
- Dark mode: follows system setting.

## Non-functional
- Adding a task reflects in UI in < 100 ms on mid-range device.

## Out of scope
- Accounts, sync, sharing, reminders/notifications, due dates, reordering, undo, multiple lists.

## Open questions
_None._
