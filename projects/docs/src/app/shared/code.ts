import { Component, computed, inject, input, resource } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CODE_BLOCK_CLASS, DocsCodeLanguage, DocsHighlighter } from './highlighter';

/** A syntax-highlighted code block. Shows plain text until the highlighted HTML is ready. */
@Component({
  selector: 'docs-code',
  // Code is left out of the search index so result excerpts stay readable. The language labels
  // the code blocks in llms-full.txt.
  host: { class: 'd-block', 'data-pagefind-ignore': '', '[attr.data-language]': 'language()' },
  template: `
    @if (highlighted(); as html) {
      <div [innerHTML]="html"></div>
    } @else {
      <pre [class]="preClass"><code>{{ code() }}</code></pre>
    }
  `,
})
export class DocsCode {
  private readonly highlighter = inject(DocsHighlighter);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly preClass = CODE_BLOCK_CLASS;

  readonly code = input.required<string>();
  readonly language = input<DocsCodeLanguage>('angular-html');

  private readonly html = resource({
    params: () => ({ code: this.code(), lang: this.language() }),
    loader: ({ params }) => this.highlighter.highlight(params.code, params.lang),
  });

  // Shiki escapes the code and only adds spans with color styles, which Angular's sanitizer
  // would strip, so its output is trusted as is.
  protected readonly highlighted = computed<SafeHtml | null>(() => {
    const html = this.html.hasValue()
      ? this.html.value()
      : this.highlighter.cached(this.code(), this.language());
    return html ? this.sanitizer.bypassSecurityTrustHtml(html) : null;
  });
}
