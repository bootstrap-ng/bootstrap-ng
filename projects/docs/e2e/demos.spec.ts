import { expect, type Page, test } from './fixtures';

/** The live preview of the example under the section heading with this id. */
function example(page: Page, section: string) {
  return page.locator(`h2#${section} ~ docs-example`).first().locator('.docs-example-preview');
}

test('accordion items close each other', async ({ page }) => {
  await page.goto('components/accordion/');
  const demo = example(page, 'basic');
  const items = demo.locator('details');
  await expect(items.nth(0)).toHaveAttribute('open', '');
  await demo.getByText('Accordion item #2').click();
  await expect(items.nth(1)).toHaveAttribute('open', '');
  await expect(items.nth(0)).not.toHaveAttribute('open', '');
});

test('a dismissible alert closes and can be shown again', async ({ page }) => {
  await page.goto('components/alert/');
  const demo = example(page, 'dismissible');
  await demo.getByRole('button', { name: 'Close' }).click();
  await expect(demo.getByRole('alert')).toHaveCount(0);
  // Focus moves on from the close button instead of dropping to the page.
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('BUTTON');
  await demo.getByRole('button', { name: 'Show the alert again' }).click();
  await expect(demo.getByRole('alert')).toBeVisible();
});

test('a collapse toggles its content', async ({ page }) => {
  await page.goto('components/collapse/');
  const demo = example(page, 'basic');
  const toggle = demo.getByRole('button', { name: 'Toggle details' });
  const content = demo.locator('.collapse');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(content).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(content).toBeVisible();
});

test('a checkbox opens a collapse through two-way binding', async ({ page }) => {
  await page.goto('components/collapse/');
  const demo = example(page, 'model');
  const checkbox = demo.getByRole('checkbox', { name: 'Show advanced options' });
  const content = demo.locator('.collapse');
  await expect(content).toBeHidden();
  await checkbox.check();
  await expect(content).toBeVisible();
  await expect(demo).toContainText('Events: shown');
  await checkbox.uncheck();
  await expect(content).toBeHidden();
});

test('a dialog traps focus, closes on Escape and restores focus', async ({ page }) => {
  await page.goto('components/dialog/');
  const demo = example(page, 'basic');
  const opener = demo.getByRole('button', { name: 'Open dialog' });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Dialog title' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('native dialog element');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test('a drawer opens from its toggle and closes from its close button', async ({ page }) => {
  await page.goto('components/drawer/');
  const demo = example(page, 'basic');
  await demo.getByRole('button', { name: 'Open drawer' }).click();
  const drawer = demo.getByRole('dialog', { name: 'Drawer' });
  await expect(drawer).toBeVisible();
  await drawer.getByRole('button', { name: 'Close' }).click();
  await expect(drawer).toBeHidden();
});

test('a dialog opened from code returns its result', async ({ page }) => {
  await page.goto('components/dialog/');
  const demo = example(page, 'service');
  const opener = demo.getByRole('button', { name: 'Delete report.pdf' });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Delete report.pdf?' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Delete' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(demo).toContainText('Result: deleted');
  await expect(opener).toBeFocused();
  await opener.click();
  // Escape only closes the dialog once it is open.
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(demo).toContainText('Result: kept');
});

test('a drawer opened from code returns the picked option', async ({ page }) => {
  await page.goto('components/drawer/');
  const demo = example(page, 'service');
  await demo.getByRole('button', { name: 'Choose a size' }).click();
  const drawer = page.getByRole('dialog', { name: 'Size' });
  await expect(drawer).toBeVisible();
  await drawer.getByRole('button', { name: 'Large' }).click();
  await expect(drawer).toHaveCount(0);
  await expect(demo).toContainText('Size: Large');
});

test('a typeahead suggests values and picks one with the keyboard', async ({ page }) => {
  await page.goto('forms/typeahead/');
  const demo = example(page, 'example');
  const input = demo.getByRole('combobox', { name: 'Country' });
  await input.fill('land');
  const listbox = page.getByRole('listbox');
  await expect(listbox.getByRole('option')).toHaveText([
    'Finland',
    'Iceland',
    'Ireland',
    'Netherlands',
    'New Zealand',
    'Switzerland',
  ]);
  await expect(page.locator('body > [aria-live="polite"]')).toHaveText('6 suggestions available');
  await input.press('ArrowDown');
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', /.+/);
  await input.press('Enter');
  await expect(input).toHaveValue('Iceland');
  await expect(listbox).toHaveCount(0);
  await expect(demo).toContainText('Value: Iceland');
});

