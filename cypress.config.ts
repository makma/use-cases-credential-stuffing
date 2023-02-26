import { defineConfig } from 'cypress';

/**
 *  This project uses Playwright for end-to-end tests a Cypress for bot detection demonstrations
 * */
export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    video: false,
    supportFile: false,
  },
});
