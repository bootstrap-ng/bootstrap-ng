// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const vitest = require('@vitest/eslint-plugin');
const playwright = require('eslint-plugin-playwright');

/**
 * @param {string} prefix
 * @returns {import('eslint').Linter.RulesRecord}
 */
const selectorRules = (prefix) => ({
  '@angular-eslint/directive-selector': [
    'error',
    { type: 'attribute', prefix, style: 'camelCase' },
  ],
  '@angular-eslint/component-selector': [
    'error',
    [
      { type: 'element', prefix, style: 'kebab-case' },
      { type: 'attribute', prefix, style: 'camelCase' },
    ],
  ],
});

module.exports = defineConfig([
  {
    // Stale `eslint-disable` comments fail the lint instead of piling up.
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
      reportUnusedInlineConfigs: 'error',
    },
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      angular.configs.tsAll,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    processor: angular.processInlineTemplates,
    rules: {
      // Stricter than the presets: core rules that catch bugs or keep the code consistent.
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': ['error', { allow: ['error'] }],
      'prefer-template': 'error',
      'object-shorthand': 'error',
      'no-param-reassign': 'error',
      'no-else-return': ['error', { allowElseIf: false }],
      'prefer-arrow-callback': 'error',
      'no-useless-rename': 'error',
      'no-useless-concat': 'error',
      'no-lonely-if': 'error',
      'no-return-assign': 'error',
      'no-unneeded-ternary': 'error',
      'no-useless-return': 'error',
      'prefer-object-spread': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      radix: 'error',
      'default-case-last': 'error',
      'no-restricted-syntax': ['error', 'ForInStatement'],
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        { considerDefaultExhaustiveForUnions: true },
      ],
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
      '@typescript-eslint/no-unnecessary-qualifier': 'error',
      '@typescript-eslint/no-useless-empty-export': 'error',
      '@typescript-eslint/prefer-enum-initializers': 'error',
      '@typescript-eslint/require-array-sort-compare': 'error',
      '@typescript-eslint/no-loop-func': 'error',
      '@typescript-eslint/default-param-last': 'error',
      // A leading underscore marks a parameter a signature needs but the body doesn't use,
      // e.g. the directive argument of Angular's ngTemplateContextGuard.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      curly: 'error',
      yoda: 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-object-constructor': 'error',
      'no-caller': 'error',
      'no-proto': 'error',
      'no-extend-native': 'error',
      'no-script-url': 'error',
      'no-sequences': 'error',
      'no-labels': 'error',
      'no-lone-blocks': 'error',
      'no-multi-assign': 'error',
      'no-extra-bind': 'error',
      'no-useless-call': 'error',
      'no-useless-computed-key': 'error',
      'no-self-compare': 'error',
      'no-constructor-return': 'error',
      'no-inner-declarations': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unreachable-loop': 'error',
      'no-octal-escape': 'error',
      'no-duplicate-imports': 'error',
      'array-callback-return': 'error',
      'accessor-pairs': 'error',
      'grouped-accessor-pairs': ['error', 'getBeforeSet'],
      'symbol-description': 'error',
      'operator-assignment': 'error',
      'logical-assignment-operators': ['error', 'always', { enforceForIfStatements: true }],
      'prefer-exponentiation-operator': 'error',
      'prefer-numeric-literals': 'error',
      'prefer-object-has-own': 'error',
      'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }],
      // Guardrails the code is well inside today, so a function can't quietly grow too tangled.
      complexity: ['error', 20],
      'max-depth': ['error', 4],
      '@typescript-eslint/max-params': 'error',
      '@typescript-eslint/no-unnecessary-parameter-property-assignment': 'error',
      // Class names follow the Angular v20+ style guide: `BsAlert`, not `BsAlertComponent`.
      '@angular-eslint/component-class-suffix': 'off',
      '@angular-eslint/directive-class-suffix': 'off',
      // Inline templates are preferred for small components (AGENTS.md).
      '@angular-eslint/component-max-inline-declarations': 'off',
      '@angular-eslint/sort-keys-in-type-decorator': 'off',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      // Components, directives and services are decorated classes that may have no members.
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
      // Form controls register themselves as NG_VALUE_ACCESSOR with `forwardRef`.
      '@angular-eslint/no-forward-ref': 'off',
      // Angular's `Validators` are static methods that are meant to be passed by reference.
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      // Test hosts are declared inline and never rendered by selector.
      '@angular-eslint/use-component-selector': 'off',
      // ComponentFixture.nativeElement and debugElement are typed as `any`.
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/non-nullable-type-assertion-style': 'off',
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  {
    files: ['projects/bootstrap-ng/**/*.spec.ts'],
    extends: [vitest.configs.recommended],
    rules: {
      'vitest/consistent-test-it': 'error',
      'vitest/expect-expect': 'error',
      'vitest/hoisted-apis-on-top': 'error',
      'vitest/no-alias-methods': 'error',
      'vitest/no-commented-out-tests': 'error',
      'vitest/no-conditional-expect': 'error',
      'vitest/no-conditional-in-test': 'error',
      'vitest/no-conditional-tests': 'error',
      'vitest/no-disabled-tests': 'error',
      'vitest/no-duplicate-hooks': 'error',
      'vitest/no-focused-tests': 'error',
      'vitest/no-standalone-expect': 'error',
      'vitest/no-test-prefixes': 'error',
      'vitest/no-test-return-statement': 'error',
      'vitest/prefer-comparison-matcher': 'error',
      'vitest/prefer-equality-matcher': 'error',
      'vitest/prefer-hooks-in-order': 'error',
      'vitest/prefer-hooks-on-top': 'error',
      'vitest/prefer-spy-on': 'error',
      'vitest/prefer-to-be': 'error',
      'vitest/prefer-to-contain': 'error',
      'vitest/require-awaited-expect-poll': 'error',
      'vitest/require-to-throw-message': 'error',
      'vitest/valid-expect-in-promise': 'error',
    },
  },
  {
    files: ['projects/docs/e2e/**/*.ts'],
    extends: [playwright.configs['flat/recommended']],
    rules: {
      // Promote the preset's warnings: a warning never fails `npm run lint`.
      ...Object.fromEntries(
        Object.entries(playwright.configs['flat/recommended'].rules ?? {})
          .filter(([name]) => name.startsWith('playwright/'))
          .map(([name]) => [name, 'error']),
      ),
      // The page tests loop over `nav.ts`, and the home page has no sidebar link or headings.
      'playwright/no-conditional-in-test': 'off',
      'playwright/no-conditional-expect': 'off',
    },
  },
  {
    // Example sources imported as text (`with { loader: 'text' }`) type as `any` or,
    // for `.ts` files, as an error that the import suppresses.
    files: ['projects/docs/src/app/pages/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    files: ['projects/bootstrap-ng/**/*.ts'],
    rules: selectorRules('bs'),
  },
  {
    files: ['projects/docs/**/*.ts'],
    rules: selectorRules('docs'),
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateAll],
    rules: {
      // Angular signals are read by calling them.
      '@angular-eslint/template/no-call-expression': 'off',
      // The library and docs are not localized.
      '@angular-eslint/template/i18n': 'off',
      '@angular-eslint/template/attributes-order': 'off',
      '@angular-eslint/template/cyclomatic-complexity': 'off',
      // `class="…"` alongside `[class]="…"` is the usual way to combine static and dynamic classes.
      '@angular-eslint/template/no-duplicate-attributes': [
        'error',
        { allowStylePrecedenceDuplicates: true },
      ],
      '@angular-eslint/template/no-inline-styles': ['error', { allowBindToStyle: true }],
      // These directives set `type="button"` through host bindings, and BsCloseButton sets
      // its default aria-label ("Close") the same way.
      '@angular-eslint/template/button-has-type': [
        'error',
        {
          ignoreWithDirectives: [
            'bsCloseButton',
            'bsTab',
            'bsChipDismiss',
            'bsComboboxOption',
            'bsCombobox',
          ],
        },
      ],
      // BsChipDismiss and BsCombobox render their own content (an icon, or the selected value).
      '@angular-eslint/template/elements-content': [
        'error',
        { allowList: ['bsCloseButton', 'bsChipDismiss', 'bsCombobox'] },
      ],
      // Inside a bsFormField, BsLabel and BsFormLabel set `for` to the field's control id.
      '@angular-eslint/template/label-has-associated-control': [
        'error',
        {
          labelComponents: [
            { selector: 'label', inputs: ['for', 'htmlFor', 'bsLabel', 'bsFormLabel'] },
          ],
        },
      ],
    },
  },
  {
    // Inline templates live inside a TypeScript template literal, where a nested backtick
    // would end the string.
    files: ['**/*.ts/**'],
    rules: {
      '@angular-eslint/template/prefer-template-literal': 'off',
    },
  },
  {
    // Docs examples and test hosts size placeholder content with inline styles, as Bootstrap's docs do.
    files: ['projects/docs/src/app/pages/**/examples/*.html', '**/*.spec.ts/**'],
    rules: {
      '@angular-eslint/template/no-inline-styles': 'off',
    },
  },
]);
