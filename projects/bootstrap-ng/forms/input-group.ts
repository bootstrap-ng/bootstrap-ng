import { computed, Directive, input } from '@angular/core';

export type BsInputGroupSize = 'sm' | 'md' | 'lg';

/**
 * Attaches text, buttons or menus to either side of a form control. Size the whole
 * group with `size`; sizes on single elements inside aren't supported. Give buttons
 * `.input-group-btn`.
 *
 * ```html
 * <div bsInputGroup>
 *   <span bsInputGroupText>@</span>
 *   <input bsFormControl placeholder="Username" aria-label="Username" />
 * </div>
 * ```
 */
@Directive({
  selector: '[bsInputGroup]',
  host: { '[class]': 'classes()' },
})
export class BsInputGroup {
  /** Size of every control, text and button in the group. */
  readonly size = input<BsInputGroupSize>('md');

  protected readonly classes = computed(() => {
    const size = this.size();
    return size === 'md' ? 'input-group' : `input-group input-group-${size}`;
  });
}

/** Text or a checkbox or radio next to the control in a `bsInputGroup`. */
@Directive({
  selector: '[bsInputGroupText]',
  host: { class: 'input-group-text' },
})
export class BsInputGroupText {}
