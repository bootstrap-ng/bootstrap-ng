import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal, Type } from '@angular/core';
import { BsButton } from 'bootstrap-ng';
import { DocsCopyButton } from './copy-button';
import { DocsStackBlitzButton } from './stackblitz-button';
import { DocsCode } from './code';
import { DocsCodeLanguage } from './highlighter';

export interface DocsExampleSource {
  label: string;
  code: string;
  lang: DocsCodeLanguage;
}

/** Shows a live example component above its source code. */
@Component({
  selector: 'docs-example',
  imports: [NgComponentOutlet, BsButton, DocsCode, DocsCopyButton, DocsStackBlitzButton],
  host: {
    class: 'd-block mt-5 mb-9 border rounded-5 overflow-hidden',
    '(click)': 'ignoreEmptyLinks($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="docs-example-preview p-7" data-pagefind-ignore>
      <ng-container *ngComponentOutlet="component()" />
    </div>
    <div class="border-top bg-1">
      <div
        class="d-flex align-items-center justify-content-between py-1 px-4 border-bottom fs-sm"
        data-pagefind-ignore>
        @if (sources().length > 1) {
          <div class="d-flex gap-1" role="tablist" aria-label="Source files">
            @for (source of sources(); track source.label) {
              <button
                type="button"
                role="tab"
                class="border-0"
                bsButton="text"
                size="sm"
                [class.active]="$index === active()"
                [attr.aria-selected]="$index === active()"
                (click)="active.set($index)">
                {{ source.label }}
              </button>
            }
          </div>
        } @else {
          <span class="font-monospace text-uppercase fs-xs fg-3">{{ sources()[0]?.label }}</span>
        }
        <div class="d-flex gap-1">
          <docs-stackblitz-button [component]="component()" />
          <docs-copy-button [text]="code()" />
        </div>
      </div>
      <docs-code [code]="code()" [language]="language()" />
    </div>
  `,
})
export class DocsExample {
  readonly component = input.required<Type<unknown>>();
  readonly html = input.required<string>();
  readonly ts = input<string | null>(null);

  protected readonly active = signal(0);

  /**
   * Stops placeholder `href="#"` links in examples from navigating. With a `<base href>`, `#`
   * resolves to the site root, so clicking one would leave the page for the home page.
   */
  protected ignoreEmptyLinks(event: MouseEvent): void {
    const link = event.target instanceof Element ? event.target.closest('a') : null;
    if (link?.getAttribute('href') === '#') {
      event.preventDefault();
    }
  }

  protected readonly sources = computed<DocsExampleSource[]>(() => {
    const sources: DocsExampleSource[] = [
      { label: 'HTML', code: this.html().trim(), lang: 'angular-html' },
    ];
    const ts = this.ts();
    if (ts) {
      sources.push({ label: 'TypeScript', code: ts.trim(), lang: 'angular-ts' });
    }
    return sources;
  });

  protected readonly source = computed(() => this.sources().at(this.active()));
  protected readonly code = computed(() => this.source()?.code ?? '');
  protected readonly language = computed(() => this.source()?.lang ?? 'angular-html');
}
