import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { LOGIN_SUCCESS_URL } from '../constants/constants';
import { MainPage } from '../pages/mainPage';

test.describe('Login', () => {
  test('with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginWithInvalidCredentials();
    await expect(loginPage.invalidCredentialsMessage).toBeVisible();
  });

  test('with correct credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginWithCorrectCredentials();
    await expect(page).toHaveURL(LOGIN_SUCCESS_URL);
  });
});

test.describe('Booking', () => {
  test('should book a prescription consultation up to payment redirect', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginWithCorrectCredentials();

    const mainPage = new MainPage(page);
    await mainPage.verifyLoaded();
    await mainPage.bookDefaultPrescriptionAppointment();
    await mainPage.agreeToAllCheckbox.click();
    await page.waitForTimeout(1000);
    await mainPage.bookButton.click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/https:\/\/secure\.payu\.com\//);
  });

  // Better to login by API and use the state stored to avoid code duplication 
  // and time-consuming login process
  // but for now, it is not covered in onboarding task.
  test('should not book a prescription consultation without required agreements', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginWithCorrectCredentials();

    const mainPage = new MainPage(page);
    await mainPage.verifyLoaded();
    await mainPage.bookDefaultPrescriptionAppointment();
    await mainPage.bookButton.click();
    await mainPage.verifyRequiredFieldMessages();
  });

  test('should create a booking and then verify it', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginWithCorrectCredentials();

    const mainPage = new MainPage(page);
    await mainPage.verifyLoaded();
    const {
        bookedTimeSlot,
        bookedDay,
        bookedYear,
        bookedName,
        bookedDescription
    } = await mainPage.bookDefaultRemoteAppointment();

    await mainPage.verifyBookedAppointmentDetails(bookedTimeSlot, bookedDay, bookedYear, bookedName, bookedDescription);

  });
});
