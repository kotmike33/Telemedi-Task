import { expect, Locator, Page } from '@playwright/test';

export class PrescriptionConsultationPage {
    readonly diseaseOption: Locator;
    readonly medicationOption: Locator;
    readonly allAgreementsCheckbox: Locator;
    readonly submitBookingButton: Locator;
    readonly requiredFieldMessages: Locator;

    constructor(page: Page) {
        this.diseaseOption = page.getByText('Alergia');
        this.medicationOption = page.getByText('Aerius');
        this.allAgreementsCheckbox = page.locator('label[for="checkAll"]');
        this.submitBookingButton = page.locator('.buttons-wrapper > button:nth-child(2)');
        this.requiredFieldMessages = page.locator('span').filter({
            hasText: 'Pole jest wymagane',
        });
    }

    async selectDefaultOptions() {
        await this.diseaseOption.click();
        await this.medicationOption.click();
    }

    async verifyRequiredFieldMessages() {
        await expect(this.requiredFieldMessages).toHaveCount(3);
        for (let index = 0; index < 3; index++) {
            await expect(this.requiredFieldMessages.nth(index)).toBeVisible();
        }
    }
}
