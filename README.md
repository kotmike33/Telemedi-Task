# Telemedi end-to-end tests

This project automates key user flows on the Telemedi test site. It helps check that login and consultation booking work through the browser, including validation and payment redirection.

## Tests

- **Invalid login:** confirms that incorrect credentials show an error.
- **Valid login:** confirms that correct credentials open the main page.
- **Prescription booking:** fills a prescription consultation and checks that accepting the agreements leads to PayU.
- **Required agreements:** checks that booking without the required agreements shows validation messages.
- **Remote appointment:** books an available appointment, then checks its details on the main page.

## Run tests

```sh
npm ci
npx playwright install chromium
npx playwright test
```

## Project files

- `tests/` — test scenarios
- `pages/` — page objects and UI flows
- `constants/constants.ts` — site URLs and test credentials
- `playwright.config.ts` — Playwright configuration
- `azure-pipelines.yml` — CI pipeline
