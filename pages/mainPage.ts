import { expect, Locator, Page } from '@playwright/test';
import { MAIN_PAGE_URL } from '../constants/appConstants';

export class MainPage {
    readonly page: Page;
    readonly bookAppointmentMenuButton: Locator;
    readonly bookPrescriptionAppointmentButton: Locator;
    readonly bookRemoteAppointmentButton: Locator;
    readonly diseaseOption: Locator;
    readonly medicationOption: Locator;
    readonly allAgreementsCheckbox: Locator;
    readonly submitBookingButton: Locator;
    readonly requiredFieldMessages: Locator;

    readonly remoteAppointmentTimeSlots: Locator;
    readonly remoteAppointmentDateOptions: Locator;
    readonly remoteAppointmentPaymentButton: Locator;
    readonly visitSummaryTime: Locator;
    readonly visitSummaryDate: Locator;
    readonly visitSummaryName: Locator;
    readonly visitSummaryDescription: Locator;

    readonly closeReminderPopupButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.bookAppointmentMenuButton = page.getByRole('button', { name: /Umów się/ });
        this.bookPrescriptionAppointmentButton = page.locator('[aria-label="Menu umawiania konsultacji"] > button:first-child');
        this.bookRemoteAppointmentButton = page.locator('[aria-label="Menu umawiania konsultacji"] > button:nth-child(2)');
        this.diseaseOption = page.getByText('Alergia');
        this.medicationOption = page.getByText('Aerius');
        this.allAgreementsCheckbox = page.locator('label[for="checkAll"]');
        this.submitBookingButton = page.locator('.buttons-wrapper > button:nth-child(2)');
        this.requiredFieldMessages = page.locator('span').filter({
            hasText: 'Pole jest wymagane',
        });
        this.remoteAppointmentTimeSlots = page.locator('button').filter({ has: page.locator('p', { hasText: 'Umów za' }) });
        this.remoteAppointmentDateOptions = page.locator(`label[for*="${new Date().getFullYear()}"]`);
        this.visitSummaryTime = page.locator('.booked-visit-summary__dates-item').first();
        this.visitSummaryDate = page.locator('.booked-visit-summary__dates-item.booked-visit-summary__dates-item--center').first();
        this.visitSummaryName = page.locator('.booked-visit-summary__name');
        this.visitSummaryDescription = page.locator('.booked-visit-summary__description');
        this.remoteAppointmentPaymentButton = page.getByText('Opłać za', { exact: false }).first();
        this.closeReminderPopupButton = page.locator('button[title="Zamknij"]');
    }

    async open() {
        await this.page.goto(MAIN_PAGE_URL);
        await this.closeReminderPopupIfVisible();
    }

    async closeReminderPopupIfVisible() {
        if (await this.closeReminderPopupButton.isVisible()) {
            await this.closeReminderPopupButton.click();
        }
    }

    async verifyMainPageLoaded() {
        await expect(this.page).toHaveURL(MAIN_PAGE_URL);
        await this.closeReminderPopupIfVisible();
        await expect(this.bookAppointmentMenuButton).toBeVisible();
    }

    async startPrescriptionBookingWithDefaults() {
        await this.bookAppointmentMenuButton.click();
        await this.bookPrescriptionAppointmentButton.click();
        await expect(this.page).toHaveURL('https://testyautomatyczne.telemedi.com/pl/make-prescription-consultation');
        await this.diseaseOption.click();
        await this.medicationOption.click();
    }

    async bookFirstAvailableRemoteAppointment() {
        await this.bookAppointmentMenuButton.click();
        await this.bookRemoteAppointmentButton.click();
        await expect(this.page).toHaveURL('https://testyautomatyczne.telemedi.com/pl/make-consultation');
        try {
            await this.remoteAppointmentTimeSlots.first().waitFor({
                state: 'visible',
                timeout: 5000,
            });
        } catch (timeoutError) {
            console.log('No time slots appeared for today, selecting the next available date.');
            await this.remoteAppointmentDateOptions.nth(2).click();
            await this.remoteAppointmentTimeSlots.first().waitFor({
                state: 'visible',
                timeout: 10000,
            });
        }
        await this.remoteAppointmentTimeSlots.first().click();
        await expect(this.visitSummaryTime).toBeVisible();
        const bookedTimeSlot = (await this.visitSummaryTime.innerText())?.trim().match(/\d{2}:\d{2}(?=-)/)?.[0];
        const bookedDate = (await this.visitSummaryDate.innerText())?.replace(/^.*?,\s*/, '').trim();
        const bookedName = (await this.visitSummaryName.innerText())?.trim();
        const bookedDescription = (await this.visitSummaryDescription.innerText())?.trim();
        const bookedDay = bookedDate.match(/\b\d{1,2}\b/)?.[0];
        const bookedYear = bookedDate.match(/\b\d{4}\b/)?.[0].slice(-2);

        if (!bookedTimeSlot || !bookedDay || !bookedYear || !bookedName || !bookedDescription) {
            throw new Error('Booking details are incomplete; unable to verify the created booking.');
        }

        await this.remoteAppointmentPaymentButton.click();


        return {
        bookedTimeSlot: bookedTimeSlot,
        bookedDay: bookedDay,
        bookedYear: bookedYear,
        bookedName: bookedName,
        bookedDescription: bookedDescription
        };
    }

    async verifyBookedAppointmentDetails(bookedTimeSlot: string, bookedDay: string, bookedYear: string, bookedName: string, bookedDescription: string) {
        await this.open();
        const mainSection = this.page.locator('//main/section');
        await expect(mainSection.locator('span').filter({ hasText: bookedTimeSlot }).first()).toBeVisible();
        await expect(mainSection.locator('span').filter({ hasText: bookedDay }).first()).toBeVisible();
        await expect(mainSection.locator('span').filter({ hasText: bookedYear }).first()).toBeVisible();
        await expect(mainSection.locator('p').filter({ hasText: bookedName }).first()).toBeVisible();
        await expect(mainSection.locator('p').filter({ hasText: bookedDescription }).first()).toBeVisible();
    }

    async verifyRequiredFieldMessages() {
        await expect(this.requiredFieldMessages).toHaveCount(3);
        for (let index = 0; index < 3; index++) {
            await expect(this.requiredFieldMessages.nth(index)).toBeVisible();
        }
    }
}

