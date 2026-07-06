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
