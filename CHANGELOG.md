# Changelog

Notable changes to bootstrap-ng. While Bootstrap 6 is in alpha, any release may include breaking changes.

## Unreleased

- Table: the left and right arrow keys on a column resize handle follow the handle in right-to-left layouts.
- Scrollspy: Ctrl/Cmd, Shift and Alt clicks on a link open it in a new tab or window again instead of scrolling.
- Chip input: arrow keys follow the chips in right-to-left layouts.
- Breaking: `BsTypeaheadPopup`, the typeahead's internal suggestion list, is no longer exported.
- Docs: the `parseIsoDate`, `toIsoDate`, `selectedDates`, `weekNumber` and `formatFileSize` helpers.
- Dialog and drawer: a static `open` attribute opens them as a modal.
- Toaster: visible toasts stay on the page when the modal dialog holding them is removed while open.
- Live announcer: a polite announcement no longer drops a pending assertive one.
- Form controls: a native form reset clears the validation state of controls without an Angular form control.
- Calendar: the arrow buttons keep the focused day after the value changes; years before 100 are no longer read as 1900 to 1999.
- Combobox: opening it focuses the first enabled option when the selected option is disabled.
- OTP input: ArrowLeft moves to the previous slot from a filled slot in left-to-right layouts.
- Chip input: Shift with an arrow key starts a new selection after the selection was cleared.
- Typeahead: no highlight on the wrong letters when lowercasing changes the suggestion's length, such as with `İ`.
- Table: a resize handle's `aria-valuenow` follows the column's width after the data or loading state changes.

## 6.0.0-alpha.10 - 2026-11-27

- Datepicker: typed dates are read in the `dateFormat` options' format (and as Japanese era dates with `wareki`), with a `dateParser` input for other formats, a `textInvalid` output, and `invalidBehavior="keep"` to keep rejected text with a `textError` signal and `bsDate` form error.
- Datepicker: typed text that matches the current value is formatted again.
- Datepicker: typed multiple selection deduplicates dates; range mode accepts unspaced ISO hyphen pairs; the popup removes host listeners when it closes.
- Calendar: keyboard navigation skips disabled days; month and year pickers respect `dateDisabled`.
- Dialog service: `size` accepts `'2xl'`.
- Form adorn: a `bs-icon` in `bsFormAdornIcon` takes the adorn icon size.
- Icon: inline and loaded SVGs reject obfuscated `javascript:` URLs and strip animation elements that can set `href` at runtime.
- Chip input and typeahead: arrow keys and Enter no longer run while IME composition is active.
- Rating: decreasing from zero no longer raises the value when `resettable` is off.
- Docs and dev dependency target Bootstrap 6.0.0-alpha.2.
- Docs: button group toggle examples, dialog size and fullscreen examples, and a VS Code extension page.

## 6.0.0-alpha.9 - 2026-11-22

- Menu, combobox and typeahead: a menu taller than the space left in the viewport is capped to it and scrolls.
- Collapse: no opening animation when it renders already open.
- OTP input: Undo and Redo work, taps and arrow keys follow the slots in right-to-left layouts, and a native form reset updates the slots.
- Toaster and screen reader announcements: work while a modal dialog is open.
- Datepicker: a range only reaches the form once both dates are picked, and dismissing the popup keeps the previous range.
- Calendar and datepicker: `wareki` year view lists one year per row.

## 6.0.0-alpha.8 - 2026-11-20

- Breaking: form control `controlSize` is renamed to `size`.
- Datepicker: `size` (`sm`, `md`, `lg`).
- Calendar and datepicker: month and year views.
- Calendar and datepicker: `wareki` for Japanese era years.
- The `bootstrap` peer dependency is optional.

## 6.0.0-alpha.7 - 2026-11-19

- Typeahead: binds objects through Angular forms, with a new `editable` option.
- Dialog no longer closes when a file input's picker is cancelled.
- Password strength counts any non-letter, non-digit character as a symbol.
- Submenus stay on screen.
- Disabled nav links no longer run click handlers.

## 6.0.0-alpha.6 - 2026-11-17

- Support for Angular 21.2 and newer.
- Drawer: `sheet` variant.
- Menu and nav overflow: `strategy` / `menuStrategy` (`absolute` or `fixed`).

## 6.0.0-alpha.5 - 2026-10-24

- Breaking: calendar and datepicker `locale` defaults to Angular's `LOCALE_ID`.
- Global configuration with `provideBs*Config()` for 26 components.
- Per-component entry points (`bootstrap-ng/button`, etc.).
- Icon: bundled icons and the Phosphor Icons library.
- Table: multi-column sorting, virtual scrolling and pinned columns.
- Calendar and datepicker: week numbers.
- Combobox button announces its selected value.
- Toaster `closeLabel` reaches the close button.

## 6.0.0-alpha.4 - 2026-10-17

- Table: sort changes are announced to screen readers.
- Datepicker: numeric keyboard on macOS and iPadOS.
- Rating: partial stars render at full size.
- Table: larger sort button target.

## 6.0.0-alpha.3 - 2026-10-14

- New file dropzone component.
- Datepicker follows the page's color mode.

## 6.0.0-alpha.2 - 2026-10-14

- New table component.
- Form control: `clearable`.

## 6.0.0-alpha.1 - 2026-10-14

First release, for Bootstrap 6.0.0-alpha.1 and Angular 22.
