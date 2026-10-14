import {
  afterEveryRender,
  afterNextRender,
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { BsTheme, themeClass } from '../util/theme';
import { BsControl } from './control';

interface RangeTick {
  ratio: number;
  label: string;
}

/**
 * Bootstrap's range: a `.form-range` wrapper around a `bsRange` range input. The
 * wrapper keeps `--bs-range-fill` in sync with the value, which Bootstrap's CSS uses
 * for the filled track. It can show a value bubble, and renders tick marks for the
 * options of a `<datalist>` linked with the input's `list` attribute. Set `theme` to
 * color the fill and thumb.
 *
 * ```html
 * <div bsRange bubble>
 *   <input type="range" bsRange min="0" max="100" [formControl]="volume" />
 * </div>
 * ```
 */
@Component({
  selector: 'div[bsRange]',
  exportAs: 'bsRange',
  template: `
    <ng-content />
    @if (bubble()) {
      <output class="form-range-bubble tooltip bs-tooltip-top show" aria-hidden="true">
        <div class="tooltip-arrow"></div>
        <div class="tooltip-inner">{{ text() }}</div>
      </output>
    }
    @if (ticks().length) {
      <div class="form-range-ticks" aria-hidden="true" [style.grid-template-columns]="columns()">
        @for (tick of ticks(); track $index) {
          <span class="form-range-tick" [style.grid-column-start]="$index + 2">
            @if (tick.label) {
              <span class="form-range-tick-label">{{ tick.label }}</span>
            }
          </span>
        }
      </div>
    }
  `,
  host: {
    class: 'form-range',
    '[class]': 'themeClass()',
    '[style.--bs-range-fill]': 'ratio()',
  },
})
export class BsRange {
  /** Shows a bubble with the value above the thumb. */
  readonly bubble = input(false, { transform: booleanAttribute });
  /** Formats the value in the bubble. */
  readonly formatter = input<(value: number) => string>(String);
  /** Theme color of the fill and thumb. Defaults to primary. */
  readonly theme = input<BsTheme | null>(null);

  /** Emits the numeric value when it changes. */
  readonly valueChange = output<number>();

  private initialized = false;
  private readonly min = signal(0);
  private readonly max = signal(100);
  /** Current numeric value of the input. */
  readonly value = signal(50);
  /** Tick marks from the input's `<datalist>`. */
  readonly ticks = signal<RangeTick[]>([]);

  protected readonly ratio = computed(() => {
    const span = this.max() - this.min();
    return span > 0 ? Math.min(Math.max((this.value() - this.min()) / span, 0), 1) : 0;
  });
  protected readonly themeClass = computed(() => themeClass(this.theme()));
  protected readonly text = computed(() => this.formatter()(this.value()));
  /** @internal The formatted value for screen readers, when a `formatter` is set. */
  readonly valueText = computed(() => (this.formatter() === String ? null : this.text()));
  protected readonly columns = computed(() => {
    const stops = [0, ...this.ticks().map((tick) => tick.ratio), 1];
    return stops
      .slice(1)
      .map((stop, index) => `${stop - (stops[index] ?? 0)}fr`)
      .join(' ');
  });

  /** Reads the value, `min`, `max` and `<datalist>` of the input. */
  update(input: HTMLInputElement): void {
    const min = input.min === '' ? 0 : Number.parseFloat(input.min);
    const max = input.max === '' ? 100 : Number.parseFloat(input.max);
    const value = Number.parseFloat(input.value);
    this.min.set(min);
    this.max.set(max);
    if (value !== this.value()) {
      this.value.set(value);
      if (this.initialized) {
        this.valueChange.emit(value);
      }
    }
    this.initialized = true;
    this.ticks.set(this.readTicks(input, min, max));
  }

  private readTicks(input: HTMLInputElement, min: number, max: number): RangeTick[] {
    const options = input.list ? Array.from(input.list.querySelectorAll('option')) : [];
    const span = max - min || 1;
    const ticks = options
      .map((option) => ({
        ratio: Math.min(Math.max((Number.parseFloat(option.value) - min) / span, 0), 1),
        label: option.label,
      }))
      .filter((tick) => !Number.isNaN(tick.ratio))
      .sort((a, b) => a.ratio - b.ratio);

    const current = this.ticks();
    const same =
      current.length === ticks.length &&
      current.every((tick, i) => tick.ratio === ticks[i]?.ratio && tick.label === ticks[i].label);
    return same ? current : ticks;
  }
}

/**
 * The `<input type="range">` inside a `bsRange` wrapper. Bind it with `[formControl]`,
 * `[(ngModel)]` or `[formField]` like any native range input.
 */
@Directive({
  selector: 'input[type=range][bsRange]',
  exportAs: 'bsRangeInput',
  hostDirectives: [{ directive: BsControl, inputs: ['id', 'validation'] }],
  host: {
    class: 'form-range-input',
    '[attr.aria-valuetext]': 'valueText()',
    '(input)': 'update()',
    '(change)': 'update()',
  },
})
export class BsRangeInput {
  private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private readonly range = inject(BsRange, { optional: true });
  protected readonly valueText = computed(() => this.range?.valueText() ?? null);

  constructor() {
    // Catches value, min and max bindings, and values written by Angular forms.
    afterEveryRender(() => this.update());

    const ngControl = inject(NgControl, { self: true, optional: true });
    if (ngControl) {
      const destroyRef = inject(DestroyRef);
      afterNextRender(() => {
        // Values set with `setValue()` reach the input without a render.
        const subscription = ngControl.valueChanges?.subscribe(() => this.update());
        destroyRef.onDestroy(() => subscription?.unsubscribe());
      });
    }
  }

  /** Syncs the wrapper with the input. Call it after changing the value from code. */
  update(): void {
    this.range?.update(this.element);
  }
}
