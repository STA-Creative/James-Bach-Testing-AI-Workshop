# RST AI-Assisted Testing Session Notes

Date: 2026-07-06
Tester: Jun + 24
Product: OrangeHRM demo
Target: https://opensource-demo.orangehrmlive.com/web/index.php/auth/login

## Charter

Explore the OrangeHRM login and immediate post-login session boundary to identify important risks in authentication, session handling, error handling, and user-facing feedback. Use Playwright as an observation and evidence-capture tool, not as a replacement for tester judgment.

## Why This Topic

Authentication is a high-value boundary because failure can block legitimate users, mislead users after mistakes, or expose protected pages without a valid session. It is also a good workshop target because the claims are observable: visible messages, URL transitions, redirects, reload behavior, logout behavior, screenshots, and browser/network signals.

## How AI Was Used

- Product analysis: identify login, dashboard, validation, session, and logout surfaces.
- Risk analysis: ask how the product could fail in ways that matter at the login/session boundary.
- Test design: turn risks into small executable probes.
- Tool implementation: create a Playwright spec to gather repeatable evidence.
- Oracle support: check visible page state, URL state, redirects, and browser signals.
- Reporting: summarize what was tested, why, what happened, and what remains unknown.

The AI did not decide that the product is good. It helped gather and structure evidence. The responsible tester still owns the interpretation.

## Risk Questions

- Can a user submit blank credentials without clear field-level feedback?
- Can wrong credentials reach a protected area or fail without a useful message?
- Does valid login create a session that survives normal reload?
- Does direct dashboard access without a session fail closed?
- Does logout actually remove dashboard access in the same browser context?

## Evidence Collected

Command:

```powershell
npx playwright test tests/orangehrm-auth-session-exploration.spec.js --reporter=list
```

Result:

```text
Focused spec: 5 passed
Full project suite: 6 passed
```

Observed checks:

- Blank login submission showed two `Required` messages and stayed on the login page.
- Invalid credentials showed `Invalid credentials` and did not reach the dashboard.
- Valid credentials reached the dashboard and the dashboard remained available after reload.
- Direct dashboard access without a session redirected to login.
- After logout, direct dashboard access redirected to login.

Browser signals collected during the five checks:

- Console messages: none observed.
- HTTP responses >= 400 captured by page observer: none observed.
- Focused spec run: no failed requests observed.
- Full suite run: the valid-login reload check recorded several dashboard API requests as `net::ERR_ABORTED`. These occurred during `page.reload` after the dashboard had already loaded, so the current interpretation is reload interruption noise rather than evidence of an app failure. This is worth watching if we later test dashboard data loading in detail.

Screenshots were captured in Playwright `test-results` for each check.

## Testing Story

In this session, we focused on the login/session boundary rather than broad feature coverage. The product behaved consistently for the basic authentication risks we probed: it rejected missing and wrong credentials, established a usable session after valid login, prevented direct dashboard access without a session, and prevented dashboard access after logout.

This is not proof that authentication is secure or complete. It is evidence that several basic user-visible and navigation-level session behaviors worked during this run.

## What Remains Unknown

- Password reset behavior was not tested.
- Session timeout behavior was not tested.
- Multi-tab and multi-browser session behavior was not tested.
- Role-based authorization beyond dashboard access was not tested.
- API-level authorization was not tested.
- Accessibility and localization of login feedback were not tested.
- Security properties such as cookie flags, CSRF, rate limiting, and brute-force protection were not tested.

## Now What

Next best sessions:

1. Password reset and recovery flow reconnaissance.
2. Post-login role/navigation coverage outline.
3. Session pressure: multi-tab, back button, reload, direct URLs, and stale pages.
4. Error-message and accessibility review of login feedback.
5. API/network-level auth boundary inspection.

---

# Follow-Up Session: Password Reset Reconnaissance

## Charter

Explore the OrangeHRM password reset flow to identify risks in user guidance, validation, recovery feedback, and navigation back to login. Use Playwright to capture evidence, but treat the AI/tool output as support for human judgment.

## Why This Follow-Up

Password reset is part of the same authentication risk boundary as login. Recovery failures can block legitimate users, confuse users about what happened, or reveal whether an account exists. It is also a useful AI-assisted testing target because the flow has clear controls, visible messages, URL transitions, and privacy-sensitive feedback behavior.

## Reset-Flow Risk Questions

- Does the reset page clearly explain what the user should do?
- Does a blank reset request produce local field-level feedback?
- Does an unknown username reveal whether the account exists?
- Can the user cancel recovery and return to login?
- Does a known demo account behave consistently with the generic reset-success behavior?

## Evidence Collected

Command:

```powershell
npx playwright test tests/orangehrm-password-reset-exploration.spec.js --reporter=list
```

Observed checks:

- Reset page showed a username field, Cancel button, Reset Password button, and explanatory text.
- Blank reset submission showed `Required` and stayed on the reset page.
- Unknown username `not-a-user` navigated to `/auth/sendPasswordReset` and showed generic reset-sent feedback.
- Cancel returned to the login page.

