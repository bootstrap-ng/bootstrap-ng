import { isPlatformServer } from '@angular/common';
import { inject, makeStateKey, PLATFORM_ID, Service, StateKey, TransferState } from '@angular/core';
import type { HighlighterCore } from 'shiki/core';

/** Bootstrap utilities for the `<pre>` of a code block, highlighted or not. */
export const CODE_BLOCK_CLASS = 'm-0 p-5 overflow-auto fs-sm';

export type DocsCodeLanguage = 'angular-html' | 'angular-ts' | 'json' | 'scss' | 'shellscript';

/**
 * Highlights code with Shiki. Shiki loads on first use, so it stays out of the initial bundle.
 * Prerendered pages pass their highlighted code to the browser through `TransferState`, so the
 * first page needs no Shiki download and hydration keeps the highlighted markup.
 */
@Service()
export class DocsHighlighter {
  private readonly transferState = inject(TransferState);
  private readonly isServer = isPlatformServer(inject(PLATFORM_ID));
  private highlighter?: Promise<HighlighterCore>;

  /** Highlighted HTML for code the server already highlighted, if any. */
  cached(code: string, lang: DocsCodeLanguage): string | null {
    return this.transferState.get(stateKey(code, lang), null);
  }

  async highlight(code: string, lang: DocsCodeLanguage): Promise<string> {
    const cached = this.cached(code, lang);
    if (cached) {
      return cached;
    }
    const highlighter = await (this.highlighter ??= this.load());
    const html = highlighter.codeToHtml(code, {
      lang,
      themes: { light: 'github-light-default', dark: 'github-dark-default' },
      defaultColor: false,
      transformers: [
        {
          pre(node) {
            this.addClassToHast(node, CODE_BLOCK_CLASS);
          },
        },
      ],
    });
    if (this.isServer) {
      this.transferState.set(stateKey(code, lang), html);
    }
    return html;
  }

  private async load(): Promise<HighlighterCore> {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] = await Promise.all([
      import('shiki/core'),
      import('shiki/engine/javascript'),
    ]);
    return createHighlighterCore({
      engine: createJavaScriptRegexEngine(),
      themes: [
        import('shiki/themes/github-light-default.mjs'),
        import('shiki/themes/github-dark-default.mjs'),
      ],
      langs: [
        import('shiki/langs/angular-html.mjs'),
        import('shiki/langs/angular-ts.mjs'),
        import('shiki/langs/json.mjs'),
        import('shiki/langs/scss.mjs'),
        import('shiki/langs/shellscript.mjs'),
      ],
    });
  }
}

/** A short, stable key for a code block (djb2 hash of the language and code). */
function stateKey(code: string, lang: DocsCodeLanguage): StateKey<string> {
  let hash = 5381;
  for (const char of `${lang}\n${code}`) {
    hash = ((hash << 5) + hash + char.charCodeAt(0)) | 0;
  }
  return makeStateKey<string>(`shiki-${(hash >>> 0).toString(36)}`);
}
