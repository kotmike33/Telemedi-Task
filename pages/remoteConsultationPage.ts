import { expect, Locator, Page } from '@playwright/test';
import type { RemoteAppointmentDetails } from '../types/remoteAppointmentDetails';

export class RemoteConsultationPage {
    readonly page: Page;
    readonly specializationSelector: Locator;
    readonly remoteAppointmentTimeSlots: Locator;
    readonly remoteAppointmentDateOptions: Locator;
    readonly remoteAppointmentPaymentButton: Locator;
    readonly visitSummaryTime: Locator;
    readonly visitSummaryDate: Locator;
    readonly visitSummaryName: Locator;
    readonly visitSummaryDescription: Locator;
    readonly visitConfirmedText: Locator;

    constructor(page: Page) {
        this.page = page;
        this.specializationSelector = page.locator('.select-react input');
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
        this.remoteAppointmentPaymentButton = page.getByText('Opłać za', { exact: false }).first();
        this.visitConfirmedText = page
            .locator('p')
            .filter({ hasText: 'Przekierowywanie na stronę operatora płatności' });
    }

    async bookFirstAvailableAppointment(): Promise<RemoteAppointmentDetails> {
        await this.remoteAppointmentDateOptions.nth(1).waitFor({
            state: 'visible',
            timeout: 5000,
        });
        //Known issue. The widget loads twice. Timeout helps to avoid clicking the first date option.
        await this.page.waitForTimeout(1000);
        await this.remoteAppointmentDateOptions.nth(1).click();
        await this.remoteAppointmentTimeSlots.first().click();

        await expect(this.visitSummaryTime).toBeVisible();
        const bookedTimeSlot = (await this.visitSummaryTime.innerText()).trim().match(/\d{2}:\d{2}(?=-)/)?.[0];
        const bookedDate = (await this.visitSummaryDate.innerText()).replace(/^.*?,\s*/, '').trim();
        const bookedName = (await this.visitSummaryName.innerText()).trim();
        const bookedDescription = (await this.visitSummaryDescription.innerText()).trim();
        const bookedDay = bookedDate.match(/\b\d{1,2}\b/)?.[0];
        const bookedYear = bookedDate.match(/\b\d{4}\b/)?.[0].slice(-2);

        if (!bookedTimeSlot || !bookedDay || !bookedYear || !bookedName || !bookedDescription) {
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
}
