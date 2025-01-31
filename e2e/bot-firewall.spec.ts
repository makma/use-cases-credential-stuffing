import { Locator, Page, expect, test } from '@playwright/test';
import { blockGoogleTagManager, resetScenarios } from './e2eTestUtils';
import { TEST_IDS } from '../src/client/testIDs';
import { BOT_FIREWALL_COPY } from '../src/app/bot-firewall/components/botFirewallCopy';
import { PRODUCTION_E2E_TEST_BASE_URL } from '../src/envShared';

const WEB_SCRAPING_URL = PRODUCTION_E2E_TEST_BASE_URL
  ? `${PRODUCTION_E2E_TEST_BASE_URL}/web-scraping`
  : 'https://staging.fingerprinthub.com/web-scraping';

/**
 * Only run this test in Chrome
 * This test relies on a single common Cloudflare ruleset, we cannot run multiple instances of it at the same time.
 */
test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome-only');
/**
 * Increase timeout to give Cloudflare time to update the ruleset
 */
test.setTimeout(60000);

test.beforeEach(async ({ page }) => {
  await blockGoogleTagManager(page);
  await page.goto('/coupon-fraud');
  await resetScenarios(page);
});

test.describe('Bot Firewall Demo CHROME_ONLY', () => {
  test('Should display bot visit and allow blocking/unblocking its IP address', async ({ page, context }) => {
    // Record bot visit in web-scraping page
    await page.goto('/web-scraping');
    await expect(page.getByTestId(TEST_IDS.common.alert)).toContainText('Malicious bot detected');

    // Check bot visit record and block IP
    await page.goto('/bot-firewall');
    await page.getByRole('button', { name: BOT_FIREWALL_COPY.blockIp }).first().click();
    await page.getByText('was blocked in the application firewall').waitFor();

    /**
     * Try to visit web-scraping page, should be blocked by Cloudflare.
     * Using a separate tab also seems to help with flakiness.
     */
    const secondTab = await context.newPage();
    await secondTab.goto(WEB_SCRAPING_URL);

    await assertElementWhileRepeatedlyReloadingPage(
      secondTab,
      secondTab.getByRole('heading', { name: 'Sorry, you have been blocked' }),
    );

    // Unblock IP
    await page.goto('/bot-firewall');
    await page.getByRole('button', { name: BOT_FIREWALL_COPY.unblockIp }).first().click();
    await page.getByText('was unblocked in the application firewall').waitFor();

    // Try to visit web-scraping page, should be allowed again
    await secondTab.goto(WEB_SCRAPING_URL);
    await assertElementWhileRepeatedlyReloadingPage(
      secondTab,
      secondTab.getByRole('heading', { name: 'Web Scraping Prevention' }),
    );
  });
});

/**
 * Asserts the visibility of a given element by repeatedly reloading the page and waiting for the element to become visible.
 * This is useful for testing non-SPA pages where updates require a page reload.
 *
 * @param {Page} page - The page object to interact with.
 * @param {Locator} locator - The locator for the element to be checked for visibility.
 * @param {number} waitBetweenAttempts - The time to wait between each visibility check attempt, in milliseconds. Defaults to 5000.
 * @param {number} tries - The number of attempts to check the visibility of the element. Defaults to 5.
 * @return {Promise<void>} - A promise that resolves when the element becomes visible, or rejects with an error if the element is not visible after the specified number of attempts.
 */
const assertElementWhileRepeatedlyReloadingPage = async (
  page: Page,
  locator: Locator,
  waitBetweenAttempts = 5000,
  tries = 10,
) => {
  for (let i = 0; i < tries; i++) {
    const isVisible = await locator.isVisible();
    if (isVisible) {
      break;
    }
    await page.waitForTimeout(waitBetweenAttempts);
    await page.reload();
  }
  await locator.waitFor({ state: 'visible' });
};
