# bootstrap-ng

[![CI](https://github.com/bootstrap-ng/bootstrap-ng/actions/workflows/ci.yml/badge.svg)](https://github.com/bootstrap-ng/bootstrap-ng/actions/workflows/ci.yml)
[![Super Linter](https://github.com/bootstrap-ng/bootstrap-ng/actions/workflows/super-linter.yml/badge.svg)](https://github.com/bootstrap-ng/bootstrap-ng/actions/workflows/super-linter.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

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

Field, Form control, Checkbox, Radio, Switch, Range, Input group, Floating labels, Form adorn, Chips, Combobox, Typeahead, Calendar, Datepicker, OTP input, Password strength, Rating, Layout and Validation, integrated with Reactive Forms, `ngModel` and Signal Forms.

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

## Repository layout

| Path | Contents |
| --- | --- |
| `projects/bootstrap-ng` | The library, published to npm as `bootstrap-ng` |
| `projects/docs` | The documentation site, an Angular app that uses the library source |

## Development

Requires Node.js 22.22.3+ or 24.15+.

```sh
npm install
npx playwright install chromium   # unit tests run in a real browser
npm start                          # docs site at http://localhost:4200
npm test                           # library unit tests (Vitest + Chromium)
npm run test:coverage              # unit tests with a coverage report in coverage/
npm run build                      # library to dist/bootstrap-ng, docs to dist/docs
npm run e2e                        # end-to-end and axe tests against the built docs
```

The docs app imports `bootstrap-ng` from `projects/bootstrap-ng/src` through a `tsconfig.json` path, so library changes show up in the docs without a rebuild. Each docs example is a small component whose template file is also imported as text, so the code shown is the code that runs.

The docs site deploys to Cloudflare Pages from `main`, with `npm run build` as the build command and `dist/docs/browser` as the build output directory. `npm run build:docs` prerenders every page to static HTML, builds a [Pagefind](https://pagefind.app) search index from it, and writes an [llms.txt](https://llmstxt.org) to the site root, generated from the docs navigation by `scripts/llms-txt.mjs`. `scripts/llms-full-txt.mjs` converts every prerendered page, with its example code and API tables, to Markdown in `llms-full.txt`. `scripts/sitemap.mjs` writes a `sitemap.xml` of every page from the same navigation and links it from `robots.txt`. It also copies the client-rendered app to `404.html`, so unknown paths load the app with a 404 status. Search needs the index, so it works on the built site but not in `npm start`.
