import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface DocsApiEntry {
  name: string;
  type: string;
  default?: string;
  description: string;
}

/** Table of inputs, outputs or methods of a component. */
@Component({
  selector: 'docs-api-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Focusable so keyboard users can scroll the table on narrow screens. -->
    <div class="overflow-auto" tabindex="0" role="region" [attr.aria-label]="label()">
      <table class="table">
        <!-- Table cells paint the body background, so clear it to let the thead background show. -->
        <thead class="bg-secondary bg-20" [style.--bs-table-bg]="'transparent'">
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Type</th>
            @if (showDefault()) {
              <th scope="col">Default</th>
            }
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          @for (entry of entries(); track entry.name) {
            <tr>
              <td>
                <code>{{ entry.name }}</code>
              </td>
              <td>
                <code>{{ entry.type }}</code>
              </td>
              @if (showDefault()) {
                <td>
                  @if (entry.default) {
                    <code>{{ entry.default }}</code>
                  }
                </td>
              }
              <td>{{ entry.description }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DocsApiTable {
  readonly entries = input.required<DocsApiEntry[]>();
  readonly showDefault = input(true);
  /** Names the scrollable region, which screen readers announce when it gets focus. */
  readonly label = input.required<string>();
}
