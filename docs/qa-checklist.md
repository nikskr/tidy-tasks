# QA checklist (run on `preview` build, at least 1 low-end Android + 1 older iPhone)

Build: ______ · Device/OS: ______ · Tester: ______ · Date: ______

## Core flows (spec 001)
- [ ] AC-1 add task via keyboard "Done" and via Add button; input clears; task on top
- [ ] AC-2 empty / spaces-only cannot be added (button disabled)
- [ ] AC-3 paste 300 chars → capped at 200
- [ ] AC-4 toggle done/undone; strike-through; counter updates
- [ ] AC-5 tap title → edit → save; clear text → previous title restored
- [ ] AC-6 delete
- [ ] AC-7 filters All/Active/Done
- [ ] AC-8 Clear completed visible only with completed tasks; removes only completed
- [ ] AC-9 kill app → reopen → data intact; **install this build over the previous store build → data intact**
- [ ] AC-10 empty messages for each filter
- [ ] AC-11 "N tasks left" correct, singular/plural
- [ ] AC-12 About: version (build), update id, channel, privacy policy opens

## Platform & quality
- [ ] Airplane mode: all flows work
- [ ] Dark mode and light mode — readable, no white flashes on launch
- [ ] Font size max (iOS Larger Text / Android font 200%) — no clipped or overlapping text
- [ ] VoiceOver / TalkBack: every control announced with a meaningful label; checkbox state read
- [ ] Android back button closes About modal; keyboard does not cover input (both platforms)
- [ ] 1,000 tasks (dev seed) scroll smoothly; cold start < 2 s on the low-end device
- [ ] Rotate / split screen not available (portrait lock) and no crash
- [ ] Trigger a test error in preview build → appears in Sentry with readable stack trace

Result: PASS / FAIL — issues: ______
