import { expect, Locator, Page } from '@playwright/test';
import { MAIN_PAGE_URL } from '../constants/constants';

export class MainPage {
    readonly page: Page;
    readonly bookAppointmentButton: Locator;
    readonly bookPrescriptionAppointmentButton: Locator;
    readonly selectDiseaseDiv: Locator;
    readonly selectMedicationDiv: Locator;
    readonly agreementsSectionDiv: Locator;
    readonly agreeToAllCheckbox: Locator;
    readonly bookButton: Locator;
    readonly requiredFieldMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.bookAppointmentButton = page.getByRole('button', { name: /Umów się/ });
        this.bookPrescriptionAppointmentButton = page.locator('[aria-label="Menu umawiania konsultacji"] > button:first-child');
        this.selectDiseaseDiv = page.locator('.diseases-categories-wrapper > div:nth-child(2)');
        this.selectMedicationDiv = page.locator('.diseases-categories > div:nth-child(2)');
        this.agreementsSectionDiv = page.locator('.all-agreements.subscription-disabled');
        this.agreeToAllCheckbox = page.locator('.all-agreements.subscription-disabled > :first-child');
        this.bookButton = page.locator('.buttons-wrapper > button:nth-child(2)');
        this.requiredFieldMessage = page.locator('span').filter({
            hasText: 'Pole jest wymagane',
        });
    }

    async open() {
        await this.page.goto(MAIN_PAGE_URL);
    }

    async verifyLoaded() {
        await expect(this.page).toHaveURL(MAIN_PAGE_URL);
        await expect(this.bookAppointmentButton).toBeVisible();
    }

    async bookDefaultPrescriptionAppointment() {
        await this.bookAppointmentButton.click();
        await this.bookPrescriptionAppointmentButton.click();
        await expect(this.page).toHaveURL('https://testyautomatyczne.telemedi.com/pl/make-prescription-consultation');
        await expect(this.selectDiseaseDiv).toBeVisible();
        await this.selectDiseaseDiv.click();
        await expect(this.selectMedicationDiv).toBeVisible();
        await this.selectMedicationDiv.click();
    }
}
