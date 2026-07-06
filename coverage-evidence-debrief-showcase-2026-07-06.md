# 13/24 Capability Showcase: Coverage, Evidence, Debrief

Date: 2026-07-06
Product: OrangeHRM demo
Target: https://opensource-demo.orangehrmlive.com
Tester: Jun + 24

## Purpose

This file shows a different AI-assisted testing capability than simply generating Playwright checks.

The useful pattern is:

```text
coverage model -> evidence trace -> debrief questions -> next charter
```

This is where 13/24-style work differs from a generic agentic AI demo. The AI is not only clicking and asserting. It is helping map the test space, preserve why each claim is believable, and turn a test session into a responsible testing story.

## Source Evidence Used

Current committed artifacts:

- `tests/orangehrm-login-smoke.spec.js`
- `tests/orangehrm-auth-session-exploration.spec.js`
- `tests/orangehrm-password-reset-exploration.spec.js`
- `session-notes-2026-07-06-auth-session.md`

Fresh dashboard reconnaissance was performed with Playwright after logging in as the demo user:

```text
username: Admin
password: admin123
landing URL: /web/index.php/dashboard/index
page title: OrangeHRM
heading: Dashboard
console messages: none observed
failed requests: none observed
HTTP responses >= 400: none observed
```

Observed main navigation modules:

- Admin
- PIM
- Leave
- Time
- Recruitment
- My Info
- Performance
- Dashboard
- Directory
- Maintenance
- Claim
- Buzz

Observed dashboard surfaces:

- Time at Work
- My Actions
- Quick Launch
- Buzz Latest Posts
- Employees on Leave Today
- Employee Distribution by Sub Unit
- Employee Distribution by Location

## Coverage Model

This is a first-pass product coverage outline, not a claim of complete coverage.

### Product Areas

| Area | What It Appears To Cover | Test Interest |
| --- | --- | --- |
| Login | Username/password entry and authentication feedback | Access boundary, user feedback, session creation |
| Password Reset | Account recovery by username | Recovery reliability, privacy-preserving feedback, navigation |
| Dashboard | Post-login landing page and widgets | Data loading, widget reliability, user orientation |
| Admin | System/user/admin configuration | Permission boundaries, configuration risk |
| PIM | Personnel information management | Employee data integrity, privacy, CRUD workflows |
| Leave | Leave request and tracking workflows | Date rules, approvals, balances, role differences |
| Time | Time tracking workflows | Time entry, approvals, reporting, edge dates |
| Recruitment | Candidate/job workflow | Workflow states, data entry, search/filtering |
| My Info | Current user's profile/details | Self-service edit boundaries, personal data display |
| Performance | Review/performance workflows | Role visibility, review state transitions |
| Directory | Employee lookup | Search behavior, privacy exposure, filtering |
| Maintenance | Maintenance module | Elevated permission boundary, destructive/admin operations |
| Claim | Expense/claim workflow | Money-like data, approvals, attachments, state transitions |
| Buzz | Social/news feed | Posting, visibility, moderation, attachment/media behavior |

### Data Coverage Ideas

- Credentials: blank, invalid, valid demo account, unknown username.
- Session state: logged out, logged in, after reload, after logout.
- User identity: admin user, ordinary employee if available, unknown user.
- Employee records: names, IDs, departments, locations, photos.
- Dates and times: today, past, future, boundary dates, time zones.
- Workflow states: draft, submitted, approved, rejected, canceled, archived.
- Search/filter values: empty, exact match, partial match, no results, special characters.
- Attachments/media where available: missing file, large file, unsupported type.

### Role And Permission Coverage Ideas

The current checks use only the public demo `Admin` user. That is useful but narrow.

Future role questions:

- What can Admin see that ordinary users cannot?
- Can direct URLs bypass menu-level permissions?
- Are sensitive modules hidden, disabled, or server-blocked for lower-privilege users?
- Does logout clear access across tabs and back-button history?
- Do API calls enforce the same access boundary as the UI?

### State And Workflow Coverage Ideas

Auth/session states already touched:

- anonymous
- login form with blank input
- login form with invalid input
- authenticated dashboard
- authenticated dashboard after reload
- logged out after explicit logout
- password reset form
- reset form with blank input
- reset submitted for unknown user

Future states worth modeling:

- stale session
- expired session
- password reset pending
- invalid reset token
- multi-tab login/logout
- browser back after logout
- direct navigation to each module while logged out

### Integration And Timing Coverage Ideas

Observed dashboard widgets likely depend on backend API calls for summaries, employee distribution, leave data, feed data, and shortcuts.

Future questions:

- What happens when dashboard APIs are slow?
- What happens when one widget API fails but the page shell loads?
- Are loading states clear?
- Do widgets show stale, partial, or misleading data?
- Do reloads interrupt dashboard API calls in a way that matters to users?

