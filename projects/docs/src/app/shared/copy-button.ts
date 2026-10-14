import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { BsButton, BsTooltip } from 'bootstrap-ng';

/** An icon button that copies `text` to the clipboard and briefly shows a check mark. */
@Component({
  selector: 'docs-copy-button',
  imports: [BsButton, BsTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      bsButton="text"
      size="sm"
      icon
      [bsTooltip]="copied() ? 'Copied!' : 'Copy'"
      [attr.aria-label]="copied() ? 'Copied' : 'Copy'"
      (click)="copy()">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        @if (copied()) {
          <path
            d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
        } @else {
          <path
            fill-rule="evenodd"
            d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z" />
        }
      </svg>
    </button>
  `,
})
export class DocsCopyButton {
  readonly text = input.required<string>();

  protected readonly copied = signal(false);

  protected async copy(): Promise<void> {
    // `navigator.clipboard` is undefined outside secure contexts, despite its type.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    await navigator.clipboard?.writeText(this.text());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}
