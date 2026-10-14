import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { AlertBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { AlertThemesExample } from './examples/themes';
import themesHtml from './examples/themes.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import themesTs from './examples/themes.ts' with { loader: 'text' };
import { AlertDismissibleExample } from './examples/dismissible';
import dismissibleHtml from './examples/dismissible.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import dismissibleTs from './examples/dismissible.ts' with { loader: 'text' };
import { AlertContentExample } from './examples/content';
import contentHtml from './examples/content.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Alert',
  lead: 'Contextual feedback messages for typical user actions.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/components/alert/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'Put your message inside the alert. Without a theme, the alert uses neutral colors.',
      example: AlertBasicExample,
      html: basicHtml,
    },
    {
      id: 'themes',
      title: 'Themes',
      description:
        'Set <code>theme</code> to any Bootstrap theme color. Use <code>.alert-link</code> for matching links.',
      example: AlertThemesExample,
      html: themesHtml,
      ts: themesTs,
    },
    {
      id: 'dismissible',
      title: 'Dismissing',
      description:
        'Add <code>dismissible</code> to show a close button. The alert fades out, gets the <code>hidden</code> attribute, and emits <code>closed</code>. To remove it from the DOM, wrap it in <code>@if</code>. Focus on the close button moves to the next control on the page, so keyboard users keep their place.',
      example: AlertDismissibleExample,
      html: dismissibleHtml,
      ts: dismissibleTs,
    },
    {
      id: 'additional-content',
      title: 'Additional content',
      description: 'Alerts can contain headings, paragraphs and dividers.',
      example: AlertContentExample,
      html: contentHtml,
    },
  ],
  api: [
    {
      name: 'BsAlert',
      selector: '[bsAlert]',
      exportAs: 'bsAlert',
      inputs: [
        {
          name: 'theme',
          type: 'BsTheme | null',
          default: 'null',
          description: 'Theme color of the alert.',
        },
        {
          name: 'dismissible',
          type: 'boolean',
          default: 'false',
          description: 'Shows a close button.',
        },
        {
          name: 'closeLabel',
          type: 'string',
          default: "'Close'",
          description: 'Accessible label of the close button.',
        },
        {
          name: 'animation',
          type: 'boolean',
          default: 'true',
          description: 'Fades the alert out when it closes.',
        },
      ],
      outputs: [
        {
          name: 'closing',
          type: 'void',
          description: 'Emits when the alert starts to close.',
        },
        {
          name: 'closed',
          type: 'void',
          description: 'Emits after the alert is closed and its transition has finished.',
        },
      ],
      methods: [
        {
          name: 'close()',
          type: 'Promise<void>',
          description: 'Closes the alert.',
        },
        {
          name: 'isClosed',
          type: 'Signal<boolean>',
          description: 'True after the alert has closed.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-alert-page',
  imports: [DocsPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<docs-page [page]="page" />',
})
export default class AlertPage {
  protected readonly page = PAGE;
}
