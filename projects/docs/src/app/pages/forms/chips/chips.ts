import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { ChipsBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import basicTs from './examples/basic.ts' with { loader: 'text' };
import { ChipsThemesExample } from './examples/themes';
import themesHtml from './examples/themes.html' with { loader: 'text' };
import { ChipsActiveExample } from './examples/active';
import activeHtml from './examples/active.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import activeTs from './examples/active.ts' with { loader: 'text' };
import { ChipsInputExample } from './examples/input';
import inputHtml from './examples/input.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import inputTs from './examples/input.ts' with { loader: 'text' };
import { ChipsInputThemesExample } from './examples/input-themes';
import input_themesHtml from './examples/input-themes.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import input_themesTs from './examples/input-themes.ts' with { loader: 'text' };
import { ChipsEmptyExample } from './examples/empty';
import emptyHtml from './examples/empty.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import emptyTs from './examples/empty.ts' with { loader: 'text' };
import { ChipsDisabledExample } from './examples/disabled';
import disabledHtml from './examples/disabled.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import disabledTs from './examples/disabled.ts' with { loader: 'text' };
import { ChipsValidationExample } from './examples/validation';
import validationHtml from './examples/validation.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import validationTs from './examples/validation.ts' with { loader: 'text' };
import { ChipsKeyboardExample } from './examples/keyboard';
import keyboardHtml from './examples/keyboard.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import keyboardTs from './examples/keyboard.ts' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Chips',
  lead: 'Small interactive elements for people, places, tags or values, and a chip input for multi-value fields like skills, categories or email recipients.',
  bootstrapDocs: 'https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/forms/chips/',
  sections: [
    {
      id: 'chips',
      title: 'Chips',
      description:
        'Use <code>bsChip</code> for standalone chips. Add <code>.chip-icon</code> for a leading icon, <code>.chip-img</code> for an image like an avatar, and a <code>bsChipDismiss</code> button to make it removable. Name the chip in the button’s <code>aria-label</code>.',
      example: ChipsBasicExample,
      html: basicHtml,
      ts: basicTs,
    },
    {
      id: 'themed-chips',
      title: 'Themed chips',
      description:
        'Set <code>theme</code> to color a chip. Chips are subtle by default, which leaves room for a clear active state.',
      example: ChipsThemesExample,
      html: themesHtml,
    },
    {
      id: 'active-state',
      title: 'Active state',
      description:
        'Set <code>active</code> for the solid appearance, for example for toggle-style chip filters. Use buttons with <code>aria-pressed</code> for chips people can toggle.',
      example: ChipsActiveExample,
      html: activeHtml,
      ts: activeTs,
    },
    {
      id: 'chip-input',
      title: 'Chip input',
      description:
        '<code>bsChipInput</code> is a field of chips with a ghost input for adding more. Its value is a <code>string[]</code>, bound with <code>[formControl]</code>, <code>[(ngModel)]</code>, <code>[formField]</code> or <code>[(value)]</code>. Type and press <kbd>Enter</kbd> or <kbd>,</kbd> to add a chip, and <kbd>Backspace</kbd> to remove one. See <a href="forms/chips#keyboard-behavior">Keyboard behavior</a>.',
      example: ChipsInputExample,
      html: inputHtml,
      ts: inputTs,
    },
    {
      id: 'theme-variants',
      title: 'Theme variants',
      description:
        'Set <code>theme</code> on the chip input to color every chip in it. Give an input without a visible label an <code>aria-label</code>.',
      example: ChipsInputThemesExample,
      html: input_themesHtml,
      ts: input_themesTs,
    },
    {
      id: 'empty-state',
      title: 'Empty state and limits',
      description:
        'Start with no chips, and cap them with <code>maxChips</code>: the input is disabled once the limit is reached. Set <code>separator</code> to change the character that adds a chip, or to <code>null</code> to add chips with <kbd>Enter</kbd> only.',
      example: ChipsEmptyExample,
      html: emptyHtml,
      ts: emptyTs,
    },
    {
      id: 'disabled',
      title: 'Disabled',
      description:
        'Disable the chip input with the <code>disabled</code> input or the form control. Chips can’t be added or removed.',
      example: ChipsDisabledExample,
      html: disabledHtml,
      ts: disabledTs,
    },
    {
      id: 'validation',
      title: 'Validation',
      description:
        'The chip input follows its form control’s validation state inside a <code>bsFormField</code>.',
      example: ChipsValidationExample,
      html: validationHtml,
      ts: validationTs,
    },
    {
      id: 'keyboard-behavior',
      title: 'Keyboard behavior',
      description:
        'In the input: <kbd>Enter</kbd> or the separator adds a chip, <kbd>Backspace</kbd> in an empty input selects the last chip, <kbd>←</kbd> at the start moves to the chips, and <kbd>Escape</kbd> clears the text. On a chip: <kbd>←</kbd> <kbd>→</kbd> <kbd>Home</kbd> <kbd>End</kbd> move between chips (with <kbd>Shift</kbd> to extend the selection), <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>A</kbd> selects all, and <kbd>Backspace</kbd> or <kbd>Delete</kbd> removes the selected chips. Additions and removals are announced to screen readers. Pasting <code>a, b, c</code> adds three chips.',
      example: ChipsKeyboardExample,
      html: keyboardHtml,
      ts: keyboardTs,
    },
  ],
  api: [
    {
      name: 'BsChip',
      selector: '[bsChip]',
      exportAs: 'bsChip',
      inputs: [
        {
          name: 'theme',
          type: 'BsTheme | null',
          default: 'null',
          description: 'Theme color of the chip.',
        },
        {
          name: 'active',
          type: 'boolean',
          default: 'false',
          description: 'Solid appearance, for example for a selected chip.',
        },
      ],
    },
    {
      name: 'BsChipDismiss',
      selector: 'button[bsChipDismiss]',
      inputs: [
        {
          name: 'aria-label',
          type: 'string',
          default: "'Remove'",
          description: 'Accessible name of the button. Name the chip in it.',
        },
      ],
    },
    {
      name: 'BsChipInput',
      selector: 'div[bsChipInput]',
      exportAs: 'bsChipInput',
      inputs: [
        {
          name: 'value',
          type: 'string[]',
          default: '[]',
          description: 'The chips. Supports two-way binding with [(value)].',
        },
        {
          name: 'theme',
          type: 'BsTheme | null',
          default: 'null',
          description: 'Theme color of the chips.',
        },
        {
          name: 'separator',
          type: 'string | null',
          default: "','",
          description: 'Character that adds a chip when typed. Enter always adds one.',
        },
        {
          name: 'allowDuplicates',
          type: 'boolean',
          default: 'false',
          description: 'Allows the same value more than once.',
        },
        {
          name: 'maxChips',
          type: 'number | null',
          default: 'null',
          description: 'Maximum number of chips.',
        },
        {
          name: 'placeholder',
          type: 'string',
          default: "''",
          description: 'Placeholder of the input.',
        },
        {
          name: 'dismissible',
          type: 'boolean',
          default: 'true',
          description: 'Shows a remove button on each chip.',
        },
        {
          name: 'createOnBlur',
          type: 'boolean',
          default: 'true',
          description: 'Adds the typed text as a chip when focus leaves the input.',
        },
        {
          name: 'removeLabel',
          type: 'string',
          default: "'Remove'",
          description: 'Start of the remove buttons’ accessible names, followed by the chip.',
        },
        {
          name: 'aria-label',
          type: 'string | null',
          default: 'null',
          description: 'Accessible name of the input, when it has no visible label.',
        },
        {
          name: 'validation',
          type: "'auto' | 'valid' | 'invalid' | 'none'",
          default: "'auto'",
          description: 'Validation styles of the input.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Disables the control. Forms also disable it through the form control.',
        },
      ],
      outputs: [
        {
          name: 'valueChange',
          type: 'string[]',
          description: 'Emits the chips when the user adds or removes one.',
        },
      ],
      methods: [
        {
          name: 'add(value)',
          type: 'boolean',
          description: 'Adds a chip. Returns false for an empty value, a duplicate or when full.',
        },
        {
          name: 'remove(value)',
          type: 'boolean',
          description: 'Removes the first chip with the value.',
        },
        {
          name: 'clear()',
          type: 'void',
          description: 'Removes every chip.',
        },
        {
          name: 'focus()',
          type: 'void',
          description: 'Focuses the input.',
        },
        {
          name: 'selected',
          type: 'Signal<ReadonlySet<number>>',
          description: 'Indexes of the selected chips.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-chips-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class ChipsPage {
  protected readonly page = PAGE;
}
