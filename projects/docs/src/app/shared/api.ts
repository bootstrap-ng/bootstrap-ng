import { DocsHeading } from './heading';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DocsApiEntry, DocsApiTable } from './api-table';

export interface DocsApiDirective {
  /** Class name, such as `BsAlert`. */
  name: string;
  /** Selector, such as `[bsAlert]`. */
  selector?: string;
  /** Entry point to import functions from, such as `bootstrap-ng/calendar`. */
  importFrom?: string;
  exportAs?: string;
  inputs?: DocsApiEntry[];
  outputs?: DocsApiEntry[];
  methods?: DocsApiEntry[];
  functions?: DocsApiEntry[];
}

/** API reference for one or more directives, services or groups of functions. */
@Component({
  selector: 'docs-api',
  imports: [DocsApiTable, DocsHeading],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (directives().length) {
      <h2 class="mt-11" id="api" docsHeading>API</h2>
    }
    @for (directive of directives(); track directive.name) {
      <h3 class="mt-4" [id]="anchor(directive.name)" docsHeading>
        {{ directive.name }}
      </h3>
      <p>
        @if (directive.selector) {
          Selector: <code>{{ directive.selector }}</code>
        }
        @if (directive.importFrom) {
          Import from: <code>bootstrap-ng</code> or <code>{{ directive.importFrom }}</code>
        }
        @if (directive.exportAs) {
          · Exported as: <code>{{ directive.exportAs }}</code>
        }
      </p>
      @if (directive.inputs?.length) {
        <h4 class="fs-md mt-3">Inputs</h4>
        <docs-api-table [entries]="directive.inputs" [label]="directive.name + ' inputs'" />
      }
      @if (directive.outputs?.length) {
        <h4 class="fs-md mt-3">Outputs</h4>
        <docs-api-table
          [entries]="directive.outputs"
          [label]="directive.name + ' outputs'"
          [showDefault]="false" />
      }
      @if (directive.methods?.length) {
        <h4 class="fs-md mt-3">Methods</h4>
        <docs-api-table
          [entries]="directive.methods"
          [label]="directive.name + ' methods'"
          [showDefault]="false" />
      }
      @if (directive.functions?.length) {
        <h4 class="fs-md mt-3">Functions</h4>
        <docs-api-table
          [entries]="directive.functions"
          [label]="directive.name + ' functions'"
          [showDefault]="false" />
      }
    }
  `,
})
export class DocsApi {
  readonly directives = input.required<DocsApiDirective[]>();

  /** Anchor of a directive's heading, such as `api-bsalert` or `api-date-helpers`. */
  protected anchor(name: string): string {
    return `api-${name.toLowerCase().replaceAll(' ', '-')}`;
  }
}