## Evidence Traceability Matrix

| Claim | Evidence Source | Oracle Used | Confidence | Remaining Risk |
| --- | --- | --- | --- | --- |
| Login page exposes core controls | `orangehrm-login-smoke.spec.js`, screenshot, visible controls | Login heading, username field, password field, Login button visible | High for current page load | Does not cover accessibility or every browser |
| Blank login is blocked locally | `orangehrm-auth-session-exploration.spec.js` | Two `Required` messages and same login URL | High | Does not inspect form internals |
| Invalid credentials fail closed | `orangehrm-auth-session-exploration.spec.js` | `Invalid credentials` visible and dashboard not reached | High | Does not test rate limiting or account lockout |
| Valid login establishes a usable session | `orangehrm-auth-session-exploration.spec.js` | Dashboard URL/heading visible after login and reload | Medium-high | Only one demo account and one browser context |
| Direct dashboard access without session redirects to login | `orangehrm-auth-session-exploration.spec.js` | Dashboard URL redirects to login URL/heading | High for dashboard page | Does not cover every protected route |
| Logout removes dashboard access | `orangehrm-auth-session-exploration.spec.js` | After logout, dashboard URL redirects to login | Medium-high | Does not cover multi-tab or API session invalidation |
| Reset page exposes recovery controls | `orangehrm-password-reset-exploration.spec.js` | Reset heading/text, username, Cancel, Reset Password visible | High | Does not cover screen-reader quality |
| Blank reset is blocked locally | `orangehrm-password-reset-exploration.spec.js` | `Required` visible and same reset URL | High | Does not inspect validation implementation |
| Unknown username reset is generic | `orangehrm-password-reset-exploration.spec.js` | Generic reset-sent page for `not-a-user` | Medium-high | Does not prove all unknown/known users behave the same |
| `Admin` reset may stall | Manual Playwright reconnaissance, session notes | Browser appeared stuck around `requestResetPassword` | Low-medium | Needs targeted reproduction before bug report |
| Dashboard has 12 main nav modules | Fresh Playwright reconnaissance in this file | Extracted visible nav link text after login | Medium | Nav may differ by role or demo data state |

## Debrief Support

These are the questions 24 should ask after each AI-assisted testing session.

### What Did We Actually Learn?

We learned that the basic auth/session/recovery surface behaved correctly for several common visible paths:

- blank inputs get required-field feedback,
- invalid login is rejected,
- valid login reaches dashboard,
- dashboard direct access fails closed while logged out,
- logout removes dashboard access in the same browser context,
- unknown reset username gets generic feedback.

We also learned that the dashboard surface is broad enough that continued testing should switch from narrow auth probes to product coverage modeling.

### Which Observations Are Reliable?

Reliable enough for the current demo:

- Visible login controls exist.
- Blank and invalid login feedback appears.
- Valid demo login reaches dashboard.
- Dashboard direct access redirects when logged out.
- Reset page controls exist.
- Unknown reset username gets generic feedback.

These are supported by executable Playwright checks and screenshots.

### Which Observations Are Suspicious But Unconfirmed?

The `Admin` password reset path appeared to stall under manual automation probing.

This should not be called a confirmed bug yet because:

- the observation was not reduced to a clean reproduction,
- the browser automation path became hard to observe,
- the behavior may be tied to demo email/backend limitations,
- the user impact is not yet established.

Responsible wording:

```text
We observed a possible reset-flow reliability issue for the known demo Admin user. It deserves targeted investigation before filing a bug.
```

### Where Did The Testing Become Shallow?

The current testing is shallow in these areas:

- only one browser project: Chromium desktop,
- only one known account: Admin,
- limited API-level authorization inspection,
- no multi-tab session testing,
- no role comparison,
- no accessibility review,
- no dashboard widget data validation,
- no module-by-module workflow coverage.

This is acceptable for the workshop because the purpose was to demonstrate responsible AI-assisted testing, not complete OrangeHRM certification.

### What Should The Next Charter Be?

Recommended next charter:

```text
Explore the logged-in OrangeHRM dashboard and primary navigation to build a product coverage outline, identify risk hotspots, and select one high-value module for deeper testing.
```

Why:

- It broadens from auth/session to product understanding.
- It demonstrates coverage modeling as an AI-assisted testing capability.
- It avoids pretending that more login checks equal broader product confidence.

## Workshop Talking Point

The important capability is not that AI can write Playwright tests. Many tools can do that.

The important capability is that 13/24 can maintain a testing argument:

```text
mission -> risk -> coverage model -> probe -> oracle -> evidence -> uncertainty -> next charter
```

That is why the work is reviewable. If someone asks why a test exists or whether a claim is justified, the answer is already connected to evidence and limits.

