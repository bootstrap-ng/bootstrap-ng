import { computed, Directive, input } from '@angular/core';
import { BsTheme, themeClass } from 'bootstrap-ng/util';
import { BsCheckSize } from './check';
import { BsControl } from './control';

/**
 * The `.switch` wrapper around a switch's checkbox. Put a `bsSwitch` checkbox inside it.
 *
 * ```html
 * <div bsFormField>
 *   <div bsSwitch theme="success">
 *     <input type="checkbox" bsSwitch [formControl]="notifications" />
 *   </div>
 *   <label bsLabel>Enable notifications</label>
 * </div>
 * ```
 */
@Directive({
  selector: 'div[bsSwitch]',
  exportAs: 'bsSwitch',
  host: { '[class]': 'classes()' },
})
export class BsSwitch {
  /** Theme color of the checked switch. */
  readonly theme = input<BsTheme | null>(null);
  /** Size of the switch. */
  readonly size = input<BsCheckSize>('md');

  protected readonly classes = computed(() => {
    const size = this.size();
    return ['switch', themeClass(this.theme()), size === 'md' ? '' : `switch-${size}`]
      .filter(Boolean)
      .join(' ');
  });
}

/**
 * The checkbox inside a `bsSwitch` wrapper. Sets `role="switch"` and the native
 * `switch` attribute, which gives haptic feedback in browsers that support it.
 */
@Directive({
  selector: 'input[type=checkbox][bsSwitch]',
  exportAs: 'bsSwitchInput',
  hostDirectives: [{ directive: BsControl, inputs: ['id', 'validation'] }],
  host: { role: 'switch', switch: '' },
})
export class BsSwitchInput {}
