import { expect, type Page, test } from './fixtures';
import { expectNoAxeViolations } from './axe';

/**
 * Axe checks of components in their open state. The page checks in `pages.spec.ts` only
 * see each page as it loads, with every menu, dialog and popup closed. These check just
 * the open popup and its trigger, because a popup covering other content trips axe's
 * target size rule on whatever it covers.
 */

/** The live preview of the example under the section heading with this id. */
function example(page: Page, section: string) {
  return page.locator(`h2#${section} ~ docs-example`).first().locator('.docs-example-preview');
}

const STATES: {
  name: string;
  path: string;
  /** The open popup and its trigger. */
  include: string[];
  open: (page: Page) => Promise<void>;
}[] = [
  {
    name: 'an open menu',
    path: 'components/menu',
    include: ['.menu.show', '[aria-expanded="true"]'],
    open: async (page) => {
      await example(page, 'basic').getByRole('button', { name: 'Toggle menu' }).click();
      await expect(example(page, 'basic').locator('.menu.show')).toBeVisible();
    },
  },
  {
    name: 'an open dialog',
    path: 'components/dialog',
    include: ['dialog[open]'],
    open: async (page) => {
      await example(page, 'basic').getByRole('button', { name: 'Open dialog' }).click();
      await expect(page.getByRole('dialog', { name: 'Dialog title' })).toBeVisible();
    },
  },
  {
    name: 'an open drawer',
    path: 'components/drawer',
    include: ['dialog[open]', '[aria-expanded="true"]'],
    open: async (page) => {
      await example(page, 'basic').getByRole('button', { name: 'Open drawer' }).click();
      await expect(example(page, 'basic').getByRole('dialog', { name: 'Drawer' })).toBeVisible();
    },
  },
  {
    name: 'an open popover',
    path: 'components/popover',
    include: ['.popover', '[aria-expanded="true"]'],
    open: async (page) => {
      await page.getByRole('button', { name: 'Click to toggle popover' }).click();
      await expect(page.locator('.popover.show')).toBeVisible();
    },
  },
  {
    name: 'an open tooltip',
    path: 'components/tooltip',
    include: ['.tooltip', '[aria-describedby^="bs-tooltip"]'],
    open: async (page) => {
      await example(page, 'basic').getByRole('button', { name: 'Top' }).focus();
      await expect(page.getByRole('tooltip')).toBeVisible();
    },
  },
  {
    name: 'a shown toast',
    path: 'components/toasts',
    include: ['.toast.show'],
    open: async (page) => {
      await example(page, 'basic').getByRole('button', { name: 'Show toast' }).click();
      await expect(example(page, 'basic').locator('.toast.show')).toBeVisible();
    },
  },
  {
    name: 'an open combobox',
    path: 'forms/combobox',
    include: ['.menu.show', '[aria-expanded="true"]'],
    open: async (page) => {
      await example(page, 'example').getByRole('button', { name: 'Fruit' }).click();
      await expect(page.getByRole('listbox')).toBeVisible();
    },
  },
  {
    name: 'a dialog opened from code',
    path: 'components/dialog',
    include: ['dialog[open]'],
    open: async (page) => {
      await example(page, 'service').getByRole('button', { name: 'Delete report.pdf' }).click();
      await expect(page.getByRole('dialog', { name: 'Delete report.pdf?' })).toBeVisible();
    },
  },
  {
    name: 'an open typeahead',
    path: 'forms/typeahead',
    include: ['[role="listbox"]', '[aria-expanded="true"]'],
    open: async (page) => {
      await example(page, 'example').getByRole('combobox', { name: 'Country' }).fill('an');
      await expect(page.getByRole('listbox')).toBeVisible();
    },
  },
  {
    name: 'an open datepicker',
    path: 'forms/datepicker',
    include: ['[role="dialog"]', '[aria-expanded="true"]'],
    open: async (page) => {
      await example(page, 'overview').getByRole('combobox', { name: 'Datepicker' }).click();
      await expect(page.getByRole('grid').first()).toBeVisible();
    },
  },
];

for (const state of STATES) {
  test(`${state.name} passes axe checks`, async ({ page }) => {
    await page.goto(`${state.path}/`);
    await expect(page.locator('h1').first()).toBeVisible();
    await state.open(page);
    await expectNoAxeViolations(page, state.include);
  });
}
