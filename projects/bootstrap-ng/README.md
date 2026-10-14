# bootstrap-ng

Angular components for [Bootstrap 6](https://bootstrap-ng.com/), built for modern Angular.

**Docs:** <https://bootstrap-ng.com/>

- **Angular 22+**: standalone, signal inputs and outputs, OnPush, zoneless.
- **Real Bootstrap markup**: attribute selectors such as `<div bsAlert>` keep the DOM exactly as Bootstrap's CSS expects.
- **Platform native**: dialogs use `<dialog>` and accordions use `<details>`, like Bootstrap 6.
- **No Bootstrap JavaScript**: all behavior is written in Angular.

> [!WARNING]
> Bootstrap 6 is in alpha, and so is bootstrap-ng. Expect breaking changes.

## Components

Accordion, Alert, Avatar, Badge, Breadcrumb, Button, Button group, Card, Carousel, Close button, Collapse, Dialog (with a service for opening dialogs from code), Drawer, Icon, List group, Menu (with submenus), Nav, Nav overflow, Navbar, Pagination, Placeholder, Popover, Progress, Scrollspy, Spinner, Stepper, Tab, Table (sorting, search, pagination, selection, expandable rows and resizable, reorderable columns), Toasts (with a service for showing toasts from code), Toggler, Tooltip.

## Forms

Field, Form control, Checkbox, Radio, Switch, Range, Input group, Floating labels, Form adorn, Chips, Combobox, Typeahead, Calendar, Datepicker, OTP input, Password strength, Rating, File dropzone, Layout and Validation, integrated with Reactive Forms, `ngModel` and Signal Forms.

## Usage

```sh
npm install bootstrap-ng bootstrap@next @floating-ui/dom
```

[Floating UI](https://floating-ui.com/) positions tooltips, popovers and menus, as it does in Bootstrap.

Add `node_modules/bootstrap/dist/css/bootstrap.min.css` to `styles` in `angular.json`, then import components:

```ts
import { BsAlert, BsButton } from 'bootstrap-ng';

@Component({
  imports: [BsAlert, BsButton],
  template: `
    <div bsAlert theme="success" dismissible><p>Saved!</p></div>
    <button type="button" bsButton="outline" theme="primary">Edit</button>
  `,
})
export class Example {}
```
