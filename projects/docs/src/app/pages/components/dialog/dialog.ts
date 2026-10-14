import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { DialogBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { DialogStaticExample } from './examples/static';
import staticHtml from './examples/static.html' with { loader: 'text' };
import { DialogModelExample } from './examples/model';
import modelHtml from './examples/model.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import modelTs from './examples/model.ts' with { loader: 'text' };
import { DialogServiceExample } from './examples/service';
import serviceHtml from './examples/service.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import serviceTs from './examples/service.ts' with { loader: 'text' };
import { DialogNonmodalExample } from './examples/nonmodal';
import nonmodalHtml from './examples/nonmodal.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Dialog',
  lead: 'Dialogs built on the native <dialog> element, which replaces Bootstrap’s old modal.',
  bootstrapDocs: 'https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/components/dialog/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'Call <code>show()</code> on the dialog’s template reference. Modal dialogs render in the browser’s top layer, trap focus, and close on Escape. <code>bsDialogClose</code> closes the parent dialog.',
      example: DialogBasicExample,
      html: basicHtml,
    },
    {
      id: 'static',
      title: 'Static backdrop',
      description:
        'Set <code>backdrop="static"</code> and <code>[keyboard]="false"</code> to make the user choose an action. The dialog bounces when they click outside it.',
      example: DialogStaticExample,
      html: staticHtml,
    },
    {
      id: 'model',
      title: 'Two-way binding',
      description:
        'Bind <code>[(open)]</code> to open the dialog from state. <code>dismissed</code> tells you when the user closed it with Escape or the backdrop.',
      example: DialogModelExample,
      html: modelHtml,
      ts: modelTs,
    },
    {
      id: 'nonmodal',
      title: 'Non-modal',
      description:
        'Set <code>[modal]="false"</code> to open the dialog inline with <code>show()</code>. The rest of the page stays interactive.',
      example: DialogNonmodalExample,
      html: nonmodalHtml,
    },
    {
      id: 'service',
      title: 'Opening from code',
      description:
        'Inject <code>BsDialogService</code> and call <code>open()</code> with a component or template to show a dialog without writing the <code>&lt;dialog&gt;</code> yourself. Pass the component’s inputs in <code>inputs</code>. The component provides the header, body and footer, and injects <code>BsDialogRef</code> to <code>close()</code> with a value. <code>bsDialogClose</code> dismisses it. The ref’s <code>result</code> promise resolves with that value, or <code>undefined</code> when dismissed, once the dialog is gone. The dialog is labelled by its first <code>.dialog-title</code>.',
      example: DialogServiceExample,
      html: serviceHtml,
      ts: serviceTs,
    },
  ],
  api: [
    {
      name: 'BsDialog',
      selector: 'dialog[bsDialog]',
      exportAs: 'bsDialog',
      inputs: [
        {
          name: 'open',
          type: 'boolean',
          default: 'false',
          description: 'Whether the dialog is open. Supports [(open)].',
        },
        {
          name: 'modal',
          type: 'boolean',
          default: 'true',
          description: 'Opens as a modal with a backdrop and focus trap.',
        },
        {
          name: 'backdrop',
          type: "boolean | 'static'",
          default: 'true',
          description: "true closes on backdrop click, 'static' bounces, false ignores the click.",
        },
        {
          name: 'keyboard',
          type: 'boolean',
          default: 'true',
          description: 'Closes the dialog on Escape.',
        },
        {
          name: 'animation',
          type: 'boolean',
          default: 'true',
          description: 'Animates opening and closing.',
        },
      ],
      outputs: [
        {
          name: 'openChange',
          type: 'boolean',
          description: 'Emits when the dialog opens or closes from inside.',
        },
        {
          name: 'shown',
          type: 'void',
          description: 'Emits after the dialog is shown.',
        },
        {
          name: 'hidden',
          type: 'void',
          description: 'Emits after the dialog is hidden.',
        },
        {
          name: 'dismissed',
          type: "'escape' | 'backdrop'",
          description: 'Emits when the user dismisses the dialog.',
        },
      ],
      methods: [
        {
          name: 'show()',
          type: 'void',
          description: 'Opens the dialog.',
        },
        {
          name: 'hide()',
          type: 'void',
          description: 'Closes the dialog.',
        },
        {
          name: 'toggle()',
          type: 'void',
          description: 'Toggles the dialog.',
        },
        {
          name: 'isOpen',
          type: 'Signal<boolean>',
          description: 'Current open state.',
        },
      ],
    },
    {
      name: 'BsDialogClose',
      selector: '[bsDialogClose]',
      inputs: [],
    },
    {
      name: 'BsDialogService',
      selector: 'inject(BsDialogService)',
      methods: [
        {
          name: 'open(content, options?)',
          type: 'BsDialogRef',
          description:
            "Opens a modal dialog with a component or template. Options: inputs, size ('sm', 'md', 'lg', 'xl' or 'fullscreen'), scrollable, backdrop, keyboard, animation, ariaLabelledBy, ariaLabel, class and injector. For a component, the ref also has componentInstance.",
        },
        {
          name: 'openDrawer(content, options?)',
          type: 'BsDialogRef',
          description:
            'Opens a drawer. Takes the same options without size and scrollable, plus placement and scroll.',
        },
        {
          name: 'dismissAll()',
          type: 'void',
          description: 'Dismisses every dialog and drawer it opened.',
        },
      ],
    },
    {
      name: 'BsDialogRef',
      selector: 'inject(BsDialogRef)',
      methods: [
        {
          name: 'close(value?)',
          type: 'void',
          description: 'Closes the dialog. result resolves with value.',
        },
        {
          name: 'dismiss()',
          type: 'void',
          description: 'Closes the dialog. result resolves with undefined.',
        },
        {
          name: 'result',
          type: 'Promise<R | undefined>',
          description: 'Resolves once the dialog is hidden and removed.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-dialog-page',
  imports: [DocsPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<docs-page [page]="page" />',
})
export default class DialogPage {
  protected readonly page = PAGE;
}
