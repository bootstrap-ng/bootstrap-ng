# bootstrap-ng

Angular components for [Bootstrap 6](https://bootstrap-ng.com/), built for modern Angular.

- **Angular 22+**: standalone, signal inputs and outputs, OnPush, zoneless.
- **Real Bootstrap markup**: attribute selectors such as `<div bsAlert>` keep the DOM exactly as Bootstrap's CSS expects.
- **Platform native**: dialogs use `<dialog>` and accordions use `<details>`, like Bootstrap 6.
- **No Bootstrap JavaScript**: all behavior is written in Angular.

> [!WARNING]
> Bootstrap 6 is in alpha, and so is bootstrap-ng. Expect breaking changes.

## Components

Accordion, Alert, Badge, Button, Close button, Collapse, Dialog, Progress, Spinner.

## Usage

```sh
npm install bootstrap-ng bootstrap@next @floating-ui/dom
```

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
