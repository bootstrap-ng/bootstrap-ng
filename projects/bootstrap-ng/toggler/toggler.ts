import {
  afterNextRender,
  Directive,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

/**
 * Toggles a class or attribute on click, on the element itself or on `target`. Use it
 * for small interactions that would otherwise need a one-off click handler.
 *
 * ```html
 * <button type="button" bsButton bsToggler="bg-2" [target]="panel">Highlight</button>
 * <div #panel>…</div>
 * ```
 */
@Directive({
  selector: '[bsToggler]',
  exportAs: 'bsToggler',
  host: {
    '[attr.role]': 'isNative ? null : "button"',
    '[attr.tabindex]': 'isNative ? null : "0"',
    '[attr.aria-pressed]': 'hasPressed ? isOn() : null',
    '(click)': 'toggle()',
    '(keydown.enter)': 'onKey($event)',
    '(keydown.space)': 'onKey($event)',
  },
})
export class BsToggler {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly isNative = /^(BUTTON|A|INPUT|SUMMARY)$/.test(this.element.tagName);
  /** `aria-pressed` is only valid on buttons, so native links, inputs and summaries get none. */
  protected readonly hasPressed = !this.isNative || this.element.tagName === 'BUTTON';

  /** Class name, or attribute value when `attribute` is set, to toggle. */
  readonly value = input.required<string>({ alias: 'bsToggler' });
  /** Attribute to toggle. `'class'` toggles `value` in the class list. `id` is not allowed. */
  readonly attribute = input('class');
  /** Elements to toggle instead of this one. */
  readonly target = input<HTMLElement | readonly HTMLElement[] | null>(null);

  /** Whether the class or attribute is currently set on the (first) target. */
  readonly isOn = signal(false);
  /** Emits the new state after each toggle. */
  readonly toggled = output<boolean>();

  constructor() {
    afterNextRender(() => this.isOn.set(this.isSet(this.targets()[0])));
  }

  /** Toggles the class or attribute. */
  toggle(): void {
    const attribute = this.attribute();
    const value = this.value();
    if (attribute === 'id') {
      return;
    }
    for (const target of this.targets()) {
      if (attribute === 'class') {
        target.classList.toggle(value);
      } else if (target.getAttribute(attribute) === value) {
        target.removeAttribute(attribute);
      } else {
        target.setAttribute(attribute, value);
      }
    }
    const on = this.isSet(this.targets()[0]);
    this.isOn.set(on);
    this.toggled.emit(on);
  }

  protected onKey(event: Event): void {
    if (!this.isNative) {
      event.preventDefault();
      this.toggle();
    }
  }

  private targets(): HTMLElement[] {
    const target = this.target();
    if (!target) {
      return [this.element];
    }
    return isElementList(target) ? [...target] : [target];
  }

  private isSet(target: HTMLElement | undefined): boolean {
    if (!target) {
      return false;
    }
    return this.attribute() === 'class'
      ? target.classList.contains(this.value())
      : target.getAttribute(this.attribute()) === this.value();
  }
}

function isElementList(
  target: HTMLElement | readonly HTMLElement[],
): target is readonly HTMLElement[] {
  return Array.isArray(target);
}
