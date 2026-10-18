import { test, expect } from '@playwright/test';
import { MAIN_PAGE_URL } from '../constants/constants';
import { LoginPage } from '../pages/loginPage';
import { MainPage } from '../pages/mainPage';
import { PrescriptionConsultationPage } from '../pages/prescriptionConsultationPage';
import { RemoteConsultationPage } from '../pages/remoteConsultationPage';

test('should reject invalid credentials and sign in with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.loginWithInvalidCredentials();
  await expect(loginPage.invalidCredentialsMessage).toBeVisible();
  await loginPage.loginWithCorrectCredentials();
  await expect(page).toHaveURL(MAIN_PAGE_URL);
});

test.describe('Consultation booking', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.loginWithCorrectCredentials();
  });

  test('should require agreements before redirecting a prescription booking to PayU', async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.verifyLoaded();
    await mainPage.openPrescriptionConsultation();
    const prescriptionPage = new PrescriptionConsultationPage(page);
    await prescriptionPage.selectDefaultOptions();
    await expect(prescriptionPage.submitBookingButton).toBeEnabled();
    await prescriptionPage.submitBookingButton.click();
    await prescriptionPage.verifyRequiredFieldMessages();
    await prescriptionPage.allAgreementsCheckbox.click();
    await prescriptionPage.submitBookingButton.click();

    //@bug: redirect does not always happen. May fail sometimes
    await expect(page).toHaveURL(/https:\/\/secure\.payu\.com\//, {
      timeout: 5000
    });
  });

  test('should book a remote appointment and verify its details on the main page', async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.verifyLoaded();
    await mainPage.openRemoteConsultation();
    const remoteConsultationPage = new RemoteConsultationPage(page);
    const bookedAppointment = await remoteConsultationPage.bookFirstAvailableAppointment();
    await mainPage.verifyBookedAppointmentDetails(bookedAppointment);
  });

  test('@known-bug: specialization selector should collapse after the second click', async ({ page }) => {
    const mainPage = new MainPage(page);
    await mainPage.verifyLoaded();
    await mainPage.openRemoteConsultation();
    const remoteConsultationPage = new RemoteConsultationPage(page);
    await expect(remoteConsultationPage.specializationSelector).toBeVisible();
    await remoteConsultationPage.specializationSelector.click();
    await expect(remoteConsultationPage.specializationSelector).toHaveAttribute('aria-expanded', 'true');
    await remoteConsultationPage.specializationSelector.click();
    await expect(remoteConsultationPage.specializationSelector).toHaveAttribute('aria-expanded', 'false');
  });
});

