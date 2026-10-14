# Accessibility

bootstrap-ng aims to make every component usable with a keyboard, a screen reader and other assistive technology, so that apps built with it can meet [WCAG 2.2](https://www.w3.org/TR/WCAG22/) level AA.

For how each component handles ARIA, keyboard support, focus management, live announcements and reduced motion, and what is still up to you as an app author, see the [Accessibility page](https://bootstrap-ng.com/getting-started/accessibility) in the docs.

## Standards

Components follow the [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) patterns and target [WCAG 2.2](https://www.w3.org/TR/WCAG22/) level AA. They render Bootstrap 6's own markup, using native elements where they exist, such as `<dialog>` for modals and drawers and `<details>` for accordions.

## How it is tested

- Components have unit tests that cover their ARIA attributes, keyboard interaction and focus handling.
- Every page of the docs site is checked with [axe](https://www.deque.com/axe/) in light and dark mode, against the WCAG 2.0, 2.1 and 2.2 A and AA rules and axe's best practices. Open menus, dialogs, drawers, popovers, tooltips, toasts and combobox, typeahead and date picker popups are checked too.
- These checks run in CI on every pull request.

The axe checks live in [`projects/docs/e2e`](../projects/docs/e2e), with the shared setup in [`axe.ts`](../projects/docs/e2e/axe.ts).

## Known limitations

These come from the Bootstrap 6 alpha's CSS, not from bootstrap-ng. They are excluded from the axe checks until the pinned Bootstrap commit fixes them:

- **Color contrast:** some colors in the default palette miss the 4.5:1 text contrast ratio, for example white text on the primary blue and the default link color on white. Test the colors you use and adjust Bootstrap's theme where needed.
- **Target size:** carousel indicators are 12px, under the 24px minimum target size.

## Reporting an accessibility issue

If something in bootstrap-ng or its docs is hard or impossible to use with assistive technology, please [open an issue](https://github.com/bootstrap-ng/bootstrap-ng/issues/new). Include:

- The component and docs page, or a minimal example
- What you expected and what happened
- The browser, operating system and any assistive technology you use, such as a screen reader and its version

Problems in Bootstrap's own CSS or markup should be reported to [Bootstrap](https://github.com/twbs/bootstrap/issues), and problems in Angular to [Angular](https://github.com/angular/angular/issues).
