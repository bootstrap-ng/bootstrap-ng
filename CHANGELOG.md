# Changelog

<!-- markdownlint-configure-file { "MD024": { "siblings_only": true } } -->

All notable changes to bootstrap-ng are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). bootstrap-ng follows Bootstrap's major version, and while both are in alpha, any release may contain breaking changes.

## Unreleased

## [6.0.0-alpha.5] - 2026-10-24

### Breaking changes

- The calendar and datepicker now default their `locale` to Angular's `LOCALE_ID` instead of the browser's language. Set `locale` on the component, or provide it with `provideBsCalendarConfig()`, to keep the old behavior. ([#54](https://github.com/bootstrap-ng/bootstrap-ng/pull/54))

### Added

- Global configuration: a `provideBs*Config()` function and `BS_*_CONFIG` token for 26 components, to set defaults for common inputs and built-in labels app-wide. Inputs still win, and component-level providers merge over the app's config. ([#54](https://github.com/bootstrap-ng/bootstrap-ng/pull/54))
- Per-component secondary entry points (`bootstrap-ng/button`, `bootstrap-ng/datepicker`, …), so apps with lazy routes load only the components each route uses. Importing from `bootstrap-ng` still works. ([#58](https://github.com/bootstrap-ng/bootstrap-ng/pull/58))
- `provideBsNavOverflowConfig`, `BS_NAV_OVERFLOW_CONFIG` and `BsFloatingTip` are now exported. ([#58](https://github.com/bootstrap-ng/bootstrap-ng/pull/58))
- Icon: bundled icons. Libraries can hold SVG markup by name in `icons`, and `BsIconRegistry.addIcons()` adds icons to a library. Bundled icons make no request and render on the server. ([#57](https://github.com/bootstrap-ng/bootstrap-ng/pull/57))
- Icon: built-in Phosphor Icons library (`phosphorIcons()`). ([#52](https://github.com/bootstrap-ng/bootstrap-ng/pull/52))
- Table: multi-column sorting (`multiSort` and `[(sorts)]`), virtual scrolling (`virtualScroll` and `rowHeight`) and pinned columns (`pinned: 'start' | 'end'`). ([#60](https://github.com/bootstrap-ng/bootstrap-ng/pull/60))
- Calendar and datepicker: week numbers (`weekNumbers`), ISO 8601 by default or `weekNumbering="simple"`, with a `weekLabel` for the column. ([#38](https://github.com/bootstrap-ng/bootstrap-ng/pull/38))

### Fixed

- `button[bsCombobox]` has `role="combobox"` and takes its accessible name from its label, so the selected value is announced. ([#36](https://github.com/bootstrap-ng/bootstrap-ng/pull/36))
- Toaster: the `closeLabel` option now reaches the toast's close button. ([#54](https://github.com/bootstrap-ng/bootstrap-ng/pull/54))
- Made flaky carousel, toast, typeahead and e2e tests deterministic. ([#55](https://github.com/bootstrap-ng/bootstrap-ng/pull/55))

### Changed

- Updated development dependencies and applied `npm audit` fixes. ([#50](https://github.com/bootstrap-ng/bootstrap-ng/pull/50), [#53](https://github.com/bootstrap-ng/bootstrap-ng/pull/53), [#56](https://github.com/bootstrap-ng/bootstrap-ng/pull/56))

## [6.0.0-alpha.4] - 2026-10-17

### Added

- Table: sort changes are announced to screen readers, with a configurable `sortAnnouncement`. ([#27](https://github.com/bootstrap-ng/bootstrap-ng/pull/27))
- Datepicker: numeric `inputmode` on macOS and iPadOS, for the numeric on-screen keyboard. ([#31](https://github.com/bootstrap-ng/bootstrap-ng/pull/31))

### Fixed

- Rating: partial ratings show half of a full-size star instead of a shrunken whole star. ([#26](https://github.com/bootstrap-ng/bootstrap-ng/pull/26))
- Table: the sort button has a 24px minimum target size (WCAG 2.5.8). ([#27](https://github.com/bootstrap-ng/bootstrap-ng/pull/27))

### Changed

- Removed `keywords` from the package's `package.json`. ([#24](https://github.com/bootstrap-ng/bootstrap-ng/pull/24))
- Updated minor development dependencies, including Angular 22.2.3. ([#34](https://github.com/bootstrap-ng/bootstrap-ng/pull/34))

## [6.0.0-alpha.3] - 2026-10-14

### Added

- File dropzone (`div[bsFileDropzone]`): a drag-and-drop file picker built on a native file input, with file limits, rejected-file reporting, folder drops, image previews and forms integration. ([#22](https://github.com/bootstrap-ng/bootstrap-ng/pull/22))

### Fixed

- Datepicker: the calendar follows the page's color mode (`data-bs-theme`) instead of the operating system's, unless `colorMode` sets one. ([#21](https://github.com/bootstrap-ng/bootstrap-ng/pull/21))

## [6.0.0-alpha.2] - 2026-10-14

### Added

- Table (`table[bsTable]`): a data table with sorting, filtering, paging, selection, expandable rows, resizable and reorderable columns, and a server-side mode. ([#12](https://github.com/bootstrap-ng/bootstrap-ng/pull/12))
- Form control: `clearable` on `bsFormControl` inputs and `<textarea>` elements shows a clear button while the control has a value, with a `clearLabel` and a `cleared` output. ([#14](https://github.com/bootstrap-ng/bootstrap-ng/pull/14))

## [6.0.0-alpha.1] - 2026-10-14

First release, for Bootstrap 6.0.0-alpha.1 and Angular 22.

[6.0.0-alpha.5]: https://github.com/bootstrap-ng/bootstrap-ng/compare/a32212c...main
[6.0.0-alpha.4]: https://github.com/bootstrap-ng/bootstrap-ng/compare/ade1247...a32212c
[6.0.0-alpha.3]: https://github.com/bootstrap-ng/bootstrap-ng/compare/0d0767f...ade1247
[6.0.0-alpha.2]: https://github.com/bootstrap-ng/bootstrap-ng/compare/c859a7b...0d0767f
[6.0.0-alpha.1]: https://github.com/bootstrap-ng/bootstrap-ng/commit/c859a7b
