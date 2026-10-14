import AxeBuilder from '@axe-core/playwright';
import { expect, Page } from '@playwright/test';

/**
 * Failures that come from Bootstrap 6's own CSS, not from bootstrap-ng or the docs. Remove
 * each one once the pinned Bootstrap commit fixes it.
 * - The v6 alpha palette misses 4.5:1 text contrast in many places, for example white on
 *   the primary blue (3.56:1) and the default link color on white.
 * - Carousel indicators are 12px, under the 24px minimum target size.
 */
const UPSTREAM_RULES = ['color-contrast'];
const UPSTREAM_EXCLUDES = ['.carousel-indicators'];

/**
 * Tooltips and popovers are appended to the end of the page, outside any landmark, as in
 * Bootstrap. They are tied to their trigger by `aria-describedby` and the tab order, so
 * axe's best-practice `region` rule is waived for them only.
 */
const OUTSIDE_LANDMARKS = /^#bs-(tooltip|popover)-\d+$/;

/**
 * Runs axe on the page as it is now and expects no violations. Pass `include` to check
 * only those elements, such as an open popup and its trigger.
 */
export async function expectNoAxeViolations(page: Page, include: string[] = []): Promise<void> {
  let axe = new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .disableRules(UPSTREAM_RULES);
  for (const selector of include) {
    axe = axe.include(selector);
  }
  for (const selector of UPSTREAM_EXCLUDES) {
    axe = axe.exclude(selector);
  }
  const results = await axe.analyze();
  expect(
    results.violations
      .map((violation) => ({
        id: violation.id,
        help: violation.help,
        targets: violation.nodes
          .map((node) => node.target.join(' '))
          .filter((target) => violation.id !== 'region' || !OUTSIDE_LANDMARKS.test(target)),
      }))
      .filter((violation) => violation.targets.length > 0),
  ).toEqual([]);
}
