---
name: bootstrap-ng-install
description: Add bootstrap-ng (Angular components for Bootstrap 6) to an Angular application and set it up. Use when installing bootstrap-ng, adding Bootstrap 6 to an Angular project, or wiring up its CSS, component imports, global configuration or icons.
guide: /getting-started/introduction
---

# Add bootstrap-ng to an Angular application

This skill sets up [bootstrap-ng](https://bootstrap-ng.com/) in an Angular application. bootstrap-ng renders Bootstrap 6 markup with standalone Angular components and implements all behavior in Angular, so the app needs **Bootstrap's CSS only, never its JavaScript**.

## Workflow

- [ ] Step 1: Check the requirements
- [ ] Step 2: Install the packages
- [ ] Step 3: Add Bootstrap's CSS
- [ ] Step 4: Import components
- [ ] Step 5: Set global defaults (optional)
- [ ] Step 6: Set up icons (optional)
- [ ] Step 7: Verify

---

## Step 1: Check the requirements

- **Angular 21.2 or later** (`@angular/core` `^21.2.0 || ^22.0.0`). Check `package.json`. On an older version, upgrade Angular first with `ng update`.
- **Node.js** `^22.22.3 || ^24.15.0 || ^26.0.0`.
- No new app yet? Create one with Sass styles:

  ```sh
  npx @angular/cli@latest new my-app --style=scss
  ```

## Step 2: Install the packages

```sh
npm install bootstrap-ng@next bootstrap@next @floating-ui/dom
```

- Both packages are pre-releases on the `next` tag. A plain `npm install bootstrap` installs Bootstrap 5, which bootstrap-ng does not support.
- `@floating-ui/dom` is a required peer: it positions tooltips, popovers and menus.
- `bootstrap` is an optional peer, needed only for the CSS. Leave it out when loading the CSS from a CDN (Step 3, option C):

  ```sh
  npm install bootstrap-ng@next @floating-ui/dom
  ```

Never install or add `bootstrap.bundle.js` / `bootstrap.js`, `@popperjs/core`, `ng-bootstrap` or `ngx-bootstrap`. Bootstrap's JavaScript would handle the same elements twice.

## Step 3: Add Bootstrap's CSS

Pick one option.

**A. Compiled CSS** (simplest): add it before the app's own styles in `angular.json` under `projects.<app>.architect.build.options.styles`:

```json
"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "src/styles.scss"
]
```

**B. Sass source** (to customize Bootstrap): at the top of `src/styles.scss`. Use `@use`, never `@import`:

```scss
@use 'bootstrap/scss/bootstrap';
```

**C. CDN** (no `bootstrap` package): in the `<head>` of `src/index.html`. Copy the URL and SRI hash from the [Introduction](https://bootstrap-ng.com/getting-started/introduction/#css) for another version; never guess a hash.

```html
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@6.0.0-alpha.2/dist/css/bootstrap.min.css"
  rel="stylesheet"
  integrity="sha384-MKn5NWVBEuQXJE7TSKSgPUmMiSCmVTfCsR+VSSeQpHnoyJQZZFn/kBn+Ht5jZDPQ"
  crossorigin="anonymous" />
```

For dark mode, set `data-bs-theme="dark"` (or `"light"`) on `<html>`; see [Theming](https://bootstrap-ng.com/getting-started/theming/).

## Step 4: Import components

Every component and directive is standalone. Import what a component uses into its `imports`. Each component has its own entry point named after its folder, such as `bootstrap-ng/button`, `bootstrap-ng/dialog` or `bootstrap-ng/datepicker`. Importing from the root `bootstrap-ng` tree-shakes the same way, so either style works; follow what the project already does.

```ts
import { Component } from '@angular/core';
import { BsAlert } from 'bootstrap-ng/alert';
import { BsButton } from 'bootstrap-ng/button';

@Component({
  selector: 'app-root',
  imports: [BsAlert, BsButton],
  template: `
    <div bsAlert theme="success" dismissible>
      <p>bootstrap-ng is ready.</p>
    </div>
    <button type="button" bsButton theme="primary">Save</button>
  `,
})
export class App {}
```

- Most components are **attribute selectors on Bootstrap's own markup** (`<div bsAlert>`, `<button bsButton>`, `<dialog bsDialog>`), so the DOM matches Bootstrap's docs. Check each component's page on [bootstrap-ng.com](https://bootstrap-ng.com/) for its selector and inputs.
- Services such as `BsToaster` and `BsDialogService` are `inject()`-able with no provider.
- `BOOTSTRAP_NG` imports everything at once. Use it only for prototypes.
- No `provide*()` call is needed to start. bootstrap-ng works zoneless, with SSR and with hydration.

## Step 5: Set global defaults (optional)

Components whose inputs apps usually set the same way everywhere have a `provideBs*Config()` function. Add it to `providers` in `src/app/app.config.ts` (whole app) or in a component's or route's `providers` (that part of the app). Inputs set on a component always win.

```ts
import { ApplicationConfig } from '@angular/core';
import { provideBsDialogConfig, provideBsTooltipConfig } from 'bootstrap-ng';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBsDialogConfig({ backdrop: 'static' }),
    provideBsTooltipConfig({ placement: 'bottom', delay: 300 }),
  ],
};
```

Calendar and datepicker components format dates in Angular's `LOCALE_ID` unless given a `locale`. See [Global configuration](https://bootstrap-ng.com/getting-started/configuration/) for every function and its options.

## Step 6: Set up icons (optional)

`<bs-icon name="star-fill" />` (from `bootstrap-ng/icon`) loads [Bootstrap Icons](https://icons.getbootstrap.com/) SVGs from jsDelivr by default, so it works with no setup. Use `provideBsIcons()` to change the default library (`font-awesome`, `material`, `modus`, `phosphor`), self-host a set with `bootstrapIcons({ baseUrl })`, or bundle SVG markup so icons need no request and render on the server:

```ts
import { bootstrapIcons, provideBsIcons } from 'bootstrap-ng';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBsIcons({
      libraries: { bootstrap: bootstrapIcons({ baseUrl: '/icons/bootstrap' }) },
    }),
  ],
};
```

If the app has a Content Security Policy, allow `https://cdn.jsdelivr.net` in `connect-src`, or self-host. See [BsIconRegistry](https://bootstrap-ng.com/getting-started/services/#icon-registry).

---

## Step 7: Verify

1. Run `ng build` (or `ng serve`) and confirm there are no compile errors. An unknown attribute or element error means the component is missing from `imports`.
2. Open the app and confirm the sample alert and button are styled. Unstyled output means Bootstrap's CSS is not loaded (check Step 3), or Bootstrap 5 was installed instead of `bootstrap@next`.
3. Confirm `bootstrap.bundle.js` or `bootstrap.js` is not in `angular.json` `scripts` or `index.html`.
4. Open a menu, tooltip or dialog and check the console is clear. A missing `@floating-ui/dom` breaks positioning.

For a step-by-step first page with a dialog and a toast, see the [Quickstart](https://bootstrap-ng.com/getting-started/quickstart/). All docs in one file for agents: [llms-full.txt](https://bootstrap-ng.com/llms-full.txt).
