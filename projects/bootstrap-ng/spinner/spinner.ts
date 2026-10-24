import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  Provider,
} from '@angular/core';
import { configToken, provideConfig } from 'bootstrap-ng/util';

export type BsSpinnerType = 'border' | 'grow';

/** Defaults for the inputs of spinners. Inputs set on a component win over them. */
export interface BsSpinnerConfig {
  /** Spinner style. */
  type: BsSpinnerType;
  /** Text for screen readers. */
  label: string;
}

/** The defaults set with `provideBsSpinnerConfig()`. */
export const BS_SPINNER_CONFIG = configToken<BsSpinnerConfig>('BS_SPINNER_CONFIG');

/**
 * Sets defaults for the inputs of spinners, for the whole app in `bootstrapApplication()`,
 * or for part of it in a component's `providers`.
 *
 * ```ts
 * providers: [provideBsSpinnerConfig({ label: 'Chargement…' })]
 * ```
 */
export function provideBsSpinnerConfig(config: Partial<BsSpinnerConfig>): Provider {
  return provideConfig(BS_SPINNER_CONFIG, config);
}

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
  private readonly config = inject(BS_SPINNER_CONFIG);
  /** Spinner style. */
  readonly type = input<BsSpinnerType>(this.config.type ?? 'border');
  /** Spinner size. */
  readonly size = input<'sm' | 'md'>('md');
  /** Text for screen readers. */
  readonly label = input(this.config.label ?? 'Loading…');

  protected readonly classes = computed(
    () => `spinner-${this.type()}${this.size() === 'sm' ? ' spinner-sm' : ''}`,
  );
}
