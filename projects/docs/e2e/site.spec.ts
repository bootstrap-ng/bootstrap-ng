import { expectNoAxeViolations } from './axe';
import { expect, test } from './fixtures';

test.describe('search', () => {
  test('opens with Ctrl+K and finds pages', async ({ page }) => {
    await page.goto('components/accordion/');
    await page.keyboard.press('Control+k');
    const dialog = page.getByRole('dialog', { name: 'Search the docs' });
    const input = dialog.getByRole('searchbox', { name: 'Search' });
    await expect(dialog).toBeVisible();
    await expect(input).toBeFocused();

    await input.fill('tooltip');
    await expect(dialog.getByRole('status')).toHaveText(/\d+ results?/);
    await dialog
      .getByRole('link', { name: /^Tooltip/ })
      .first()
      .click();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/components\/tooltip\/($|#)/);
    await expect(page.locator('h1')).toHaveText('Tooltip');
  });

  test('opens with "/" and reports no results', async ({ page }) => {
    await page.goto('');
    await page.locator('body').press('/');
    const dialog = page.getByRole('dialog', { name: 'Search the docs' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('searchbox').fill('zzzqqqxxx');
    await expect(dialog.getByRole('status')).toHaveText('No results');
    // The first Escape clears the search field, as in any search input; the next closes.
    await page.keyboard.press('Escape');
    await expect(dialog.getByRole('searchbox')).toHaveValue('');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});

test.describe('table of contents', () => {
  test('lists the page sections and follows the scroll', async ({ page }) => {
    await page.goto('components/alert/');
    const toc = page.getByRole('navigation', { name: 'On this page' });
    const headings = await page.locator('#content h2[id], #content h3[id]').allTextContents();
    await expect(toc.getByRole('link')).toHaveText(headings.map((text) => text.trim()));
    await expect(toc.getByRole('link').first()).toHaveAttribute('aria-current', 'location');

    await toc.getByRole('link', { name: 'Dismissing' }).click();
    await expect(page).toHaveURL(/#dismissible$/);
    await expect(page.locator('h2#dismissible')).toBeInViewport();
    await expect(toc.getByRole('link', { name: 'Dismissing' })).toHaveAttribute(
      'aria-current',
      'location',
    );
  });

  test('updates after navigating to another page', async ({ page }) => {
    await page.goto('components/alert/');
    await page.locator('.docs-sidebar').getByRole('link', { name: 'Badge' }).click();
    await expect(page.locator('h1')).toHaveText('Badge');
    const toc = page.getByRole('navigation', { name: 'On this page' });
    const first = await page.locator('#content h2[id]').first().textContent();
    await expect(toc.getByRole('link').first()).toHaveText(first!.trim());
  });
});

test('the color mode toggle switches and persists', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('getting-started/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-bs-theme', 'light');
  // Until the user picks a mode, nothing is saved, so the site keeps following the system.
  await expect.poll(() => page.evaluate(() => localStorage.getItem('docs-color-mode'))).toBeNull();
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(html).toHaveAttribute('data-bs-theme', 'dark');
  // The meta keeps both schemes; Bootstrap's [data-bs-theme] rule applies the chosen one.
  await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute('content', 'light dark');
  await expect(html).toHaveCSS('color-scheme', 'dark');
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
  await page.reload();
  await expect(html).toHaveAttribute('data-bs-theme', 'dark');
});

test('the home page keeps light text over its dark backdrop in light mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('');
  await expect(page.locator('html')).toHaveAttribute('data-bs-theme', 'light');
  await expect(page.locator('docs-root')).toHaveAttribute('data-bs-theme', 'dark');
  await expect(page.locator('h1')).toHaveCSS('color-scheme', 'dark');
  await page.getByRole('link', { name: 'Get started' }).click();
  await expect(page.locator('h1')).toHaveText('Introduction');
  await expect(page.locator('docs-root')).not.toHaveAttribute('data-bs-theme');
});

test('the header marks the current section', async ({ page }) => {
  await page.goto('components/alert/');
  const main = page.locator('nav[aria-label="Main"]');
  await expect(main.locator('a', { hasText: 'Components' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect(main.locator('a', { hasText: 'Forms' })).not.toHaveAttribute('aria-current');
});

test('the skip link moves focus to the main content', async ({ page }) => {
  await page.goto('components/alert/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press('Enter');
  // It stays on the same page rather than resolving `#content` against `<base href>`.
  await expect(page).toHaveURL(/components\/alert\/#content$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Alert' })).toBeVisible();
});

test.describe('on small screens', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the menu button shows the sidebar', async ({ page }) => {
    await page.goto('components/alert/');
    const menu = page.getByRole('button', { name: 'Menu' });
    const sidebar = page.locator('#docs-sidebar');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(sidebar.getByRole('link', { name: 'Badge' })).toBeHidden();
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await sidebar.getByRole('link', { name: 'Badge' }).click();
    await expect(page.locator('h1')).toHaveText('Badge');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
  });

  test('the sidebar opens as a bottom drawer that closes', async ({ page }) => {
    await page.goto('components/alert/');
    const menu = page.getByRole('button', { name: 'Menu' });
    await menu.click();
    const drawer = page.getByRole('dialog', { name: 'Browse docs' });
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveCSS('position', 'fixed');
    await expectNoAxeViolations(page);
    await drawer.getByRole('button', { name: 'Close' }).click();
    await expect(drawer).toBeHidden();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
  });
});

test('the sidebar shows inline from the lg breakpoint', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('components/alert/');
  await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
  await expect(page.locator('#docs-sidebar').getByRole('link', { name: 'Badge' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Browse docs' })).toBeHidden();
});

test.describe('after a redeploy', () => {
  test('loads the page in full when its code chunk is gone', async ({ page }) => {
    await page.goto('components/alert/');
    await page.evaluate(() => Object.assign(window, { staleTab: true }));
    // A tab opened before a deploy asks for chunk file names the new deploy no longer has.
    await page.route('**/chunk-*.js', (route) => route.fulfill({ status: 404 }), { times: 1 });

    await page.locator('.docs-sidebar').getByRole('link', { name: 'Badge' }).click();
    await expect(page.locator('h1')).toHaveText('Badge');
    await expect(page).toHaveURL(/components\/badge\/$/);
    expect(await page.evaluate(() => 'staleTab' in window)).toBe(false);
  });
});

test('sends the security headers from the _headers file', async ({ request }) => {
  const response = await request.get('components/alert/');
  const headers = response.headers();
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(headers['content-security-policy']).toMatch(/script-src 'self' 'sha256-/);
  expect(headers).toMatchObject({
    'strict-transport-security': expect.stringContaining('max-age='),
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy': expect.stringContaining('camera=()'),
    'cross-origin-opener-policy': 'same-origin',
  });
});
