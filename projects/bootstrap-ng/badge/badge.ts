import { booleanAttribute, computed, Directive, input } from '@angular/core';
import { BsTheme, themeClass } from 'bootstrap-ng/util';

export type BsBadgeVariant = 'solid' | 'subtle' | 'outline';

/**
 * Small count or label.
 *
 * ```html
 * <span bsBadge theme="primary" variant="subtle">New</span>
 * ```
 */
@Directive({
  selector: '[bsBadge]',
  host: {
    class: 'badge',
    '[class]': 'classes()',
    '[class.rounded-pill]': 'pill()',
  },
})
export class BsBadge {
  /** Theme color of the badge. */
  readonly theme = input<BsTheme | null>(null);
  /** Visual style of the badge. */
  readonly variant = input<BsBadgeVariant>('solid');
  /** Gives the badge fully rounded ends. */
  readonly pill = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() => {
    const variant = this.variant();
    return [variant === 'solid' ? '' : `badge-${variant}`, themeClass(this.theme())]
      .filter(Boolean)
      .join(' ');
  });
}
