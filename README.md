# Telemedi end-to-end tests

This project uses Playwright to check important user flows on the Telemedi test site. It covers login and consultation booking in a real browser.

## Tests

- **Login:** confirms invalid credentials are rejected and valid credentials open the main page.
- **Prescription booking:** confirms required agreements are validated, then expects a PayU redirect after accepting them.
- **Remote booking:** books an available appointment and verifies its details on the main page.
- **Specialization selector:** checks that it collapses after the second click. This test is marked as `@known-bug`.

## Run locally

Requires Node.js 20 or later.

```sh
npm ci
npx playwright install chromium
npx playwright test
```

Open the HTML report with `npx playwright show-report`.

## Project layout

- `tests/` — test scenarios
- `pages/` — login, main page, prescription consultation, and remote consultation page objects
- `types/remoteAppointmentDetails.ts` — details captured andstored to verify a remote appointment creates
- `constants/constants.ts` — site URLs and test account credentials
- `playwright.config.ts` — Playwright settings; Chromium is the active browser project
- `pipeline.yml` — CI pipeline

## Known issues (comented in code)

- Remote appointment booking uses a fixed one-second wait to work around a time-slot widget refresh race.
- The prescription test expects the PayU redirect within five seconds; the redirect is known to be inconsistent.
- Specialization selector regression test is marked as a known bug.
- The pipeline currently triggers on `master` only. Update its trigger if the target branch is `main`.