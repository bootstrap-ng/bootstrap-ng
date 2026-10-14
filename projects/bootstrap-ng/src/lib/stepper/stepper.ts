import { computed, contentChildren, Directive, inject, input, model } from '@angular/core';
import { BsBreakpoint } from '../drawer/drawer';
import { BsTheme, themeClass } from '../util/theme';

/**
 * Steps of a process, such as a sign-up flow. Steps up to and including `step` are
 * marked done, and the current one gets `aria-current="step"`.
 *
 * ```html
 * <ol bsStepper [step]="1" horizontal>
 *   <li bsStepperItem>Create account</li>
 *   <li bsStepperItem>Confirm email</li>
 *   <li bsStepperItem>Finish</li>
 * </ol>
 * ```
 */
@Directive({
  selector: '[bsStepper]',
  exportAs: 'bsStepper',
  host: {
    '[class]': 'classes()',
  },
})
export class BsStepper {
  private readonly items = contentChildren(BsStepperItem);

  /** Index of the current step, starting at 0. Supports `[(step)]`. */
  readonly step = model(0);
  /**
   * Lays the steps out in a row: `true` always, or a breakpoint to start from. The
   * responsive variants use container queries, so wrap the stepper in `.contains-inline`.
   */
  readonly horizontal = input<boolean | BsBreakpoint | ''>(false);

  /** Number of steps. */
  readonly count = computed(() => this.items().length);

  protected readonly classes = computed(() => {
    const horizontal = this.horizontal();
    if (horizontal === true || horizontal === '') {
      return 'stepper stepper-horizontal';
    }
    return horizontal ? `stepper ${horizontal}:stepper-horizontal` : 'stepper';
  });

  /** Goes to the next step. */
  next(): void {
    this.step.update((step) => Math.max(0, Math.min(step + 1, this.count() - 1)));
  }

  /** Goes to the previous step. */
  previous(): void {
    this.step.update((step) => Math.max(step - 1, 0));
  }

  /** @internal */
  indexOf(item: BsStepperItem): number {
    return this.items().indexOf(item);
  }
}

/** Step of a `bsStepper`. */
@Directive({
  selector: '[bsStepperItem]',
  host: {
    class: 'stepper-item',
    '[class]': 'themeClass()',
    '[class.active]': 'isDone()',
    '[attr.aria-current]': 'isCurrent() ? "step" : null',
  },
})
export class BsStepperItem {
  private readonly stepper = inject(BsStepper);

  /** Theme color of the step. */
  readonly theme = input<BsTheme | null>(null);

  private readonly index = computed(() => this.stepper.indexOf(this));
  /** Whether this step is done or current. */
  readonly isDone = computed(() => this.index() <= this.stepper.step());
  /** Whether this is the current step. */
  readonly isCurrent = computed(() => this.index() === this.stepper.step());
  protected readonly themeClass = computed(() => themeClass(this.theme()));
}
