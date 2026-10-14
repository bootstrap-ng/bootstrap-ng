import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { SpinnerTypesExample } from './examples/types';
import typesHtml from './examples/types.html' with { loader: 'text' };
import { SpinnerButtonExample } from './examples/button';
import buttonHtml from './examples/button.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Spinner',
  lead: 'Loading indicators built with HTML and CSS.',
  bootstrapDocs: 'https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/components/spinner/',
  sections: [
    {
      id: 'types',
      title: 'Types, colors and sizes',
      description:
        'Use <code>type="grow"</code> for the growing spinner and <code>size="sm"</code> for a small one. Spinners use the current text color, so color them with <code>.fg-*</code> utilities.',
      example: SpinnerTypesExample,
      html: typesHtml,
    },
    {
      id: 'button',
      title: 'In buttons',
      description:
        'Set <code>label=""</code> when visible text already says what is loading. The spinner is then hidden from screen readers.',
      example: SpinnerButtonExample,
      html: buttonHtml,
    },
  ],
  api: [
    {
      name: 'BsSpinner',
      selector: 'bs-spinner',
      inputs: [
        {
          name: 'type',
          type: "'border' | 'grow'",
          default: "'border'",
          description: 'Spinner style.',
        },
        {
          name: 'size',
          type: "'sm' | 'md'",
          default: "'md'",
          description: 'Spinner size.',
        },
        {
          name: 'label',
          type: 'string',
          default: "'Loading…'",
          description: 'Text for screen readers. Empty makes the spinner decorative.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-spinner-page',
  imports: [DocsPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<docs-page [page]="page" />',
})
export default class SpinnerPage {
  protected readonly page = PAGE;
}
