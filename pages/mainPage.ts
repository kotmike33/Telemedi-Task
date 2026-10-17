import { expect, Locator, Page } from '@playwright/test';
import {
    MAIN_PAGE_URL,
    PRESCRIPTION_CONSULTATION_URL,
    REMOTE_CONSULTATION_URL,
} from '../constants/constants';

export interface RemoteAppointmentDetails {
    bookedTimeSlot: string;
    bookedDay: string;
    bookedYear: string;
    bookedName: string;
    bookedDescription: string;
}

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
    readonly visitConfirmedText: Locator;

    readonly closeReminderPopupButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.bookAppointmentMenuButton = page.getByRole('button', { name: /Umów się/ });
        this.bookPrescriptionAppointmentButton = page.locator(
            '[aria-label="Menu umawiania konsultacji"] > button:first-child',
        );
        this.bookRemoteAppointmentButton = page.locator(
            '[aria-label="Menu umawiania konsultacji"] > button:nth-child(2)',
        );
        this.diseaseOption = page.getByText('Alergia');
        this.medicationOption = page.getByText('Aerius');
        this.allAgreementsCheckbox = page.locator('label[for="checkAll"]');
        this.submitBookingButton = page.locator('.buttons-wrapper > button:nth-child(2)');
        this.requiredFieldMessages = page.locator('span').filter({
            hasText: 'Pole jest wymagane',
        });
        this.remoteAppointmentTimeSlots = page.locator('button').filter({
            has: page.locator('p', { hasText: 'Umów za' }),
        });
        this.remoteAppointmentDateOptions = page.locator(`label[for*="${new Date().getFullYear()}"]`);
        this.visitSummaryTime = page.locator('.booked-visit-summary__dates-item').nth(1);
        this.visitSummaryDate = page
            .locator('.booked-visit-summary__dates-item.booked-visit-summary__dates-item--center')
            .first();
        this.visitSummaryName = page.locator('.booked-visit-summary__name');
        this.visitSummaryDescription = page.locator('.booked-visit-summary__description');
        this.remoteAppointmentPaymentButton = page
            .getByText('Opłać za', { exact: false })
            .first();
        this.closeReminderPopupButton = page.locator('button[title="Zamknij"]');
        this.visitConfirmedText = page.locator('p').filter({ hasText: 'Przekierowywanie na stronę operatora płatności' });
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
        await expect(this.page).toHaveURL(PRESCRIPTION_CONSULTATION_URL);
        await this.diseaseOption.click();
        await this.medicationOption.click();
    }

    async bookFirstAvailableRemoteAppointment() {
        await this.bookAppointmentMenuButton.click();
        await this.bookRemoteAppointmentButton.click();
        await expect(this.page).toHaveURL(REMOTE_CONSULTATION_URL);
        await this.remoteAppointmentDateOptions.nth(1).waitFor({
            state: 'visible',
            timeout: 5000,
        });
        this.page.pause();
        await this.remoteAppointmentDateOptions.nth(1).click();
        await this.remoteAppointmentTimeSlots.first().click();
        await expect(this.visitSummaryTime).toBeVisible();
        const bookedTimeSlot = (await this.visitSummaryTime.innerText()).trim().match(/\d{2}:\d{2}(?=-)/)?.[0];
        const bookedDate = (await this.visitSummaryDate.innerText()).replace(/^.*?,\s*/, '').trim();
        const bookedName = (await this.visitSummaryName.innerText()).trim();
        const bookedDescription = (await this.visitSummaryDescription.innerText()).trim();
        const bookedDay = bookedDate.match(/\b\d{1,2}\b/)?.[0];
        const bookedYear = bookedDate.match(/\b\d{4}\b/)?.[0].slice(-2);

        console.log('Extracted booking details:', {
            bookedTimeSlot,
            bookedDay,
            bookedYear,
            bookedName,
            bookedDescription,
        });

        if (!bookedTimeSlot || !bookedDay || !bookedYear || !bookedName || !bookedDescription) {
            this.page.pause();
            throw new Error('Booking details are incomplete; unable to verify the created booking.');
        }

        await this.remoteAppointmentPaymentButton.click();
        await expect(this.visitConfirmedText).toBeVisible();

        return {
            bookedTimeSlot,
            bookedDay,
            bookedYear,
            bookedName,
            bookedDescription,
        };
    }

    async verifyBookedAppointmentDetails(details: RemoteAppointmentDetails) {
        await this.open();
        const mainSection = this.page.locator('//main/section');
        const summarySpans = mainSection.locator('span');
        const summaryParagraphs = mainSection.locator('p');
        await expect(summarySpans.filter({ hasText: details.bookedTimeSlot }).first()).toBeVisible();
        await expect(summarySpans.filter({ hasText: details.bookedDay }).first()).toBeVisible();
        await expect(summarySpans.filter({ hasText: details.bookedYear }).first()).toBeVisible();
        await expect(summaryParagraphs.filter({ hasText: details.bookedName }).first()).toBeVisible();
        await expect(summaryParagraphs.filter({ hasText: details.bookedDescription }).first()).toBeVisible();
    }

    async verifyRequiredFieldMessages() {
        await expect(this.requiredFieldMessages).toHaveCount(3);
        for (let index = 0; index < 3; index++) {
            await expect(this.requiredFieldMessages.nth(index)).toBeVisible();
        }
    }
}

