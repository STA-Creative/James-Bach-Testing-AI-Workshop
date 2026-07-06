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
