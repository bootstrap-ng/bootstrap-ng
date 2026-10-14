# Contributing

We are happy to accept contributions from the community to improve this project. This guide explains how to set up the repository, the conventions the code follows, and what a pull request needs before it can be merged.

- Found a bug or have an idea? [Open an issue](https://github.com/bootstrap-ng/bootstrap-ng/issues) first, after [searching existing issues](https://github.com/bootstrap-ng/bootstrap-ng/issues?q=is%3Aissue) to check it hasn't been reported. See [SUPPORT.md](SUPPORT.md) for what to include.
- Found a security vulnerability? Please don't open a public issue. Follow [SECURITY.md](SECURITY.md) instead.
- Everyone taking part is expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting started

You need Node.js 22.22.3+ or 24.15+. The exact version is in [`.nvmrc`](../.nvmrc), so with nvm you can run:

```sh
nvm use
npm install
npm start
```

`npm start` serves the docs site at <http://localhost:4200>.

`package.json` pins an exact Bootstrap 6 pre-release from npm. The docs site loads the same version's CSS from jsDelivr in `projects/docs/src/index.html`, with an SRI hash, so bump both together. When checking markup or class names, look in `node_modules/bootstrap` or the [Bootstrap 6 docs](https://getbootstrap.com/docs/6.0/) rather than relying on Bootstrap 5. Version 6 uses `.btn-solid`, `.btn-outline` and `.btn-subtle` with `.theme-*` classes, a native `<dialog class="dialog">`, and `<details>` accordions.

The unit and end-to-end tests run in Chromium through Playwright. If you don't already have it, install it once with:

```sh
npx playwright install chromium
```

Use an [EditorConfig](https://editorconfig.org) plugin in your editor so indentation and line endings match [`.editorconfig`](../.editorconfig).

## Repository layout

| Path                    | What it is                                                                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `projects/bootstrap-ng` | The library, published to npm as `bootstrap-ng`. Every public symbol is exported from `src/public-api.ts`.                               |
| `projects/docs`         | The documentation site, an Angular app. It imports `bootstrap-ng` from the library source, so library changes show up without a rebuild. |
| `projects/docs/e2e`     | Playwright end-to-end and accessibility tests for the docs site.                                                                         |
| `scripts`               | Build helpers, such as generating `llms.txt` and `sitemap.xml` and serving the built docs for e2e tests.                                 |
| `.github/workflows`     | CI, docs deployment, spell checking and Super Linter.                                                                                    |

## npm scripts

| Command                 | What it does                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| `npm start`             | Serves the docs site at <http://localhost:4200> with live reload.                                |
| `npm test`              | Runs the library unit tests (Vitest in browser mode with Chromium).                              |
| `npm run test:coverage` | Runs the unit tests with coverage. It fails below the thresholds in `angular.json`.              |
| `npm run lint`          | Runs ESLint on the library and docs.                                                             |
| `npm run format`        | Formats the code with Prettier. `npm run format:check` only checks it.                           |
| `npm run build`         | Builds the library, then the docs site, its Pagefind search index, `llms.txt` and `sitemap.xml`. |
| `npm run e2e`           | Runs the Playwright tests against the built docs. Run `npm run build` first.                     |
| `npm run watch`         | Rebuilds the library on every change.                                                            |

### Linting and formatting

ESLint is configured in `eslint.config.js`. It is type-aware and strict (typescript-eslint `strictTypeChecked` and every angular-eslint rule), so a few patterns come up often:

- Type element references as `inject<ElementRef<HTMLElement>>(ElementRef)`.
- Mark a promise you intentionally don't await with `void`.

Prettier formats TypeScript, HTML and SCSS under `projects/`. Run `npm run format` before committing.

### Tests

Coverage must stay at or above 90% for statements, functions and lines, and 85% for branches (`coverageThresholds` in `angular.json`).

The e2e tests read the pages from `projects/docs/src/app/nav.ts`, so every page in the navigation gets render checks and [axe](https://github.com/dequelabs/axe-core) accessibility checks in both light and dark mode automatically.

## Library conventions

- Don't use Bootstrap's JavaScript. All behavior is written in Angular.
- Use attribute selectors on the element Bootstrap's CSS expects, such as `[bsAlert]` or `details[bsAccordionItem]`, so the rendered DOM matches Bootstrap's markup exactly. Set Bootstrap classes and ARIA attributes in the decorator's `host` object, not with `@HostBinding` or `@HostListener`.
- Selectors use the `bs` prefix and class names start with `Bs`, such as `BsAlert`. Export every public symbol from `projects/bootstrap-ng/src/public-api.ts`.
- Set `exportAs` on components that expose state or methods to templates, for example `#alert="bsAlert"`.
- Use `booleanAttribute` and `numberAttribute` transforms on boolean and numeric inputs so static attributes like `dismissible` work.
- Open and closed state (collapse, accordion item, dialog) uses an `open` input aliased from `openInput`, an `openChange` output, and a `linkedSignal` exposed read-only as `isOpen`. Other two-way bound properties use `model()`.
- Wait for Bootstrap's CSS transitions with `waitForTransition` from `src/lib/util` before emitting "after" events such as `shown`, `hidden` and `closed`.
- Use standalone components, signals, `input()`, `output()` and `computed()`, and native control flow (`@if`, `@for`, `@switch`). Don't set `standalone: true`, and don't use `ngClass` or `ngStyle`.
- Every component has a `*.spec.ts` next to it. Add or update tests with every behavior change.
- Components must pass every axe check and meet WCAG AA minimums, including focus management, color contrast and ARIA attributes.

[`AGENTS.md`](../AGENTS.md) has the full list of Angular and TypeScript conventions.

## Docs conventions

- Each component has a page in `projects/docs/src/app/pages/components/<name>/` with an `examples/` folder.
- Each example is a small component. Its `.html` (and `.ts` when it has logic) is also imported as text with `with { loader: 'text' }`, so the source shown on the page is the code that runs.
- Add new pages to `projects/docs/src/app/nav.ts` so they appear in the sidebar and get the e2e checks.
- When a demo gains behavior, cover it in `projects/docs/e2e/demos.spec.ts`.
- Keep custom CSS to a minimum. Use Bootstrap utility classes wherever possible, and check `node_modules/bootstrap` for a utility before adding a style rule.

## GitHub Actions

- Pin every action to a full commit SHA with the version in a comment, never a tag like `@v5`:

  ```yaml
  - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
    with:
      persist-credentials: false
  ```

- Set `persist-credentials: false` on `actions/checkout`.
- Start workflow files with `---` and format them with Prettier.

## Pull requests

Before opening a pull request, run the same checks CI runs:

```sh
npm run format:check
npm run lint
npm run test:coverage
npm run build
npm run e2e
```

Then:

1. Fork the repository and create a branch from `main`.
2. Make your change, with tests and docs where they apply, and run the checks above.
3. Open a pull request against `main` and fill in the [pull request template](PULL_REQUEST_TEMPLATE.md). Link the issue it fixes, and add screenshots for visual changes.

CI runs the checks above, plus [Super Linter](https://github.com/super-linter/super-linter) (including markdownlint, configured in `.markdown-lint.yml`) and a [cspell](https://cspell.org) spell check. Add project-specific words to `.cspell.json`. All checks must pass before a pull request is merged.

Keep each pull request focused on one change. Smaller pull requests are easier to review and quicker to merge.

## Releasing

Maintainers publish to npm by publishing a GitHub release. The [Publish workflow](workflows/publish.yml) then lints, tests and builds the library and publishes `dist/bootstrap-ng` with [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) and provenance.

1. Set `version` in `projects/bootstrap-ng/package.json` and merge it to `main`.
2. Create a GitHub release from `main` with a tag of `v` plus that version, such as `v6.0.0-alpha0`. The workflow fails if they don't match.
3. Tick **Set as a pre-release** for alpha, beta and release candidate versions. Prereleases publish to the `next` dist-tag, and other versions to `latest`.

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](../LICENSE).
