import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { StepperBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import basicTs from './examples/basic.ts' with { loader: 'text' };
import { StepperResponsiveExample } from './examples/responsive';
import responsiveHtml from './examples/responsive.html' with { loader: 'text' };
import { StepperThemesExample } from './examples/themes';
import themesHtml from './examples/themes.html' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Stepper',
  lead: 'Steps of a process, such as a sign-up flow or checkout, laid out vertically or in a row.',
  bootstrapDocs: 'https://getbootstrap.com/docs/6.0/components/stepper/',
  sections: [
    {
      id: 'basic',
      title: 'Example',
      description:
        'Bind the current step with <code>[(step)]</code>, starting at 0. Steps up to and including it are marked done, and the current one gets <code>aria-current="step"</code>. <code>next()</code> and <code>previous()</code> move between steps.',
      example: StepperBasicExample,
      html: basicHtml,
      ts: basicTs,
    },
    {
      id: 'responsive',
      title: 'Vertical and responsive',
      description:
        'Steppers are vertical by default. Set <code>horizontal</code> to a breakpoint to lay them out in a row from there up; the responsive variants use container queries, so wrap the stepper in <code>.contains-inline</code>.',
      example: StepperResponsiveExample,
      html: responsiveHtml,
    },
    {
      id: 'themes',
      title: 'Themes',
      description: 'Set <code>theme</code> on a step to color it.',
      example: StepperThemesExample,
      html: themesHtml,
    },
  ],
  api: [
    {
      name: 'BsStepper',
      selector: '[bsStepper]',
      exportAs: 'bsStepper',
      inputs: [
        {
          name: 'step',
          type: 'number',
          default: '0',
          description: 'Index of the current step. Supports [(step)].',
        },
        {
          name: 'horizontal',
          type: "boolean | 'sm' | 'md' | 'lg' | 'xl' | '2xl'",
          default: 'false',
          description: 'Lays the steps out in a row, from a breakpoint up.',
        },
      ],
      outputs: [
        {
          name: 'stepChange',
          type: 'number',
          description: 'Emits the new step.',
        },
      ],
      methods: [
        {
          name: 'next()',
          type: 'void',
          description: 'Goes to the next step.',
        },
        {
          name: 'previous()',
          type: 'void',
          description: 'Goes to the previous step.',
        },
        {
          name: 'count',
          type: 'Signal<number>',
          description: 'Number of steps.',
        },
      ],
    },
    {
      name: 'BsStepperItem',
      selector: '[bsStepperItem]',
      inputs: [
        {
          name: 'theme',
          type: 'BsTheme | null',
          default: 'null',
          description: 'Theme color of the step.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-stepper-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class StepperPage {
  protected readonly page = PAGE;
}
