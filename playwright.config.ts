import { defineConfig, devices } from '@playwright/test';
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import 'dotenv/config';
import { PRODUCTION_E2E_TEST_BASE_URL } from './src/envShared';

const IS_CI = Boolean(process.env.CI);
const PORT = process.env.PORT || 3000;
const LOCALHOST_URL = `http://localhost:${PORT}`;
/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: IS_CI,
  /* Retry on CI only */
  retries: IS_CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], ['list']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: PRODUCTION_E2E_TEST_BASE_URL ?? LOCALHOST_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Record video of the failed tests */
    video: { mode: 'on-first-retry', size: { width: 640, height: 480 } },
  },

  /* In CI/GitHub action, run the production server before running tests
   * (assumes `yarn build` was called before)
   */
  webServer: PRODUCTION_E2E_TEST_BASE_URL
    ? undefined
    : {
        command: `yarn start`,
        url: LOCALHOST_URL,
        timeout: 120 * 1000,
        // Don't `yarn start` (reuse existing server instead) if you are running locally
        reuseExistingServer: !IS_CI,
      },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], screenshot: { mode: 'only-on-failure' }, permissions: ['clipboard-read'] },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        screenshot: { mode: 'only-on-failure' },
        // Firefox is extra secure, so you need to enable clipboard read permission like this
        // https://github.com/microsoft/playwright/issues/13037#issuecomment-1739856724
        launchOptions: {
          firefoxUserPrefs: {
            'dom.events.asyncClipboard.readText': true,
            'dom.events.testing.asyncClipboard': true,
          },
        },
      },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], screenshot: { mode: 'only-on-failure' } },
      // Webkit cannot read the clipboard at all, skip that part of the tests for webkit
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { channel: 'chrome' },
    // },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',
});
