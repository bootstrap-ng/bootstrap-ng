import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { TypeaheadBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import basicTs from './examples/basic.ts' with { loader: 'text' };
import { TypeaheadAsyncExample } from './examples/async';
import asyncHtml from './examples/async.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import asyncTs from './examples/async.ts' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Typeahead',
  lead: 'A text input that suggests values while the user types. The user can pick a suggestion or keep their own text.',
  bootstrapDocs: 'https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/forms/form-control/',
  sections: [
    {
      id: 'example',
      title: 'Example',
      description:
        'Add <code>bsTypeahead</code> to a text input and give it a search function that returns the suggestions for a term. The input stays a native input, so bind it with <code>[formControl]</code>, <code>[(ngModel)]</code> or <code>[formField]</code>. It follows the ARIA combobox pattern: <kbd>↓</kbd> and <kbd>↑</kbd> move through the suggestions, <kbd>Enter</kbd> picks one and <kbd>Escape</kbd> closes the list. Screen readers hear how many suggestions there are.',
      example: TypeaheadBasicExample,
      html: basicHtml,
      ts: basicTs,
    },
    {
      id: 'async',
      title: 'Async search and custom items',
      description:
        'The search can return a promise or an observable, so it can call a server. Only the answer to the latest term is shown, and <code>debounce</code> (200 ms by default) waits for the user to pause. For objects, <code>formatter</code> turns a suggestion into text, and <code>itemTemplate</code> renders each one. <code>itemSelect</code> emits the picked suggestion.',
      example: TypeaheadAsyncExample,
      html: asyncHtml,
      ts: asyncTs,
    },
  ],
  api: [
    {
      name: 'BsTypeahead',
      selector: 'input[bsTypeahead]',
      exportAs: 'bsTypeahead',
      inputs: [
        {
          name: 'bsTypeahead',
          type: '(term: string) => T[] | Promise<T[]> | Observable<T[]>',
          description: 'Finds the suggestions for a term. Required.',
        },
        {
          name: 'formatter',
          type: '(item: T) => string',
          default: 'String',
          description: 'Text shown for a suggestion and put in the input when it is picked.',
        },
        {
          name: 'itemTemplate',
          type: 'TemplateRef | null',
          default: 'null',
          description:
            'Template for each suggestion. Context: $implicit (the suggestion), term and text.',
        },
        {
          name: 'minLength',
          type: 'number',
          default: '1',
          description: 'Characters to type before searching.',
        },
        {
          name: 'debounce',
          type: 'number',
          default: '200',
          description: 'Milliseconds to wait after the last keystroke before searching.',
        },
        {
          name: 'placement',
          type: 'BsPlacement',
          default: "'bottom-start'",
          description: 'Where the list opens relative to the input.',
        },
        {
          name: 'listLabel',
          type: 'string',
          default: "'Suggestions'",
          description: 'Accessible label of the suggestion list.',
        },
        {
          name: 'resultsText',
          type: '(count: number) => string',
          default: "'3 suggestions available'",
          description: 'Text announced to screen readers when suggestions arrive.',
        },
      ],
      outputs: [
        {
          name: 'itemSelect',
          type: 'T',
          description: 'Emits the suggestion the user picked, after the input is updated.',
        },
      ],
      methods: [
        {
          name: 'close()',
          type: 'void',
          description: 'Closes the suggestion list.',
        },
        {
          name: 'isOpen',
          type: 'Signal<boolean>',
          description: 'Whether the suggestion list is showing.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-typeahead-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class TypeaheadPage {
  protected readonly page = PAGE;
}
