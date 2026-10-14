import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { OverviewBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import basicTs from './examples/basic.ts' with { loader: 'text' };
import { OverviewSignalFormsExample } from './examples/signal-forms';
import signal_formsHtml from './examples/signal-forms.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import signal_formsTs from './examples/signal-forms.ts' with { loader: 'text' };
import { OverviewDisabledExample } from './examples/disabled';
import disabledHtml from './examples/disabled.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Forms',
  lead: 'Form controls, layout and validation that work with Angular forms.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/forms/overview/',
  sections: [
    {
      id: 'example',
      title: 'Example',
      description:
        'Put each control in a <code>bsFormField</code> with a <code>bsFormLabel</code>. The field gives the control an id, points the label to it and sets <code>aria-describedby</code> to its help text, so you don’t write ids yourself. Bind controls with Reactive Forms, <code>ngModel</code> or Signal Forms as usual.',
      example: OverviewBasicExample,
      html: basicHtml,
      ts: basicTs,
    },
    {
      id: 'signal-forms',
      title: 'Signal Forms',
      description:
        'Controls also follow <a href="https://angular.dev/guide/forms/signals/overview">Signal Forms</a> bound with <code>[formField]</code>. Once a control is touched, or <code>submit()</code> marks every field as touched, invalid controls get <code>.is-invalid</code>, <code>aria-invalid</code> and their feedback message.',
      example: OverviewSignalFormsExample,
      html: signal_formsHtml,
      ts: signal_formsTs,
    },
    {
      id: 'disabled-forms',
      title: 'Disabled forms',
      description:
        'Add <code>disabled</code> to a <code>&lt;fieldset&gt;</code> to disable every control inside it. With Reactive Forms, call <code>disable()</code> on the form group instead, because Angular sets the <code>disabled</code> property of each control.',
      example: OverviewDisabledExample,
      html: disabledHtml,
    },
  ],
  api: [],
};

@Component({
  selector: 'docs-overview-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class OverviewPage {
  protected readonly page = PAGE;
}
