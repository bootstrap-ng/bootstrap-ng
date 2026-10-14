import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { ToastBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { ToastStaticExample } from './examples/static';
import staticHtml from './examples/static.html' with { loader: 'text' };
import { ToastStackExample } from './examples/stack';
import stackHtml from './examples/stack.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import stackTs from './examples/stack.ts' with { loader: 'text' };
import { ToastServiceExample } from './examples/service';
import serviceHtml from './examples/service.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import serviceTs from './examples/service.ts' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Toasts',
  lead: 'Lightweight notifications that hide on their own, pausing while the pointer or focus is inside them.',
  bootstrapDocs: 'https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/components/toasts/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'Call <code>show()</code> on the toast. Wrap toasts in a positioned <code>.toast-container</code>. <code>bsToastClose</code> hides the parent toast.',
      example: ToastBasicExample,
      html: basicHtml,
    },
    {
      id: 'static',
      title: 'Always open',
      description:
        'Set <code>open</code> and <code>[autohide]="false"</code> to keep a toast on the page until it is closed.',
      example: ToastStaticExample,
      html: staticHtml,
    },
    {
      id: 'stack',
      title: 'Stacking',
      description:
        'Render toasts from a list and remove each one on <code>hidden</code>. The container spaces them out.',
      example: ToastStackExample,
      html: stackHtml,
      ts: stackTs,
    },
    {
      id: 'service',
      title: 'From code',
      description:
        'Inject <code>BsToaster</code> and call <code>show()</code> to show a toast without writing its markup. The toasts stack in a fixed container at the bottom end of the screen; change it with <code>setPlacement()</code>. The body can be text or a template, which gets the toast as context so it can hide itself.',
      example: ToastServiceExample,
      html: serviceHtml,
      ts: serviceTs,
    },
  ],
  api: [
    {
      name: 'BsToast',
      selector: '[bsToast]',
      exportAs: 'bsToast',
      inputs: [
        {
          name: 'open',
          type: 'boolean',
          default: 'false',
          description: 'Whether the toast is shown. Supports [(open)].',
        },
        {
          name: 'autohide',
          type: 'boolean',
          default: 'true',
          description: 'Hides the toast after delay.',
        },
        {
          name: 'delay',
          type: 'number',
          default: '5000',
          description: 'Milliseconds before the toast hides.',
        },
        {
          name: 'live',
          type: "'polite' | 'assertive'",
          default: "'polite'",
          description:
            'How urgently screen readers read the toast out when it opens. Use assertive for errors. The text goes through BsLiveAnnouncer, because screen readers often miss a live region that appears with its text.',
        },
        {
          name: 'animation',
          type: 'boolean',
          default: 'true',
          description: 'Fades the toast in and out.',
        },
      ],
      outputs: [
        {
          name: 'openChange',
          type: 'boolean',
          description: 'Emits when the toast opens or closes from inside.',
        },
        { name: 'shown', type: 'void', description: 'Emits after the toast is shown.' },
        { name: 'hidden', type: 'void', description: 'Emits after the toast is hidden.' },
      ],
      methods: [
        { name: 'show()', type: 'void', description: 'Shows the toast.' },
        { name: 'hide()', type: 'void', description: 'Hides the toast.' },
        { name: 'toggle()', type: 'void', description: 'Toggles the toast.' },
        { name: 'isOpen', type: 'Signal<boolean>', description: 'Current open state.' },
      ],
    },
    {
      name: 'BsToastClose',
      selector: '[bsToastClose]',
      inputs: [],
    },
    {
      name: 'BsToaster',
      selector: 'inject(BsToaster)',
      methods: [
        {
          name: 'show(options)',
          type: 'BsToastRef',
          description:
            'Shows a toast. Options: body (string or template), title, subtitle, theme, autohide, delay, live and closeLabel. The returned ref has hide() and an afterHidden promise.',
        },
        {
          name: 'setPlacement(placement)',
          type: 'void',
          description:
            "Where the toasts stack: 'top-start', 'top-center', 'top-end', 'bottom-start', 'bottom-center' or 'bottom-end' (the default).",
        },
        { name: 'clear()', type: 'void', description: 'Hides every toast.' },
      ],
    },
  ],
};

@Component({
  selector: 'docs-toasts-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class ToastPage {
  protected readonly page = PAGE;
}
