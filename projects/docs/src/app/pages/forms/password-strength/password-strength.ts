import { Component } from '@angular/core';
import { DocsPage, DocsPageData } from '../../../shared/page';
import { PasswordStrengthBasicExample } from './examples/basic';
import basicHtml from './examples/basic.html' with { loader: 'text' };
import { PasswordStrengthTextExample } from './examples/text';
import textHtml from './examples/text.html' with { loader: 'text' };
import { PasswordStrengthBarExample } from './examples/bar';
import barHtml from './examples/bar.html' with { loader: 'text' };
import { PasswordStrengthFormsExample } from './examples/forms';
import formsHtml from './examples/forms.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import formsTs from './examples/forms.ts' with { loader: 'text' };
import { PasswordStrengthStaticExample } from './examples/static';
import staticHtml from './examples/static.html' with { loader: 'text' };
import { PasswordStrengthCriteriaExample } from './examples/criteria';
import criteriaHtml from './examples/criteria.html' with { loader: 'text' };
// @ts-expect-error The text loader returns the file's source, not the module.
import criteriaTs from './examples/criteria.ts' with { loader: 'text' };

const PAGE: DocsPageData = {
  title: 'Password strength',
  lead: 'Feedback on password strength, with a segmented meter or a bar that updates as people type.',
  bootstrapDocs: 'https://v6-dev--twbs-bootstrap.netlify.app/docs/6.0/forms/password-strength/',
  sections: [
    {
      id: 'segmented',
      title: 'Segmented',
      description:
        'Point a <code>bsStrength</code> meter at a password input with <code>[input]</code>. Its four segments fill as the password gets stronger. The meter has <code>role="meter"</code>, with the level as its value text.',
      example: PasswordStrengthBasicExample,
      html: basicHtml,
    },
    {
      id: 'with-text-feedback',
      title: 'With text feedback',
      description:
        'Add a <code>bsStrengthText</code> element to show the level in its color. Changes are announced to screen readers.',
      example: PasswordStrengthTextExample,
      html: textHtml,
    },
    {
      id: 'progress-bar',
      title: 'Progress bar',
      description: 'Set <code>variant="bar"</code> for a single bar that grows with the strength.',
      example: PasswordStrengthBarExample,
      html: barHtml,
    },
    {
      id: 'with-forms',
      title: 'With forms',
      description:
        'Pass the password with <code>[password]</code> instead, for example from a form control. Set <code>messages</code>, <code>minLength</code>, <code>weights</code> or <code>thresholds</code> to change the scoring, or a <code>scorer</code> function to replace it.',
      example: PasswordStrengthFormsExample,
      html: formsHtml,
      ts: formsTs,
    },
    {
      id: 'static-segmented',
      title: 'Static meters',
      description: 'Set the level on <code>bsStrength</code> for a static meter.',
      example: PasswordStrengthStaticExample,
      html: staticHtml,
    },
    {
      id: 'strength-criteria',
      title: 'Strength criteria',
      description:
        'By default a password earns a point for each of: the minimum length (8), 4 more characters, lowercase letters, uppercase letters, numbers, a special character, several special characters, and 16 or more characters. Scores up to 2 are weak, up to 4 fair, up to 6 good, and above that strong. <code>passwordScore()</code> is exported for your own checks.',
      example: PasswordStrengthCriteriaExample,
      html: criteriaHtml,
      ts: criteriaTs,
    },
  ],
  api: [
    {
      name: 'BsStrength',
      selector: 'div[bsStrength]',
      exportAs: 'bsStrength',
      inputs: [
        {
          name: 'bsStrength',
          type: "'weak' | 'fair' | 'good' | 'strong' | ''",
          default: "''",
          description: 'A fixed level, for a static meter.',
        },
        {
          name: 'variant',
          type: "'segments' | 'bar'",
          default: "'segments'",
          description: 'Four segments, or a single bar.',
        },
        {
          name: 'input',
          type: 'HTMLInputElement | null',
          default: 'null',
          description: 'Password input to score as the user types.',
        },
        {
          name: 'password',
          type: 'string | null',
          default: 'null',
          description: 'Password to score. Takes precedence over input.',
        },
        {
          name: 'minLength',
          type: 'number',
          default: '8',
          description: 'Minimum length that earns the first point.',
        },
        {
          name: 'weights',
          type: 'Partial<BsStrengthWeights>',
          default: '{}',
          description: 'Points per criterion. Set one to 0 to skip it.',
        },
        {
          name: 'thresholds',
          type: '[number, number, number]',
          default: '[2, 4, 6]',
          description: 'Highest scores for weak, fair and good.',
        },
        {
          name: 'scorer',
          type: '((password: string) => number) | null',
          default: 'null',
          description: 'Custom scoring that replaces the criteria.',
        },
        {
          name: 'messages',
          type: 'Partial<Record<BsStrengthLevel, string>>',
          default: 'Weak, Fair, Good, Strong',
          description: 'Text for each level.',
        },
        {
          name: 'aria-label',
          type: 'string',
          default: "'Password strength'",
          description: 'Accessible name of the meter.',
        },
      ],
      methods: [
        {
          name: 'strength',
          type: 'Signal<BsStrengthLevel | null>',
          description: 'The level, or null for an empty password.',
        },
        {
          name: 'score',
          type: 'Signal<number>',
          description: 'The password’s score.',
        },
        {
          name: 'message',
          type: 'Signal<string>',
          description: 'The message for the level.',
        },
      ],
    },
    {
      name: 'BsStrengthText',
      selector: '[bsStrengthText]',
      inputs: [
        {
          name: 'bsStrengthText',
          type: 'BsStrength',
          description: 'The meter to describe. Required.',
        },
      ],
    },
  ],
};

@Component({
  selector: 'docs-password-strength-page',
  imports: [DocsPage],
  template: '<docs-page [page]="page" />',
})
export default class PasswordStrengthPage {
  protected readonly page = PAGE;
}
