import { computed, Directive, input, model } from '@angular/core';
import { BsTheme, themeClass } from 'bootstrap-ng/util';
import { BsControl } from './control';

export type BsCheckSize = 'sm' | 'md' | 'lg';

/**
 * A Bootstrap checkbox. Bind it with `[formControl]`, `[(ngModel)]`, `[formField]` or
 * `[(checked)]` like any native checkbox.
 *
 * ```html
 * <div bsFormField>
 *   <input type="checkbox" bsCheck [formControl]="remember" />
 *   <label bsLabel>Remember me</label>
 * </div>
 * ```
 */
@Directive({
  selector: 'input[type=checkbox][bsCheck]',
  exportAs: 'bsCheck',
  hostDirectives: [{ directive: BsControl, inputs: ['id', 'validation'] }],
  host: {
    '[class]': 'classes()',
    '[indeterminate]': 'indeterminate()',
    '(change)': 'indeterminate.set(false)',
  },
})
export class BsCheck {
  /** Theme color of the checked checkbox. */
  readonly theme = input<BsTheme | null>(null);
  /** Size of the checkbox. */
  readonly size = input<BsCheckSize>('md');
  /**
   * Shows the indeterminate mark. The browser clears it when the user toggles the
   * checkbox. Supports two-way binding with `[(indeterminate)]`.
   */
  readonly indeterminate = model(false);

  protected readonly classes = computed(() =>
    ['check', themeClass(this.theme()), sizeClass('check', this.size())].filter(Boolean).join(' '),
  );
}

/**
 * A Bootstrap radio. Bind it with `[formControl]`, `formControlName`, `[(ngModel)]` or
 * `[formField]` like any native radio.
 *
 * ```html
 * <div bsFormField>
 *   <input type="radio" bsRadio value="standard" formControlName="shipping" />
 *   <label bsLabel>Standard</label>
 * </div>
 * ```
 */
@Directive({
  selector: 'input[type=radio][bsRadio]',
  exportAs: 'bsRadio',
  hostDirectives: [{ directive: BsControl, inputs: ['id', 'validation'] }],
  host: { '[class]': 'classes()' },
})
export class BsRadio {
  /** Theme color of the checked radio. */
  readonly theme = input<BsTheme | null>(null);
  /** Size of the radio. */
  readonly size = input<BsCheckSize>('md');

  protected readonly classes = computed(() =>
    ['radio', themeClass(this.theme()), sizeClass('radio', this.size())].filter(Boolean).join(' '),
  );
}

function sizeClass(base: string, size: BsCheckSize): string {
  return size === 'md' ? '' : `${base}-${size}`;
}