## Potential Issue / Follow-Up Observation

During manual Playwright reconnaissance, submitting `Admin` on the reset page did not quickly produce the same generic success page. The browser appeared to enter a loading state around:

```text
https://opensource-demo.orangehrmlive.com/web/index.php/auth/requestResetPassword
```

This is not yet classified as a confirmed bug because the probe itself became difficult to observe cleanly under automation. Current risk interpretation:

- If reproducible manually, it may be a recovery-flow reliability problem for a valid demo user.
- It may also indicate a demo environment/email-backend limitation.
- It deserves a separate targeted session with a stricter observation setup before writing a formal bug report.

## Updated Testing Story

The combined auth/recovery exploration now covers basic login validation, session establishment, direct protected-page access, logout, and the front half of password recovery. The product handled blank and unknown reset requests in a user-visible and mostly privacy-preserving way during this run. The main new uncertainty is whether valid-account reset requests produce stable feedback.

## Next Best Session

Run a targeted dashboard/product reconnaissance session after login:

- build a product coverage outline,
- map the main modules and navigation,
- identify risk hotspots,
- decide which areas deserve deeper testing.

---

# Demo Explanation: Why The Agent Did What It Did

This section is for explaining the work during the workshop discussion. The point is to show that the AI-assisted testing was not just generated automation. It has a traceable logic chain, evidence trail, and human evaluation step.

## What We Tested

We tested the OrangeHRM authentication and password-reset boundary.

The first session covered:

- blank login submission
- invalid credentials
- valid login
- dashboard reload after login
- direct dashboard access without login
- logout followed by direct dashboard access

The second session covered:

- password reset page controls
- blank reset submission
- unknown username reset feedback
- cancel navigation back to login

## Why We Chose This Topic

Authentication is a high-risk boundary. If it fails, users may be blocked, misled, or allowed into protected pages without a valid session.

It also gives us observable evidence:

- visible messages
- URL transitions
- redirects
- screenshots
- failed requests
- console messages
- visible controls

That makes it a good Rapid Software Testing target: clear mission, clear risks, clear oracles, and defensible coverage.

## How The AI Decided What To Do

The reasoning chain was:

1. Start with the RST mission: inform stakeholders about product risk.
2. Pick a product area where failure matters: login, session, and recovery.
3. Turn risks into questions:
   - Can users submit missing credentials?
   - Are wrong credentials rejected?
   - Does valid login create a durable session?
   - Are protected pages blocked without a session?
   - Does logout actually remove access?
   - Does password reset avoid account enumeration?
4. Turn those questions into Playwright probes.
5. Capture evidence through visible UI assertions, URL assertions, screenshots, console logs, failed requests, and HTTP response observations.
6. Write a human-readable testing story with what passed, what remains unknown, and what deserves follow-up.

## What Evidence We Collected

Automated evidence:

- `npm test` passed with `10 passed`.
- Playwright screenshots were captured under `test-results`.
- Console messages were collected.
- Failed browser requests were collected.
- HTTP responses `>= 400` were collected.
- URL transitions were checked.
- Visible UI text was checked.

Human interpretation:

- Blank login and blank reset showed required-field feedback.
- Invalid login stayed on login and showed `Invalid credentials`.
- Valid login reached dashboard and survived reload.
- Direct dashboard access without login redirected to login.
- Logout removed dashboard access.
- Unknown username reset showed generic reset-sent feedback, which is privacy-preserving.
- The `Admin` password-reset path appeared to stall under manual automation probing, so we recorded it as a follow-up observation, not a confirmed bug.

## How We Evaluated The AI Output

We did not trust the AI's first idea by default.

We checked:

- Did the selectors match the real page?
- Did Playwright actually pass?
- Did the page behavior support the claim?
- Did browser signals contradict the claim?
- Did any probe produce ambiguous evidence?
- Did we distinguish confirmed observations from suspected issues?

Example: the `Admin` reset path looked suspicious, but we did not call it a confirmed bug because the automation observation was not clean enough. That is the responsible-tester move.

## What The AI Did Not Do

The AI did not:

- declare the product secure
- claim complete coverage
- hide ambiguous evidence
- turn every observation into a bug
- send or upload anything externally
- rely only on generated text

It created tools and notes, then we judged the evidence.

## Short Workshop Summary

I used AI as a testing assistant, not as the tester. We chose auth and session recovery because it is a high-risk boundary. The AI helped turn risks into probes, wrote Playwright checks, captured screenshots, console and network signals, and produced a session note. I can defend each check by linking it to a risk, an oracle, and collected evidence. Where evidence was ambiguous, like the `Admin` password-reset behavior, we recorded it as a follow-up observation instead of overclaiming a bug.

---

# Manual Verification Guide