test('a clearable input clears its value and keeps focus', async ({ page }) => {
  await page.goto('forms/form-control/');
  const demo = example(page, 'clearable');
  const input = demo.getByRole('searchbox', { name: 'Search' });
  await expect(input).toHaveValue('Bootstrap');
  await demo.getByRole('button', { name: 'Clear' }).click();
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await expect(demo.getByRole('button', { name: 'Clear' })).toBeHidden();
  await expect(demo).toContainText('Value:');
  await input.fill('Angular');
  await expect(demo.getByRole('button', { name: 'Clear' })).toBeVisible();
  await expect(demo).toContainText('Value: Angular');
});

test('an async typeahead renders custom items', async ({ page }) => {
  await page.goto('forms/typeahead/');
  const demo = example(page, 'async');
  await demo.getByRole('combobox', { name: 'Framework' }).fill('an');
  const listbox = page.getByRole('listbox');
  await expect(listbox.getByRole('option')).toHaveCount(2);
  await listbox.getByRole('option', { name: /Django/ }).click();
  await expect(demo).toContainText('Picked: Django');
});

test('a datepicker follows the page color mode, not the system one', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => {
    localStorage.setItem('docs-color-mode', 'light');
  });
  await page.goto('forms/datepicker/');
  await example(page, 'overview').getByRole('combobox').click();
  const calendar = page.getByRole('dialog', { name: 'Choose date' });
  await expect(calendar).toHaveCSS('color-scheme', 'light');
  await expect(calendar).toHaveCSS('background-color', 'rgb(255, 255, 255)');
});

test('a datepicker shows week numbers', async ({ page }) => {
  await page.goto('forms/datepicker/');
  await example(page, 'week-numbers').getByRole('combobox', { name: 'ISO week numbers' }).click();
  const calendar = page.getByRole('dialog', { name: 'Choose date' });
  await expect(calendar.getByRole('columnheader', { name: 'Week' })).toBeVisible();
  await expect(calendar.getByRole('rowheader').first()).toHaveText(/^\s*\d+\s*$/);
});

