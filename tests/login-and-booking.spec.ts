import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { MAIN_PAGE_URL } from '../constants/appConstants';
import { MainPage } from '../pages/mainPage';

test.describe('Login', () => {
  test('should reject invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginWithInvalidCredentials();
    await expect(loginPage.invalidCredentialsMessage).toBeVisible();
  });

  test('should sign in with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginWithCorrectCredentials();
    await expect(page).toHaveURL(MAIN_PAGE_URL);
  });
});

test.describe('Booking', () => {
  test('should book a prescription consultation up to payment redirect', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginWithCorrectCredentials();

    const mainPage = new MainPage(page);
    await mainPage.verifyMainPageLoaded();
    await mainPage.startPrescriptionBookingWithDefaults();
    await mainPage.allAgreementsCheckbox.click();
    await page.waitForTimeout(1000);
    await mainPage.submitBookingButton.click();
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
    await mainPage.verifyMainPageLoaded();
    await mainPage.startPrescriptionBookingWithDefaults();
    await mainPage.submitBookingButton.click();
    await mainPage.verifyRequiredFieldMessages();
  });

  test('should create and verify a remote appointment booking', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginWithCorrectCredentials();

    const mainPage = new MainPage(page);
    await mainPage.verifyMainPageLoaded();
    const {
        bookedTimeSlot,
        bookedDay,
        bookedYear,
        bookedName,
        bookedDescription
    } = await mainPage.bookFirstAvailableRemoteAppointment();

    await mainPage.verifyBookedAppointmentDetails(bookedTimeSlot, bookedDay, bookedYear, bookedName, bookedDescription);

  });
});

