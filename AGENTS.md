# Agent instructions

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## About this repository

bootstrap-ng is an Angular 22+ component library for Bootstrap 6. See `README.md` for the user-facing overview.

- `projects/bootstrap-ng`: the library, published to npm as `bootstrap-ng`. The selector prefix is `bs` and class names start with `Bs` (e.g. `BsAlert`). Every public symbol is exported from `src/public-api.ts`.
- `projects/docs`: the documentation site, an Angular app. It imports `bootstrap-ng` from the library source through a `tsconfig.json` path, so library changes need no rebuild.
- Bootstrap 6 is pinned to an exact pre-release from npm (`bootstrap@6.0.0-alpha.1`, published under the `next` tag) in `package.json`. The docs site loads the same version's CSS from jsDelivr in `projects/docs/src/index.html` with an SRI hash; bump both together. Check Bootstrap 6 markup and class names in `node_modules/bootstrap` or the [v6 docs](https://getbootstrap.com/docs/6.0/), not from Bootstrap 5 knowledge: v6 uses `.btn-solid`/`.btn-outline`/`.btn-subtle` with `.theme-*`, native `<dialog class="dialog">`, and `<details>` accordions.

### Commands

Node.js 22.22.3+ or 24.15+ (see `.nvmrc`).

- `npm start`: docs site at <http://localhost:4200>
- `npm test`: library unit tests (Vitest in browser mode with Chromium via Playwright)
- `npm run test:coverage`: unit tests with coverage; fails under the thresholds in `angular.json`
- `npm run build`: builds the library, then the docs
- `npm run e2e`: Playwright tests in `projects/docs/e2e` against the built docs (run `npm run build` first). They cover every page in `nav.ts`, including axe checks in light and dark mode
- `npm run bundlewatch`: checks the gzipped size of the library FESM bundle against the limit under `bundlewatch` in `package.json` (run `npm run build:lib` first). Raise the limit in the same PR when growth is intended
- `npm run format` / `npm run format:check`: Prettier
- `npm run lint`: ESLint on the library and docs, configured in `eslint.config.js`. It is type-aware and strict (typescript-eslint `strictTypeChecked` and `stylisticTypeChecked`, all angular-eslint rules, plus extra rules such as `eqeqeq`, `curly`, `switch-exhaustiveness-check` and `prefer-readonly`, `@vitest/eslint-plugin` on unit tests and `eslint-plugin-playwright` on e2e tests), so type `ElementRef` as `inject<ElementRef<HTMLElement>>(ElementRef)` and mark promises you intentionally don't await with `void`. Unused `eslint-disable` comments are errors. It then type-checks `projects/docs/e2e` with `tsc`, which Playwright itself skips.

CI runs `format:check`, `lint`, `test:coverage`, `build` and `e2e`, and the Bundlewatch workflow runs `build:lib` and `bundlewatch` when library files change; all must pass.

Always format TypeScript (and every other file you change) with Prettier: run `npm run format` before committing, and never hand-format or leave a file unformatted. Super-Linter in CI also checks TypeScript with its own Prettier version, which can wrap some code differently from the repo's; if it disagrees, restructure the code (for example, move an inline arrow-function argument into a `const`) so both versions agree.

Squash a pull request's commits into one before it is reviewed or merged. When you push follow-up fixes to your own PR branch, squash them into that commit and force-push (`git push --force-with-lease`).

### Library conventions

- Do NOT use Bootstrap's JavaScript. All behavior is implemented in Angular.
- Use attribute selectors on the element Bootstrap's CSS expects (e.g. `[bsAlert]`, `details[bsAccordionItem]`) so the rendered DOM matches Bootstrap's markup exactly. Set Bootstrap classes and ARIA attributes through the `host` object.
- Set `exportAs` on components that expose state or methods to templates (e.g. `#alert="bsAlert"`).
- Use `booleanAttribute` / `numberAttribute` transforms on boolean and numeric inputs so static attributes like `dismissible` work.
- Open/closed state (collapse, accordion item, dialog) uses an `open` input aliased from `openInput`, an `openChange` output, and a `linkedSignal` exposed read-only as `isOpen`. This is the one exception to the `model()` rule below, because `model()` cannot take a `booleanAttribute` transform for a static `open` attribute.
- Built-in labels and inputs that apps commonly set the same way everywhere take their default from the component's config (`BS_*_CONFIG`, made with `configToken()` from `src/lib/util/config.ts` and set with a `provideBs*Config()` function): `input(this.config.name ?? default)`. Add new ones to the table on the Global configuration docs page.
- Wait for Bootstrap's CSS transitions with `waitForTransition` from `src/lib/util` before emitting "after" events such as `shown`, `hidden` and `closed`.
- Every component has a `*.spec.ts` next to it. Add or update tests with every behavior change.
- When a docs demo gains behavior, cover it in `projects/docs/e2e/demos.spec.ts`. New pages get the render and axe checks automatically once they are in `nav.ts`.

### Docs conventions

- Each component has a page in `projects/docs/src/app/pages/components/<name>/` with an `examples/` folder.
- Each example is a small component whose `.html` (and `.ts` when it has logic) is also imported as text with `with { loader: 'text' }`, so the source shown on the page is the code that runs.
- Routes are lazy loaded with `loadComponent` / `loadChildren`.
- `scripts/stackblitz.mjs` turns every example into a StackBlitz project (an Angular CLI app that installs `bootstrap-ng@next`) in `projects/docs/public/stackblitz/`, which git ignores. `npm start` and `npm run build` run it first. It finds an example by its `selector`, `templateUrl: './…'` and `./` imports, so keep examples self-contained in their `examples/` folder.
- `scripts/headers.mjs` writes the Cloudflare Pages `_headers` file with the security headers, including a Content-Security-Policy per page that allows its inline scripts by hash. When the docs start loading from a new host, add it to the policy there; the e2e tests fail on any CSP violation.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()` (except the open/closed state pattern above)
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

## Pull Requests

- Use meaningful branch names.
- Squash commits to a single commit.
