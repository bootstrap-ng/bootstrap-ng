import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { CloseButtonBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Close button',
  lead: 'A generic close button for dialogs, alerts and more.',
  bootstrapDocs: 'https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/components/close-button/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'The directive sets <code>type="button"</code> and a default <code>aria-label</code> of “Close”. Set your own label for other languages or more context.',
      example: CloseButtonBasicExample,
      html: basicHtml,
    },
  ],
  api: [
    {
      name: 'BsCloseButton',
      selector: 'button[bsCloseButton]',
      inputs: [
        {
          name: 'aria-label',
          type: 'string',
          default: "'Close'",
          description: 'Accessible label of the button.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-close-button-page',
  imports: [DocsPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<docs-page [page]="page" />',
})
export default class CloseButtonPage {
  protected readonly page = PAGE;
}
