import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BsSpinnerType = 'border' | 'grow';

/**
 * Loading indicator. Set `label` to an empty string when the spinner is decorative,
 * for example next to visible "Loading" text.
 *
 * ```html
 * <bs-spinner />
 * <bs-spinner type="grow" size="sm" class="fg-primary" />
 * ```
 */
@Component({
  selector: 'bs-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (label()) {
      <span class="visually-hidden">{{ label() }}</span>
    }
  `,
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'label() ? "status" : null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
  },
})
export class BsSpinner {
  /** Spinner style. */
  readonly type = input<BsSpinnerType>('border');
  /** Spinner size. */
  readonly size = input<'sm' | 'md'>('md');
  /** Text for screen readers. */
  readonly label = input('Loading…');

  protected readonly classes = computed(
    () => `spinner-${this.type()}${this.size() === 'sm' ? ' spinner-sm' : ''}`,
  );
}
