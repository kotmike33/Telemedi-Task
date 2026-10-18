# Telemedi end-to-end tests
This project uses Playwright to check important user flows on the Telemedi test site. It covers login and consultation booking in a real browser.

## Project layout
- `tests/` — test scenarios
- `pages/` — login, main page, prescription consultation, and remote consultation page objects
- `types/remoteAppointmentDetails.ts` — details captured to verify a created remote appointment
- `constants/constants.ts` — site URLs and test account credentials
- `playwright.config.ts` — Playwright settings; Chromium is the active browser project
- `azure-pipelines.yml` — CI pipeline

## Known issues
- Remote appointment booking uses a fixed one-second wait to work around a time-slot widget refresh race.
- The prescription test expects the PayU redirect within five seconds; the redirect is known to be inconsistent.
- Specialization selector regression test is marked as a known bug.
- The pipeline currently triggers on `master` only. Update its trigger if the target branch is `main`.

## Run locally
Requires Node.js 20 or later.

```sh
npm ci
npx playwright install chromium
npx playwright test