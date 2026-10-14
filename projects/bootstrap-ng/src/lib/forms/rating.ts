import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  Directive,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  signal,
  TemplateRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BsTheme } from '../util/theme';
import { BsControl } from './control';
import { BsValueControl } from './value-control';

/** Size of a rating's stars. */
export type BsRatingSize = 'sm' | 'md' | 'lg';

/** Context of a custom `bsRatingStar` template. */
export interface BsRatingStarContext {
  /** How full the star is, from 0 (empty) to 1 (full). */
  $implicit: number;
  /** Zero-based position of the star. */
  index: number;
}

/**
 * A custom star for a `bsRating`, such as a heart or an icon font glyph. The template
 * gets how full the star is (0 to 1) and its index.
 *
 * ```html
 * <div bsRating [(value)]="rating">
 *   <ng-template bsRatingStar let-fill>{{ fill === 1 ? '♥' : '♡' }}</ng-template>
 * </div>
 * ```
 */
@Directive({ selector: 'ng-template[bsRatingStar]' })
export class BsRatingStar {
  readonly template = inject<TemplateRef<BsRatingStarContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _dir: BsRatingStar,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- only the type predicate uses it
    context: unknown,
  ): context is BsRatingStarContext {
    return true;
  }
}

const SIZES: Record<BsRatingSize, string> = { sm: 'fs-md', md: 'fs-xl', lg: 'fs-3xl' };

/**
 * A star rating. The value is a number from 0 (not rated) to `max`: bind it with
 * `[formControl]`, `[(ngModel)]`, `[formField]` or `[(value)]`.
 *
 * It is one `role="slider"` tab stop: arrow keys change the value by one star (or half a
 * star with `allowHalf`), Home and End go to the lowest and highest rating. Pointer
 * hover previews a rating and a click sets it. Set `readonly` to show a rating, such as
 * an average, without changing it; fractional values fill stars partially.
 *
 * ```html
 * <div bsRating aria-label="Rating" [formControl]="rating"></div>
 * ```
 */
@Component({
  selector: 'div[bsRating]',
  exportAs: 'bsRating',
  imports: [NgTemplateOutlet],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BsRating), multi: true }],
  hostDirectives: [{ directive: BsControl, inputs: ['id', 'validation'] }],
  template: `
    @for (fill of fills(); track $index) {
      <span class="position-relative d-inline-flex">
        @if (customStar(); as custom) {
          <ng-container
            [ngTemplateOutlet]="custom.template"
            [ngTemplateOutletContext]="{ $implicit: fill, index: $index }" />
        } @else {
          <svg
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
            aria-hidden="true"
            [class]="emptyClass()">
            <polygon [attr.points]="star" />
          </svg>
          @if (fill > 0) {
            <span
              class="position-absolute top-0 start-0 d-flex h-100 overflow-hidden"
              [class]="themeClass()"
              [style.width.%]="fill * 100">
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linejoin="round"
                aria-hidden="true">
                <polygon [attr.points]="star" />
              </svg>
            </span>
          }
        }
      </span>
    }
  `,
  host: {
    role: 'slider',
    class: 'd-inline-flex align-items-center gap-1 lh-1 user-select-none',
    '[class]': 'hostClasses()',
    '[attr.tabindex]': 'isDisabled() ? null : 0',
    'aria-valuemin': '0',
    '[attr.aria-valuemax]': 'max()',
    '[attr.aria-valuenow]': 'value()',
    '[attr.aria-valuetext]': 'valueText()(value(), max())',
    '[attr.aria-readonly]': "readonly() ? 'true' : null",
    '[attr.aria-disabled]': "isDisabled() ? 'true' : null",
    '[style.cursor]': "interactive() ? 'pointer' : null",
    '(keydown)': 'onKeydown($event)',
    '(pointermove)': 'onPointer($event)',
    '(click)': 'onClick($event)',
    '(pointerleave)': 'hovered.set(null)',
    '(focusout)': 'markTouched()',
  },
})
export class BsRating extends BsValueControl<number> {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly control = inject(BsControl, { self: true });

