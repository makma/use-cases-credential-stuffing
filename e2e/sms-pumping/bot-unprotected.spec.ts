import { expect, test } from '@playwright/test';
import { TEST_IDS } from '../../src/client/testIDs';

import {
  assertAlert,
  assertSnackbar,
  blockGoogleTagManager,
  resetScenarios,
  scrollDemoIntoView,
} from '../e2eTestUtils';
import { ONE_MINUTE_MS } from '../../src/utils/timeUtils';
import { TEST_BUILD } from '../../src/envShared';
import {
  SMS_FRAUD_COPY,
  TEST_PHONE_NUMBER,
  MAX_SMS_ATTEMPTS,
  SMS_ATTEMPT_TIMEOUT_MAP,
} from '../../src/app/sms-pumping/api/smsPumpingConst';

const TEST_ID = TEST_IDS.smsFraud;

// This test includes waiting for the SMS cool-down period, so it will take longer unless TEST_BUILD is used
if (!TEST_BUILD) {
  test.setTimeout(2 * ONE_MINUTE_MS);
}

test.beforeEach(async ({ page }) => {
  await blockGoogleTagManager(page);
  await page.goto(`/sms-pumping?disableBotDetection=1`);
  await resetScenarios(page);
  await scrollDemoIntoView(page);
});

test.describe('Sending verification SMS messages', () => {
  test('cool-down periods are applied, max 3 attempts', async ({ page }) => {
    const sendButton = await page.getByTestId(TEST_ID.sendMessage);

    for (const attemptNumber of [1, 2]) {
      await sendButton.click();
      await assertAlert({
        page,
        severity: 'success',
        text: SMS_FRAUD_COPY.messageSent({ phone: TEST_PHONE_NUMBER, messagesLeft: MAX_SMS_ATTEMPTS - attemptNumber }),
      });
      await sendButton.click();
      await assertAlert({ page, severity: 'error', text: SMS_FRAUD_COPY.needToWait({ requestsToday: attemptNumber }) });
      await page.waitForTimeout(SMS_ATTEMPT_TIMEOUT_MAP[attemptNumber].timeout);
    }

    await sendButton.click();
    await assertAlert({
      page,
      severity: 'success',
      text: SMS_FRAUD_COPY.messageSent({ phone: TEST_PHONE_NUMBER, messagesLeft: MAX_SMS_ATTEMPTS - 3 }),
    });

    await sendButton.click();
    await assertAlert({ page, severity: 'error', text: SMS_FRAUD_COPY.blockedForToday({ requestsToday: 3 }) });
  });
});

test.describe('Submitting verification code', () => {
  test('Correct code allows user to create an account', async ({ page, browserName }) => {
    const sendButton = await page.getByTestId(TEST_ID.sendMessage);
    await sendButton.click();

    await assertSnackbar({ page, severity: 'info', text: 'Your verification code is' });
    await page.getByTestId(TEST_ID.copyCodeButton).click();

    const code = (await page.getByTestId(TEST_ID.codeInsideSnackbar).textContent()) ?? 'Code not found in snackbar';

    // Reading from clipboard is not available in Safari
    const clipboardAvailable = browserName !== 'webkit';
    if (clipboardAvailable) {
      const codeInClipboard = await page.evaluate(() => navigator.clipboard.readText());
      expect(codeInClipboard).toEqual(code);
    }

    await page.getByTestId(TEST_ID.codeInput).fill(code);
    await page.getByTestId(TEST_ID.sendCode).click();
    await assertAlert({ page, severity: 'success', text: SMS_FRAUD_COPY.accountCreated, index: 1 });
  });

  test('Incorrect code results in error', async ({ page }) => {
    const sendButton = await page.getByTestId(TEST_ID.sendMessage);
    await sendButton.click();
    const incorrectCode = '123456';

    await page.getByTestId(TEST_ID.codeInput).fill(incorrectCode);
    await page.getByTestId(TEST_ID.sendCode).click();
    await assertAlert({ page, severity: 'error', text: SMS_FRAUD_COPY.incorrectCode, index: 1 });
  });
});
