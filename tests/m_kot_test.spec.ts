import { test, expect } from '@playwright/test';
import { MAIN_PAGE_URL } from '../constants/constants';
import { LoginPage } from '../pages/loginPage';
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
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginWithCorrectCredentials();
  });

  test('should book a prescription consultation up to payment redirect', async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.verifyMainPageLoaded();
    await mainPage.startPrescriptionBookingWithDefaults();
    await mainPage.allAgreementsCheckbox.click();
    await expect(mainPage.submitBookingButton).toBeEnabled();
    await mainPage.submitBookingButton.click();

    //payment redirect verification
    /*
    await expect(page).toHaveURL(/https:\/\/secure\.payu\.com\//, {
      timeout: 1000
    });
    */
  });

  test('should not book a prescription consultation without required agreements', async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.verifyMainPageLoaded();
    await mainPage.startPrescriptionBookingWithDefaults();
    await mainPage.submitBookingButton.click();
    await mainPage.verifyRequiredFieldMessages();
  });

  test('should create and verify a remote appointment booking', async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.verifyMainPageLoaded();
    const bookedAppointment = await mainPage.bookFirstAvailableRemoteAppointment();
    try{
      await mainPage.verifyBookedAppointmentDetails(bookedAppointment);
    }catch (error) {
      console.error('Verification failed due to missing booking popup. Attempting to re-open the main page and verify again.');
      await mainPage.verifyBookedAppointmentDetails(bookedAppointment);
    }
  });
});

