import { test as base } from '@playwright/test';

export { expect, type Page } from '@playwright/test';

/**
 * Serves the Bootstrap stylesheet that index.html loads from jsDelivr from the installed
 * package, so the tests don't depend on the network. The browser checks the file against the
 * link's `integrity` hash, so a version in index.html that differs from the installed one
 * leaves the page unstyled and fails the "renders without errors" check.
 *
 * Icons that `bs-icon` loads from jsDelivr get a placeholder SVG for the same reason.
 */
const ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8"/></svg>';

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(
      'https://cdn.jsdelivr.net/npm/bootstrap@*/dist/css/bootstrap.min.css',
      (route) =>
        route.fulfill({
          path: 'node_modules/bootstrap/dist/css/bootstrap.min.css',
          contentType: 'text/css',
          headers: { 'Access-Control-Allow-Origin': '*' },
        }),
    );
    await page.route('https://cdn.jsdelivr.net/npm/**/*.svg', (route) =>
      route.fulfill({
        body: ICON,
        contentType: 'image/svg+xml',
        headers: { 'Access-Control-Allow-Origin': '*' },
      }),
    );
    await use(page);
  },
});