test('a menu opens with the keyboard and moves focus between items', async ({ page }) => {
  await page.goto('components/menu/');
  const demo = example(page, 'basic');
  const toggle = demo.getByRole('button', { name: 'Toggle menu' });
  await toggle.focus();
  await page.keyboard.press('ArrowDown');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(demo.getByRole('button', { name: 'Menu item 1' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(demo.getByRole('button', { name: 'Menu item 2' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
});

test('a rating changes by click and arrow keys', async ({ page }) => {
  await page.goto('forms/rating/');
  const demo = example(page, 'how-it-works');
  const rating = demo.getByRole('slider', { name: 'Rating' });
  await expect(rating).toHaveAttribute('aria-valuenow', '3');
  await rating.locator('> span').nth(4).click();
  await expect(rating).toHaveAttribute('aria-valuenow', '5');
  await expect(demo.getByText('Value: 5')).toBeVisible();
  await rating.press('ArrowLeft');
  await rating.press('ArrowLeft');
  await expect(rating).toHaveAttribute('aria-valuetext', '3 out of 5');
});

test('filled rating stars line up with the empty ones', async ({ page }) => {
  await page.goto('forms/rating/');
  const star = example(page, 'how-it-works').getByRole('slider').locator('> span').first();
  const empty = await star.locator('> svg').boundingBox();
  const filled = await star.locator('> span > svg').boundingBox();
  expect(filled?.y).toBeCloseTo(empty?.y ?? Number.NaN, 1);
});

test('a half rating star shows half of a full-size star', async ({ page }) => {
  await page.goto('forms/rating/');
  const star = example(page, 'half-stars').getByRole('slider').locator('> span').nth(2);
  const empty = await star.locator('> svg').boundingBox();
  const clip = await star.locator('> span').boundingBox();
  const filled = await star.locator('> span > svg').boundingBox();
  expect(filled?.width).toBeCloseTo(empty?.width ?? Number.NaN, 1);
  expect(filled?.height).toBeCloseTo(empty?.height ?? Number.NaN, 1);
  expect(clip?.width).toBeCloseTo((empty?.width ?? Number.NaN) / 2, 1);
});

test('a file dropzone lists picked files and rejects ones over its limits', async ({ page }) => {
  await page.goto('forms/file-dropzone/');
  const basic = example(page, 'how-it-works');
  await basic.getByLabel('Files').setInputFiles([
    { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') },
    { name: 'photo.png', mimeType: 'image/png', buffer: Buffer.from('png') },
  ]);
  const list = basic.getByRole('list', { name: 'Selected files' });
  await expect(list.getByRole('listitem')).toHaveCount(2);
  await expect(basic.getByText('Selected: 2')).toBeVisible();
  await list.getByRole('button', { name: 'Remove notes.txt' }).click();
  await expect(list.getByRole('listitem')).toHaveCount(1);

  const limits = example(page, 'limits');
  await limits
    .getByLabel('Photos')
    .setInputFiles([
      { name: 'report.pdf', mimeType: 'application/pdf', buffer: Buffer.from('pdf') },
    ]);
  await expect(limits.getByText('report.pdf isn’t an accepted file type.')).toBeVisible();
  await expect(limits.getByText('Last rejected: 1')).toBeVisible();
});

test('placeholder links in examples stay on the page', async ({ page }) => {
  await page.goto('components/nav-overflow/');
  const url = page.url();
  const demo = example(page, 'keep');
  await demo.getByRole('link', { name: 'Home' }).click();
  await expect(page).toHaveURL(url);
  await demo.getByRole('button', { name: 'More' }).click();
  await demo.getByRole('link', { name: 'Help' }).click();
  await expect(page).toHaveURL(url);
});

test('tabs switch panes by click and arrow keys', async ({ page }) => {
  await page.goto('components/tab/');
  const demo = example(page, 'basic');
  await demo.getByRole('tab', { name: 'Profile' }).click();
  await expect(demo.getByRole('tabpanel')).toContainText('Profile tab’s content');
  await page.keyboard.press('ArrowRight');
  await expect(demo.getByRole('tab', { name: 'Contact' })).toBeFocused();
  await expect(demo.getByRole('tab', { name: 'Contact' })).toHaveAttribute('aria-selected', 'true');
  await expect(demo.getByRole('tabpanel')).toContainText('Contact tab’s content');
});

test('arrow keys move focus between toolbar buttons', async ({ page }) => {
  await page.goto('components/button-group/');
  const toolbar = example(page, 'toolbar').getByRole('toolbar');
  await toolbar.getByRole('button', { name: '3' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(toolbar.getByRole('button', { name: '4' })).toBeFocused();
  await page.keyboard.press('End');
  await expect(toolbar.getByRole('button', { name: '5' })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(toolbar.getByRole('button', { name: '1' })).toBeFocused();
});

test('a tooltip shows on hover and on focus', async ({ page }) => {
  await page.goto('components/tooltip/');
  const demo = example(page, 'basic');
  const button = demo.getByRole('button', { name: 'Top' });
  await button.hover();
  await expect(page.getByRole('tooltip')).toHaveText('Tooltip on top');
  await expect(button).toHaveAccessibleDescription('Tooltip on top');
  await page.mouse.move(0, 0);
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  await button.focus();
  await expect(page.getByRole('tooltip')).toHaveText('Tooltip on top');
});

test('a toast shows and closes', async ({ page }) => {
  await page.goto('components/toasts/');
  const demo = example(page, 'basic');
  await demo.getByRole('button', { name: 'Show toast' }).click();
  const toast = demo.locator('.toast');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText('Hello, world!');
  // Screen readers hear it through the persistent live region.
  await expect(page.locator('body > [aria-live="polite"]')).toContainText('Hello, world!');
  await toast.getByRole('button', { name: 'Close' }).click();
  await expect(toast).toBeHidden();
});

test('a carousel moves to the next slide', async ({ page }) => {
  await page.goto('components/carousel/');
  const demo = example(page, 'basic');
  const slides = demo.locator('.carousel-item');
  await expect(slides.nth(0)).toHaveClass(/active/);
  await demo.locator('[bsCarouselNext], .btn-icon').last().click();
  await expect(slides.nth(1)).toHaveClass(/active/);
  await expect(slides.nth(1)).toBeInViewport();
  await expect(page.locator('body > [aria-live="polite"]')).toHaveText(/^Slide 2 of \d+$/);
});

test('examples show their source and copy it', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('components/alert/');
  const block = page.locator('h2#dismissible ~ docs-example').first();
  await expect(block.getByRole('tab', { name: 'HTML' })).toHaveAttribute('aria-selected', 'true');
  await expect(block.locator('docs-code')).toContainText('bsAlert');
  await block.getByRole('tab', { name: 'TypeScript' }).click();
  await expect(block.locator('docs-code')).toContainText('@Component');

  const copy = block.getByRole('button', { name: 'Copy' });
  await copy.hover();
  await expect(page.getByRole('tooltip')).toHaveText('Copy');
  await copy.click();
  await expect(block.getByRole('button', { name: 'Copied' })).toBeVisible();
  await expect(page.getByRole('tooltip')).toHaveText('Copied!');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('@Component');
});

test('home page copies the install command', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('');
  await page.getByRole('button', { name: 'Copy' }).click();
  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    'npm install bootstrap-ng bootstrap @floating-ui/dom',
  );
});

test('icons load from their libraries and labelled icons are images', async ({ page }) => {
  await page.goto('components/icon/');
  const demo = example(page, 'libraries');
  await expect(demo.locator('bs-icon > svg')).toHaveCount(16);
  const basic = example(page, 'basic');
  await expect(basic.getByRole('img', { name: 'Notifications' }).locator('svg')).toHaveCount(1);
  await expect(basic.locator('bs-icon[aria-hidden="true"]')).toHaveCount(3);
});

test('a table sorts, searches and pages', async ({ page }) => {
  await page.goto('components/table/');
  const sorting = example(page, 'sorting');
  const name = sorting.getByRole('columnheader', { name: 'Name' });
  await expect(name).toHaveAttribute('aria-sort', 'ascending');
  await name.getByRole('button').click();
  await expect(name).toHaveAttribute('aria-sort', 'descending');
  await expect(page.locator('body > [aria-live="polite"]')).toHaveText(
    'Sorted by Name, descending',
  );

  const paging = example(page, 'search-and-pagination');
  await expect(paging.locator('tbody tr')).toHaveCount(8);
  await paging.getByRole('button', { name: '6' }).click();
  await expect(paging.locator('[aria-current="page"]')).toHaveText('6');
  await paging.getByLabel('Search employees').fill('ava');
  await expect(paging.locator('tbody tr')).toHaveCount(5);
  await expect(paging.locator('[aria-current="page"]')).toHaveText('1');
  await expect(paging).toContainText('5 of 48 employees');
});

test('table rows can be selected and expanded', async ({ page }) => {
  await page.goto('components/table/');
  const selection = example(page, 'selection');
  await selection.getByRole('checkbox', { name: 'Select all rows' }).check();
  await expect(selection.locator('tbody tr.table-active')).toHaveCount(5);
  await selection.getByRole('checkbox', { name: 'Select all rows' }).uncheck();
  await expect(selection).toContainText('Selected: nobody');

  const detail = example(page, 'expandable-rows');
  const toggle = detail.getByRole('button', { name: 'Show details' }).first();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(detail.locator('dl')).toBeVisible();
});

test('table columns resize with the keyboard and move with buttons', async ({ page }) => {
  await page.goto('components/table/');
  const demo = example(page, 'columns');
  const handle = demo.getByRole('separator', { name: 'Resize Name' });
  await expect(handle).toHaveAttribute('aria-valuenow', '180');
  await handle.focus();
  await page.keyboard.press('ArrowRight');
  await expect(handle).toHaveAttribute('aria-valuenow', '190');
  await demo.getByRole('button', { name: 'Move Name right' }).click();
  await expect(demo.locator('thead th').nth(1)).toContainText('Name');
  await demo.getByRole('checkbox', { name: 'Show Department' }).check();
  await expect(demo.getByRole('columnheader', { name: 'Department' })).toBeVisible();
});
