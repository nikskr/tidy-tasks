# Tasks — Feature 002 Cloud Sync

Blocked until spec status = Approved (open questions resolved).

- [ ] **T-01** Contract PR: `contracts/openapi.yaml` reviewed + Prism mock in CI — BE-3, BE-4, BE-5
- [ ] **T-02** Server migrations 0001/0002 applied in CI to empty DB — BE-2, BE-5
- [ ] **T-03** Backend service skeleton + auth endpoints — BE-1, BE-3, BE-6
- [ ] **T-04** Backend changes/batch endpoints with LWW + idempotency — BE-4 — AC-3, AC-4, AC-5
- [ ] **T-05** Account deletion endpoint + job — BE-5 — AC-6
- [ ] **T-06** [P] App: device migration 2 (deleted_at, dirty, sync_state) + test from v1 — AC-5
- [ ] **T-07** [P] App: generated API client + fetch wrapper (version headers, timeout, 426 handling)
- [ ] **T-08** App: sign-in screen (Apple/Google), secure token storage — AC-1, AC-2
- [ ] **T-09** App: sync engine (pull/push, debounce, foreground) behind `sync_enabled` flag — AC-2..AC-5, AC-7
- [ ] **T-10** App: account deletion UI — AC-6
- [ ] **T-11** QA on staging with preview build; two-device scenarios
- [ ] **T-12** Privacy policy + App Privacy + Data safety updates
