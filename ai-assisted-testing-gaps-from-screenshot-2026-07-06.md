# AI-Assisted Testing Areas Missing From The Screenshot

Date: 2026-07-06
Context: James Bach Testing and AI workshop
Product under test: OrangeHRM demo

## Purpose

The workshop screenshot listed many obvious AI-assisted testing activities, such as product analysis, risk analysis, test design, data synthesis, oracle support, static analysis, test tooling, and bug reporting.

Those are useful, but they do not fully capture what a stronger 13/24-style testing assistant can do.

The biggest missing capability is:

```text
testing story / evidence management
```

AI is especially useful at turning scattered observations into a defensible testing story.

That means organizing:

- what we tested,
- why we tested it,
- what evidence supports it,
- what remains unknown,
- what we should test next,
- what we must not overclaim.

This is different from bug reporting. It is the bridge between raw testing activity and responsible stakeholder communication.

## Coverage Modeling

AI can help build product coverage outlines quickly.

Coverage modeling includes:

- features,
- data,
- roles,
- workflows,
- states,
- integrations,
- error paths,
- timing,
- permissions.

This is not merely test design. It is mapping the test space.

Example from the OrangeHRM session:

- We started with login/session/recovery because it was a high-risk boundary.
- Then dashboard reconnaissance showed a broader product map: Admin, PIM, Leave, Time, Recruitment, My Info, Performance, Dashboard, Directory, Maintenance, Claim, and Buzz.
- That changed the next question from "can login work?" to "which module or workflow deserves deeper testing?"

## Evidence Traceability

AI can link each testing claim to evidence.

Useful evidence includes:

- screenshots,
- traces,
- console logs,
- network events,
- URLs,
- test output,
- manual notes,
- visible UI state,
- observed redirects,
- browser/session state.

This is exactly where generic agents often fail. They may report that a test passed, but they cannot explain why the test mattered or what evidence supports the claim.

For this workshop, a good evidence trace has this shape:

```text
claim -> evidence source -> oracle -> confidence -> remaining risk
```

Example:

| Claim | Evidence | Oracle | Confidence | Remaining Risk |
| --- | --- | --- | --- | --- |
| Logged-out users cannot directly access dashboard | Playwright direct URL test, login redirect, screenshot | Protected page should redirect to login without a session | High for dashboard route | Does not cover every protected route |
| Unknown reset username does not reveal account existence | Reset flow test with `not-a-user`, generic reset-sent page | Recovery should avoid obvious account enumeration | Medium-high | Does not prove all known/unknown users behave identically |

## Debrief Support

After a session, AI can help debrief the tester.

Good debrief questions:

- What did you actually learn?
- Which observations are reliable?
- Which are suspicious but unconfirmed?
- Where did the test become shallow?
- What should the next charter be?

This matters because a test session does not end when the script finishes. The responsible tester still needs to interpret the evidence, identify uncertainty, and decide the next useful move.

Example from this session:

- Reliable: blank login and reset inputs showed required-field feedback.
- Reliable: invalid login did not reach the dashboard.
- Reliable: logout removed dashboard access in the same browser context.
- Suspicious but unconfirmed: the known `Admin` password-reset path appeared to stall under manual automation probing.
- Shallow area: only one account, one browser project, limited API authorization inspection, no multi-tab testing.
- Next charter: logged-in dashboard/product coverage reconnaissance.

## Bug Investigation And Reduction

AI can do more than report a bug. It can help isolate it.

Useful bug investigation work includes:

- reproduce,
- vary conditions,
- reduce steps,
- identify likely trigger,
- distinguish product bug from test artifact,
- distinguish environment issue from product behavior,
- preserve enough evidence for another tester to replay the investigation.

Example:

The `Admin` password-reset behavior looked suspicious. A weaker agent might immediately report "bug found." We did not do that.

The responsible path is:

1. Record the observation.
2. State why it might matter.
3. State why it is not yet confirmed.
4. Propose a tighter reproduction session.

This preserves credibility.

## Oracle Criticism

AI can challenge the oracle itself.

Useful oracle questions:

- Why is this expected?
- Is this expectation based on a specification?
- Is it based on consistency with the rest of the product?
- Is it based on user expectation?
- Is it based on a comparable product?
- Is it based on a security norm?
- Is it just the tester's preference?
- Could the assertion be too narrow?
- Could the test pass while the product still has an important problem?

Example:

The check "dashboard heading is visible after login" is a useful oracle for basic session success, but it is narrow. It does not prove that dashboard data is correct, permissions are right, or every widget loaded. The AI should say that explicitly.

## Testability Analysis

AI can identify where the product is hard to observe or control.

Potential testability problems include:

- no stable selectors,
- unclear state,
- hidden async behavior,
- poor error visibility,
- no logs,
- no admin/operator view,
- hard-to-reset data,
- hard-to-create role-specific users,
- hard-to-observe backend decisions,
- ambiguous loading or redirect behavior.

Example:

The reset flow became hard to observe cleanly for the known `Admin` demo account. That is partly a product observation and partly a testability observation. The next useful move is not to overclaim a bug, but to improve observability and reduce the reproduction.

## Strongest Demo Extension

The strongest message is:

```text
AI is not just generating tests. It is helping maintain the testing story and evidence chain.
```

The complete argument is:

```text
mission -> risk -> coverage model -> probe -> oracle -> evidence -> uncertainty -> next charter
```

That is the capability not fully captured in the screenshot.

## Workshop One-Liner

Generic agentic AI can click and generate checks.

13/24-style AI-assisted testing can explain:

- why the check exists,
- what risk it addresses,
- what oracle it used,
- what evidence was collected,
- what confidence is justified,
- what remains unknown,
- what should happen next.

