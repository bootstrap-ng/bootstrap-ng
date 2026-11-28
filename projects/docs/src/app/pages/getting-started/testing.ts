import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsCode } from '../../shared/code';
import { DocsHeading } from '../../shared/heading';

@Component({
  selector: 'docs-testing',
  imports: [DocsCode, DocsHeading, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './testing.html',
})
export default class Testing {
  protected readonly angularJson = `"test": {
  "builder": "@angular/build:unit-test",
  "options": {
    "browsers": ["chromiumHeadless"],
    "providersFile": "src/test-providers.ts"
  }
}`;

  protected readonly waitForEvent = `@Component({
  imports: [BsDialog],
  template: \`<dialog bsDialog #dialog="bsDialog" (hidden)="hidden = true">…</dialog>\`,
})
class Host {
  readonly dialog = viewChild.required<BsDialog>('dialog');
  hidden = false;
}

it('emits hidden after the dialog closes', async () => {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  fixture.componentInstance.dialog().show();
  await fixture.whenStable();

  fixture.componentInstance.dialog().hide();

  // Waits for Bootstrap's fade-out transition.
  await vi.waitFor(() => expect(fixture.componentInstance.hidden).toBe(true));
});`;

  protected readonly noAnimation = `// src/test-providers.ts
import { provideBsDialogConfig, provideBsTooltipConfig } from 'bootstrap-ng';

export default [
  provideBsDialogConfig({ animation: false }),
  provideBsTooltipConfig({ animation: false }),
];`;

  protected readonly overlay = `button.dispatchEvent(new Event('focusin', { bubbles: true }));
await fixture.whenStable();

const tooltip = document.querySelector('.tooltip');
expect(tooltip?.textContent).toContain('Delete this file');`;

  protected readonly byRole = `import { page } from 'vitest/browser';

await page.getByRole('button', { name: 'Filters' }).click();
await expect.element(page.getByRole('button', { name: 'Filters' })).toHaveAttribute(
  'aria-expanded',
  'true',
);`;
}
