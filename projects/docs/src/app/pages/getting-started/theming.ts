import { DocsHeading } from '../../shared/heading';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsCode } from '../../shared/code';

@Component({
  selector: 'docs-theming',
  imports: [DocsCode, DocsHeading, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './theming.html',
})
export default class Theming {
  protected readonly themeInput = `<div bsAlert theme="success">…</div>
<button type="button" bsButton="outline" theme="danger">Delete</button>
<span bsBadge [theme]="status() === 'failed' ? 'danger' : 'secondary'">…</span>`;

  protected readonly themeType = `import { BsTheme } from 'bootstrap-ng';

readonly theme = input<BsTheme>('primary');`;

  protected readonly forceMode = `<!doctype html>
<html lang="en" data-bs-theme="dark">
  …
</html>`;

  protected readonly scopedMode = `<div data-bs-theme="dark" class="p-5 bg-body fg-body">
  <div class="card">…</div>
</div>`;

  protected readonly toggle = `import { Component, DOCUMENT, effect, inject, signal } from '@angular/core';
import { BsButton } from 'bootstrap-ng';

@Component({
  selector: 'app-color-mode',
  imports: [BsButton],
  template: \`
    <button type="button" bsButton="text" (click)="toggle()">
      {{ mode() === 'dark' ? 'Light mode' : 'Dark mode' }}
    </button>
  \`,
})
export class ColorMode {
  private readonly document = inject(DOCUMENT);
  protected readonly mode = signal<'light' | 'dark'>('light');

  constructor() {
    effect(() => this.document.documentElement.setAttribute('data-bs-theme', this.mode()));
  }

  protected toggle(): void {
    this.mode.update((mode) => (mode === 'dark' ? 'light' : 'dark'));
  }
}`;

  protected readonly inlineScript = `<script>
  (() => {
    let mode;
    try {
      mode = localStorage.getItem('color-mode');
    } catch {}
    if (mode === 'light' || mode === 'dark') {
      document.documentElement.setAttribute('data-bs-theme', mode);
    }
  })();
</script>`;

  protected readonly sass = `@use 'bootstrap/scss/bootstrap' with (
  $root-tokens: (
    --spacer: 1.5rem,
  ),
  $alert-tokens: (
    --alert-padding-x: 2rem,
    --alert-border-radius: 1rem,
  )
);`;

  protected readonly css = `.alert {
  --bs-alert-padding-x: 2rem;
  --bs-alert-border-radius: 1rem;
}`;

  protected readonly customTheme = `<button type="button" bsButton class="theme-brand">Upgrade</button>`;
}
