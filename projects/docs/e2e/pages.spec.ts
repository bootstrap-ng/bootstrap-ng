import { expect, test } from './fixtures';
import { expectNoAxeViolations } from './axe';
import { NAV } from '../src/app/nav';

const PAGES = [{ title: 'bootstrap-ng', path: '' }, ...NAV.flatMap((section) => section.items)];

for (const page of PAGES) {
  test.describe(`/${page.path}`, () => {
    test('is prerendered', async ({ request }) => {
      const response = await request.get(page.path ? `${page.path}/` : '');
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).toMatch(/<h1[\s>]/);
      expect(html).toContain('data-pagefind-body');
    });

    test('has a canonical link and a last-modified date', async ({ page: browserPage }) => {
      await browserPage.goto(page.path ? `${page.path}/` : '');
      await expect(browserPage.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `https://bootstrap-ng.com/${page.path ? `${page.path}/` : ''}`,
      );
      const lastModified = await browserPage
        .locator('meta[name="last-modified"]')
        .getAttribute('content');
      expect(Number.isNaN(Date.parse(lastModified ?? ''))).toBe(false);
    });

    test('renders without errors', async ({ page: browserPage }) => {
      const errors: string[] = [];
      browserPage.on('pageerror', (error) => errors.push(error.message));
      browserPage.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });

      await browserPage.goto(page.path ? `${page.path}/` : '');
      await expect(browserPage.locator('h1').first()).toBeVisible();
      await expect(browserPage).toHaveTitle(
        page.path ? new RegExp(`· bootstrap-ng$`) : /bootstrap-ng/,
      );
      if (page.path) {
        await expect(browserPage.locator('.docs-sidebar a[aria-current="page"]')).toHaveText(
          page.title,
        );
      }
      expect(errors).toEqual([]);
    });

    test('has unique ids that its references and in-page links point to', async ({
      page: browserPage,
    }) => {
      await browserPage.goto(page.path ? `${page.path}/` : '');
      await expect(browserPage.locator('h1').first()).toBeVisible();
      // The "On this page" links are built in the browser once the page has rendered.
      if (await browserPage.locator('#content [docsHeading]').count()) {
        await expect(browserPage.locator('.docs-toc a').first()).toBeAttached();
      }
      const problems = await browserPage.evaluate(() => {
        const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
        const known = new Set(ids);
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
        const references = [
          ...document.querySelectorAll(
            '[aria-controls], [aria-labelledby], [aria-describedby], [aria-activedescendant], label[for]',
          ),
        ].flatMap((element) =>
          ['aria-controls', 'aria-labelledby', 'aria-describedby', 'aria-activedescendant', 'for']
            .flatMap((name) => element.getAttribute(name)?.split(/\s+/) ?? [])
            .filter((id) => id && !known.has(id)),
        );
        // In-page links, including the "On this page" ones, must lead to something on screen,
        // not to a heading inside a closed drawer or dialog.
        const anchors = [
          ...document.querySelectorAll<HTMLAnchorElement>(
            `a[href^="#"], a[href^="${location.pathname}#"]`,
          ),
        ]
          .map((link) => decodeURIComponent(link.hash.slice(1)))
          .filter(
            (id) =>
              id && !document.getElementById(id)?.checkVisibility({ visibilityProperty: true }),
          );
        return { duplicates, references, anchors };
      });
      expect(problems).toEqual({ duplicates: [], references: [], anchors: [] });
    });

    test('does not shift its layout while loading', async ({ page: browserPage }) => {
      await browserPage.addInitScript(() => {
        const shifts: number[] = [];
        Object.assign(window, { docsLayoutShifts: shifts });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & { value: number })[]) {
            shifts.push(entry.value);
          }
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await browserPage.goto(page.path ? `${page.path}/` : '', { waitUntil: 'networkidle' });
      const shift = await browserPage.evaluate(() =>
        (window as unknown as { docsLayoutShifts: number[] }).docsLayoutShifts.reduce(
          (sum, value) => sum + value,
          0,
        ),
      );
      // Lighthouse counts a cumulative layout shift under 0.1 as good.
      expect(shift).toBeLessThan(0.1);
    });

    for (const mode of ['light', 'dark'] as const) {
      test(`passes axe checks in ${mode} mode`, async ({ page: browserPage }) => {
        await browserPage.addInitScript((value) => {
          localStorage.setItem('docs-color-mode', value);
        }, mode);
        await browserPage.goto(page.path ? `${page.path}/` : '');
        await expect(browserPage.locator('html')).toHaveAttribute('data-bs-theme', mode);
        await expect(browserPage.locator('h1').first()).toBeVisible();

        await expectNoAxeViolations(browserPage);
      });
    }
  });
}

test('loads the app for paths that are not prerendered', async ({ page }) => {
  await page.goto('does-not-exist');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('h1').first()).toBeVisible();
});

test('navigates between pages from the sidebar', async ({ page }) => {
  await page.goto('components/accordion/');
  await page.locator('.docs-sidebar').getByRole('link', { name: 'Tooltip' }).click();
  await expect(page).toHaveURL(/components\/tooltip\/$/);
  await expect(page.locator('h1')).toHaveText('Tooltip');
});

test('page URLs end in a slash', async ({ page, request }) => {
  const response = await request.get('components/alert', { maxRedirects: 0 });
  expect(response.status()).toBe(301);
  expect(response.headers()['location']).toBe('/components/alert/');

  await page.goto('components/alert/');
  const hrefs = await page
    .locator('header a[href^="/"], .docs-sidebar a[href]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  expect(hrefs.length).toBeGreaterThan(NAV.flatMap((section) => section.items).length);
  for (const href of hrefs) {
    expect(href).toMatch(/\/$/);
  }
  await expect(
    page.getByRole('navigation', { name: 'On this page' }).getByRole('link').first(),
  ).toHaveAttribute('href', /^\/components\/alert\/#/);
});

test('every page has its own description, matched by its OpenGraph tags', async ({ request }) => {
  const descriptions = new Map<string, string>();
  for (const page of PAGES) {
    const path = page.path ? `${page.path}/` : '';
    const html = await (await request.get(path)).text();
    const meta = (attribute: string) =>
      new RegExp(`<meta ${attribute} content="([^"]*)"`).exec(html)?.[1];
    const description = meta('name="description"') ?? '';
    expect(description, `/${path}`).not.toBe('');
    expect(descriptions.get(description), `/${path} repeats a description`).toBeUndefined();
    descriptions.set(description, path);
    expect(meta('property="og:description"'), `/${path}`).toBe(description);
    expect(meta('property="og:title"'), `/${path}`).toBe(/<title>([^<]*)<\/title>/.exec(html)?.[1]);
    expect(meta('property="og:url"'), `/${path}`).toBe(`https://bootstrap-ng.com/${path}`);
  }
});
