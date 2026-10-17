import { DocsHeading } from './heading';
import { LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DocsApiEntry, DocsApiTable } from './api-table';

export interface DocsApiDirective {
  /** Class name, such as `BsAlert`. */
  name: string;
  /** Selector, such as `[bsAlert]`. */
  selector: string;
  exportAs?: string;
  inputs?: DocsApiEntry[];
  outputs?: DocsApiEntry[];
  methods?: DocsApiEntry[];
}

/** API reference for one or more directives. */
@Component({
  selector: 'docs-api',
  imports: [DocsApiTable, DocsHeading, LowerCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (directives().length) {
      <h2 class="mt-11" id="api" docsHeading>API</h2>
    }
    @for (directive of directives(); track directive.name) {
      <h3 class="mt-4" [id]="'api-' + (directive.name | lowercase)" docsHeading>
        {{ directive.name }}
      </h3>
      <p>
        Selector: <code>{{ directive.selector }}</code>
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
    }
  `,
})
export class DocsApi {
  readonly directives = input.required<DocsApiDirective[]>();
}
