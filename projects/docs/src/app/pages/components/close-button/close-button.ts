import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { CloseButtonBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { CloseButtonDisabledExample } from './examples/disabled';
import disabledHtml from './examples/disabled.html' with { loader: 'text' };
import { CloseButtonDarkExample } from './examples/dark';
import darkHtml from './examples/dark.html' with { loader: 'text' };
import { CloseButtonLabelExample } from './examples/label';
import labelHtml from './examples/label.html' with { loader: 'text' };
import { CloseButtonConfigExample } from './examples/config';
import configHtml from './examples/config.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import configTs from './examples/config.ts' with { loader: 'text' };
import { CloseButtonDismissExample } from './examples/dismiss';
import dismissHtml from './examples/dismiss.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import dismissTs from './examples/dismiss.ts' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Close button',
  lead: 'A generic close button for dialogs, alerts and more.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/components/close-button/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'The directive adds <code>.btn-close</code>, sets <code>type="button"</code> and gives the button a default <code>aria-label</code> of “Close”. The icon is drawn with a CSS mask, so it follows the button’s <code>color</code>.',
      example: CloseButtonBasicExample,
      html: basicHtml,
    },
    {
      id: 'disabled',
      title: 'Disabled state',
      description: 'Add <code>disabled</code> to fade the button and stop hover and active styles.',
      example: CloseButtonDisabledExample,
      html: disabledHtml,
    },
    {
      id: 'dark',
      title: 'Dark variant',
      description:
        'Add <code>data-bs-theme="dark"</code> to the button or a parent to invert it. This happens on its own in dark mode.',
      example: CloseButtonDarkExample,
      html: darkHtml,
    },
    {
      id: 'label',
      title: 'Accessible label',
      description:
        'A screen reader only announces the label, so say what the button closes when “Close” isn’t clear enough, for example when a page has several close buttons.',
      example: CloseButtonLabelExample,
      html: labelHtml,
    },
    {
      id: 'config',
      title: 'Default label',
      description:
        'Change the default label for the whole app, or for part of it, with <code>provideBsCloseButtonConfig()</code>, for example to translate it or, as here, to use “Dismiss”. A label set on a button still wins.',
      example: CloseButtonConfigExample,
      html: configHtml,
      ts: configTs,
    },
    {
      id: 'dismiss',
      title: 'Dismissing content',
      description:
        'Bind <code>(click)</code> to hide your own content. Components that close themselves have their own: <code>dismissible</code> on alerts, and <code>bsDialogClose</code>, <code>bsDrawerClose</code> and <code>bsToastClose</code> on a close button inside dialogs, drawers and toasts.',
      example: CloseButtonDismissExample,
      html: dismissHtml,
      ts: dismissTs,
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