Use this section when demonstrating or reviewing what the automated checks actually did. The goal is to be able to defend the automation as testing evidence, not merely say that Playwright passed.

Run the full suite in headed mode:

```powershell
cd E:\STAProjects\James-Bach-Testing-AI-Workshop
npm run test:headed
```

Run one named check at a time:

```powershell
npx playwright test -g "invalid credentials" --headed
```

Replace the quoted phrase with part of the test name.

## 1. Login Page Smoke

Automated check:

```text
OrangeHRM login page exposes core login controls
```

What it does:

- Opens the OrangeHRM login page.
- Checks for the login heading.
- Checks for the username field.
- Checks for the password field.
- Checks for the Login button.

What to watch manually:

- Does the page visibly load?
- Are the main controls present and understandable?
- Are there console messages or failed requests?

Evidence meaning:

- This is a basic availability and testability check. It tells us the starting surface is present enough to continue testing.

## 2. Blank Login Submission

Automated check:

```text
blank login submission explains required fields without leaving login page
```

What it does:

- Opens the login page.
- Clicks Login with both fields empty.
- Expects two `Required` messages.
- Expects the browser to remain on the login URL.

What to watch manually:

- Do both fields get clear feedback?
- Does the app avoid submitting an empty login?
- Does the user stay in a recoverable state?

Evidence meaning:

- Missing credentials are blocked locally and explained at the field level.

## 3. Invalid Credentials

Automated check:

```text
invalid credentials are rejected with a specific visible message
```

What it does:

- Enters a fake username and password.
- Clicks Login.
- Expects `Invalid credentials`.
- Expects the Login page to remain visible.

What to watch manually:

- Does the app reject the login?
- Is the feedback visible and understandable?
- Does it avoid navigating to the dashboard?

Evidence meaning:

- Wrong credentials fail closed and produce user-facing feedback.

## 4. Valid Login And Reload

Automated check:

```text
valid login reaches dashboard and survives reload
```

What it does:

- Logs in with `Admin` / `admin123`.
- Expects the Dashboard URL and heading.
- Reloads the page.
- Expects the Dashboard heading to remain visible.

What to watch manually:

- Does valid login reach the dashboard?
- Does the dashboard remain available after reload?
- Do failed browser requests appear during reload?

Evidence meaning:

- Login establishes a usable browser session. Some reload-interrupted dashboard requests have appeared as `net::ERR_ABORTED`; we currently treat those as reload noise unless deeper dashboard testing proves otherwise.

## 5. Direct Dashboard Access While Logged Out

Automated check:

```text
logged-out user is redirected away from dashboard
```

What it does:

- Opens the dashboard URL without first logging in.
- Expects redirect to the login page.
- Expects the login heading.

What to watch manually:

- Does the protected page fail closed?
- Does the user land somewhere understandable?

Evidence meaning:

- The dashboard is not directly accessible without a session in this browser context.

## 6. Logout Clears Dashboard Access

Automated check:

```text
logout removes dashboard access in the same browser context
```

What it does:

- Logs in.
- Opens the user dropdown.
- Clicks Logout.
- Tries to open the dashboard URL again.
- Expects redirect to login.

What to watch manually:

- Does the user menu appear?
- Does Logout return to login?
- Does direct dashboard access fail after logout?

Evidence meaning:

- Logout appears to terminate dashboard access in the same browser context.

## 7. Password Reset Page Controls

Automated check:

```text
reset page exposes basic recovery controls
```

What it does:

- Opens the password reset page.
- Checks explanatory text.
- Checks username input.
- Checks Cancel.
- Checks Reset Password.

What to watch manually:

- Is the recovery flow understandable?
- Are the controls visible and named clearly?

Evidence meaning:

- The recovery page is available and has the expected basic controls.

## 8. Blank Password Reset

Automated check:

```text
blank reset submission explains required username locally
```

What it does:

- Opens the reset page.
- Clicks Reset Password with an empty username.
- Expects `Required`.
- Expects to remain on the reset page.

What to watch manually:

- Does the user get field-level feedback?
- Does the app avoid submitting an empty reset request?

Evidence meaning:

- Missing recovery identity is blocked locally and explained.

## 9. Unknown Username Password Reset

Automated check:

```text
unknown username receives generic reset-sent feedback
```

What it does:

- Opens the reset page.
- Enters `not-a-user`.
- Clicks Reset Password.
- Expects a generic reset-sent success page.

What to watch manually:

- Does the feedback reveal whether the account exists?
- Does the page give a useful next step?

Evidence meaning:

- The unknown username path appears privacy-preserving because it does not obviously reveal account existence.

## 10. Cancel Password Reset

Automated check:

```text
cancel returns from reset page to login page
```

What it does:

- Opens the reset page.
- Clicks Cancel.
- Expects return to the login page.

What to watch manually:

- Can the user recover from the reset flow?
- Does Cancel return to the expected place?

Evidence meaning:

- The reset flow has a simple escape path back to login.
