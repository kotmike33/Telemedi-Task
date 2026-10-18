import { expect, Locator, Page } from '@playwright/test';
import {
    MAIN_PAGE_URL,
    PRESCRIPTION_CONSULTATION_URL,
    REMOTE_CONSULTATION_URL,
} from '../constants/constants';
import type { RemoteAppointmentDetails } from '../types/remoteAppointmentDetails';

export class MainPage {
    readonly page: Page;
    readonly bookAppointmentMenuButton: Locator;
    readonly bookPrescriptionAppointmentButton: Locator;
    readonly bookRemoteAppointmentButton: Locator;
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

    async verifyLoaded() {
        await expect(this.page).toHaveURL(MAIN_PAGE_URL);
        await this.closeReminderPopupIfVisible();
        await expect(this.bookAppointmentMenuButton).toBeVisible();
    }

    async openPrescriptionConsultation() {
        await this.bookAppointmentMenuButton.click();
        await this.bookPrescriptionAppointmentButton.click();
        await expect(this.page).toHaveURL(PRESCRIPTION_CONSULTATION_URL);
    }

    async openRemoteConsultation() {
        await this.bookAppointmentMenuButton.click();
        await this.bookRemoteAppointmentButton.click();
        await expect(this.page).toHaveURL(REMOTE_CONSULTATION_URL);
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
}
