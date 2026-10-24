import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  inject,
  input,
  numberAttribute,
  Provider,
} from '@angular/core';
import { BsTheme, configToken, provideConfig, themeClass } from 'bootstrap-ng/util';

/**
 * Groups several `bs-progress` bars into one stacked bar.
 *
 * ```html
 * <div bsProgressStacked>
 *   <bs-progress [value]="15" aria-label="Segment one" />
 *   <bs-progress [value]="30" theme="success" aria-label="Segment two" />
 * </div>
 * ```
 */
@Directive({
  selector: '[bsProgressStacked]',
  host: { class: 'progress-stacked' },
})
export class BsProgressStacked {}

/** Defaults for the inputs of progress bars. Inputs set on a component win over them. */
export interface BsProgressConfig {
  /** Maximum value. */
  max: number;
  /** Adds stripes to the bar. */
  striped: boolean;
  /** Animates the stripes. Implies `striped`. */
  animated: boolean;
}

/** The defaults set with `provideBsProgressConfig()`. */
export const BS_PROGRESS_CONFIG = configToken<BsProgressConfig>('BS_PROGRESS_CONFIG');

/**
 * Sets defaults for the inputs of progress bars, for the whole app in `bootstrapApplication()`,
 * or for part of it in a component's `providers`.
 *
 * ```ts
 * providers: [provideBsProgressConfig({ striped: true })]
 * ```
 */
export function provideBsProgressConfig(config: Partial<BsProgressConfig>): Provider {
  return provideConfig(BS_PROGRESS_CONFIG, config);
}

/**
 * Progress bar. Content inside the element is shown as the bar's label.
 *
 * ```html
 * <bs-progress [value]="uploaded" [max]="total" aria-label="Upload progress">
 *   {{ uploaded }} of {{ total }}
 * </bs-progress>
 * ```
 */
@Component({
  selector: 'bs-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="progress-bar" [class]="barClasses()" [style.width.%]="stacked ? null : percent()">
      <ng-content />
    </div>
  `,
  host: {
    class: 'progress',
    role: 'progressbar',
    '[attr.aria-valuenow]': 'clampedValue()',
    '[attr.aria-valuemin]': 'min()',
    '[attr.aria-valuemax]': 'max()',
    '[attr.aria-valuetext]': 'valueText()',
    '[style.width.%]': 'stacked ? percent() : null',
  },
})
export class BsProgress {
  private readonly config = inject(BS_PROGRESS_CONFIG);
  protected readonly stacked = inject(BsProgressStacked, { optional: true }) !== null;

  /** Current value. */
  readonly value = input(0, { transform: numberAttribute });
  /** Minimum value. */
  readonly min = input(0, { transform: numberAttribute });
  /** Maximum value. */
  readonly max = input(this.config.max ?? 100, { transform: numberAttribute });
  /** Theme color of the bar. */
  readonly theme = input<BsTheme | null>(null);
  /** Adds stripes to the bar. */
  readonly striped = input(this.config.striped ?? false, { transform: booleanAttribute });
  /** Animates the stripes. Implies `striped`. */
  readonly animated = input(this.config.animated ?? false, { transform: booleanAttribute });
  /** Human-readable value for screen readers, such as "3 of 8 files". */
  readonly valueText = input<string | null>(null);

  /** Value clamped to the range. A value that is not a number counts as `min`. */
  readonly clampedValue = computed(() => {
    const value = this.value();
    const min = this.min();
    return Number.isNaN(value) ? min : Math.min(this.max(), Math.max(min, value));
  });

  /** Value as a percentage of the range, clamped between 0 and 100. */
  readonly percent = computed(() => {
    const range = this.max() - this.min();
    if (!Number.isFinite(range) || range <= 0) {
      return 0;
    }
    const percent = ((this.clampedValue() - this.min()) / range) * 100;
    return Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
  });

  protected readonly barClasses = computed(() =>
    [
      themeClass(this.theme()),
      this.striped() || this.animated() ? 'progress-bar-striped' : '',
      this.animated() ? 'progress-bar-animated' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );
}

/** The progress directives, to add to `imports` together. */
export const BS_PROGRESS = [BsProgress, BsProgressStacked] as const;
