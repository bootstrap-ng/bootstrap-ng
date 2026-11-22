# Changelog

Notable changes to bootstrap-ng. While Bootstrap 6 is in alpha, any release may include breaking changes.

## Unreleased

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
