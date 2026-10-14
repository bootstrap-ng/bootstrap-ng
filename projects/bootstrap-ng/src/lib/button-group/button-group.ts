import { booleanAttribute, computed, Directive, ElementRef, inject, input } from '@angular/core';

const TOOLBAR_ITEMS = 'button, a[href], input, select, textarea, [tabindex]';

/**
 * Groups buttons on one line or, with `vertical`, in a column. Give the group an
 * `aria-label`.
 *
 * ```html
 * <div bsButtonGroup aria-label="Text alignment">
 *   <button type="button" bsButton="outline">Left</button>
 *   <button type="button" bsButton="outline">Right</button>
 * </div>
 * ```
 */
@Directive({
  selector: '[bsButtonGroup]',
  host: {
    role: 'group',
    '[class]': 'classes()',
  },
})
export class BsButtonGroup {
  /** Stacks the buttons vertically. */
  readonly vertical = input(false, { transform: booleanAttribute });
  /** Size of every button in the group. */
  readonly size = input<'xs' | 'sm' | 'md' | 'lg'>('md');

  protected readonly classes = computed(() =>
    [
      this.vertical() ? 'btn-group-vertical' : 'btn-group',
      this.size() === 'md' ? '' : `btn-group-${this.size()}`,
    ]
      .filter(Boolean)
      .join(' '),
  );
}

/**
 * Row of button groups with `role="toolbar"`. Give it an `aria-label`. The left and
 * right arrow keys, Home and End move focus between its controls, as screen reader
 * users expect in a toolbar. Text fields keep their arrow keys.
 */
@Directive({
  selector: '[bsButtonToolbar]',
  host: {
    class: 'btn-toolbar',
    role: 'toolbar',
    '(keydown)': 'onKeydown($event)',
  },
})
export class BsButtonToolbar {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) ||
      target.isContentEditable
    ) {
      return;
    }
    const items = Array.from(this.element.querySelectorAll<HTMLElement>(TOOLBAR_ITEMS)).filter(
      (item) =>
        item.tabIndex >= 0 && !item.matches(':disabled') && item.getClientRects().length > 0,
    );
    const current = items.indexOf(target);
    if (current === -1) {
      return;
    }
    const rtl = getComputedStyle(this.element).direction === 'rtl';
    let next: number;
    switch (event.key) {
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = items.length - 1;
        break;
      case rtl ? 'ArrowLeft' : 'ArrowRight':
        next = (current + 1) % items.length;
        break;
      case rtl ? 'ArrowRight' : 'ArrowLeft':
        next = (current - 1 + items.length) % items.length;
        break;
      default:
        return;
    }
    event.preventDefault();
    items[next]?.focus();
  }
}