  /** The rating, from 0 (not rated) to `max`. Supports two-way binding with `[(value)]`. */
  readonly value = model(0);
  protected readonly emptyValue = 0;

  /** Number of stars. */
  readonly max = input(5, { transform: numberAttribute });
  /** Lets pointer and keyboard pick half stars. */
  readonly allowHalf = input(false, { transform: booleanAttribute });
  /** Shows the rating without letting it change. */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Lets the rating be cleared: click the current rating, or press Home, Delete or Backspace. */
  readonly resettable = input(false, { transform: booleanAttribute });
  /** Theme color of the filled stars. */
  readonly theme = input<BsTheme>('warning');
  /** Size of the stars. */
  readonly size = input<BsRatingSize>('md');
  /** Text screen readers announce for a value. Override it to translate. */
  readonly valueText = input<(value: number, max: number) => string>(
    (value, max) => `${String(value)} out of ${String(max)}`,
  );

  protected readonly customStar = contentChild(BsRatingStar);
  protected readonly hovered = signal<number | null>(null);
  protected readonly star =
    '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26';

  /** Whether the rating can be changed. */
  readonly interactive = computed(() => !this.readonly() && !this.isDisabled());

  private readonly step = computed(() => (this.allowHalf() ? 0.5 : 1));

  /** How full each star is, from 0 to 1, for the value or the hovered rating. */
  protected readonly fills = computed(() => {
    const shown = this.hovered() ?? this.value();
    return Array.from({ length: Math.max(0, this.max()) }, (_, i) =>
      Math.min(1, Math.max(0, shown - i)),
    );
  });

  protected readonly hostClasses = computed(() =>
    [SIZES[this.size()], this.isDisabled() ? 'opacity-50' : ''].filter(Boolean).join(' '),
  );
  protected readonly themeClass = computed(() => `fg-${this.theme()}`);
  protected readonly emptyClass = computed(() =>
    this.control.state() === 'invalid' ? 'fg-danger' : 'fg-3',
  );

  protected onPointer(event: PointerEvent): void {
    if (this.interactive()) {
      this.hovered.set(this.pointerValue(event));
    }
  }

  protected onClick(event: MouseEvent): void {
    const value = this.interactive() ? this.pointerValue(event) : null;
    if (value === null) {
      return;
    }
    this.select(this.resettable() && value === this.value() ? 0 : value);
    this.hovered.set(null);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.interactive()) {
      return;
    }
    const step = this.step();
    const value = this.value();
    const rtl = getComputedStyle(this.element).direction === 'rtl';
    const lowest = this.resettable() ? 0 : step;
    let next: number;
    switch (event.key) {
      case 'ArrowUp':
      case rtl ? 'ArrowLeft' : 'ArrowRight':
        next = Math.floor(value / step) * step + step;
        break;
      case 'ArrowDown':
      case rtl ? 'ArrowRight' : 'ArrowLeft':
        next = Math.ceil(value / step) * step - step;
        break;
      case 'Home':
        next = lowest;
        break;
      case 'End':
        next = this.max();
        break;
      case 'Delete':
      case 'Backspace':
        if (!this.resettable()) {
          return;
        }
        next = 0;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.select(Math.min(this.max(), Math.max(lowest, next)));
  }

  private select(value: number): void {
    if (value !== this.value()) {
      this.updateValue(value);
    }
  }

  /** The rating under the pointer: the star, or half of it with `allowHalf`. */
  private pointerValue(event: MouseEvent): number | null {
    const stars = Array.from(this.element.children);
    const index = stars.findIndex((star) => star.contains(event.target as Node));
    const star = stars.at(index);
    if (index < 0 || !star) {
      return this.hovered();
    }
    if (!this.allowHalf()) {
      return index + 1;
    }
    const { left, width } = star.getBoundingClientRect();
    const ratio = width ? (event.clientX - left) / width : 1;
    const rtl = getComputedStyle(this.element).direction === 'rtl';
    const firstHalf = rtl ? ratio > 0.5 : ratio <= 0.5;
    return index + (firstHalf ? 0.5 : 1);
  }
}
