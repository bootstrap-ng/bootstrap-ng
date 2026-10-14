import { booleanAttribute, Component, computed, input, linkedSignal } from '@angular/core';
import { BsTheme, themeClass } from '../util/theme';

/** Presence shown by a `bsAvatar` status indicator. */
export type BsAvatarStatus = 'online' | 'offline' | 'busy' | 'away';

/**
 * A user or entity as an image or initials. When the image fails to load, the
 * projected initials show instead.
 *
 * ```html
 * <span bsAvatar src="/users/ada.png" alt="Ada Lovelace" status="online">AL</span>
 * ```
 */
@Component({
  selector: 'span[bsAvatar], div[bsAvatar], a[bsAvatar]',
  host: {
    '[class]': 'classes()',
  },
  template: `
    @if (src() && !failed()) {
      <!-- eslint-disable-next-line @angular-eslint/template/prefer-ngsrc -- user images of unknown size, sized by CSS -->
      <img class="avatar-img" [src]="src()" [alt]="alt()" (error)="failed.set(true)" />
    } @else {
      <ng-content />
    }
    @if (status(); as status) {
      <span
        class="avatar-status"
        [class]="statusClass()"
        role="img"
        [attr.aria-label]="statusLabel() ?? defaultLabels[status]"></span>
    }
  `,
})
export class BsAvatar {
  /** Image URL. Leave it out to show the initials inside the element. */
  readonly src = input<string | null>(null);
  /** Text alternative of the image. */
  readonly alt = input('');
  /** Size of the avatar. */
  readonly size = input<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  /** Theme color for initials. */
  readonly theme = input<BsTheme | null>(null);
  /** Uses a subtle background for initials. */
  readonly subtle = input(false, { transform: booleanAttribute });
  /** Presence indicator. */
  readonly status = input<BsAvatarStatus | null>(null);
  /** Accessible label of the status. Defaults to the status name, such as "Online". */
  readonly statusLabel = input<string | null>(null);

  protected readonly failed = linkedSignal({ source: this.src, computation: () => false });
  protected readonly defaultLabels: Record<BsAvatarStatus, string> = {
    online: 'Online',
    offline: 'Offline',
    busy: 'Busy',
    away: 'Away',
  };

  protected readonly statusClass = computed(() => `status-${this.status() ?? ''}`);

  protected readonly classes = computed(() =>
    [
      'avatar',
      this.size() === 'md' ? '' : `avatar-${this.size()}`,
      this.subtle() ? 'avatar-subtle' : '',
      themeClass(this.theme()),
    ]
      .filter(Boolean)
      .join(' '),
  );
}
