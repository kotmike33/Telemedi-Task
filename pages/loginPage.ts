import { expect, Locator, Page } from '@playwright/test';
import {
    LOGIN_PAGE_URL,
    TEST_CREDENTIALS,
} from '../constants/constants';

export class LoginPage {
    readonly page: Page;
    readonly usernameField: Locator;
    readonly passwordField: Locator;
    readonly loginButton: Locator;
    readonly invalidCredentialsMessage: Locator;
    readonly acceptAllCookiesButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.usernameField = page.locator('#username');
        this.passwordField = page.locator('#password');
        this.loginButton = page.locator('button[type="submit"]');
        this.invalidCredentialsMessage = page.getByText('Nieprawidłowe dane logowania', { exact: false });
        this.acceptAllCookiesButton = page.getByRole('button').filter({
            has: page.getByText('Akceptuję', { exact: true }),
        });
    }

    async open() {
        await this.page.goto(LOGIN_PAGE_URL);
        try {
            await this.acceptAllCookiesButton.waitFor({ state: 'visible', timeout: 1500 });
        } catch {
            return;
        }
        await this.acceptAllCookiesButton.click();
    }

    async loginWithCorrectCredentials() {
        await this.usernameField.fill(TEST_CREDENTIALS.username);
        await this.passwordField.fill(TEST_CREDENTIALS.password);
        await this.loginButton.click();
    }

    async loginWithInvalidCredentials() {
        await this.usernameField.fill('invalid-username');
        await this.passwordField.fill('invalid-password');
        await this.loginButton.click();
    }
}

