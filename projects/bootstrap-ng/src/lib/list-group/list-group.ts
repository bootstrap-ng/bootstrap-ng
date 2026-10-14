import { booleanAttribute, computed, Directive, ElementRef, inject, input } from '@angular/core';
import { BsBreakpoint } from '../drawer/drawer';
import { BsTheme, themeClass } from '../util/theme';

/**
 * List of items with Bootstrap's `.list-group` styles.
 *
 * ```html
 * <div bsListGroup>
 *   <a bsListGroupItem href="/inbox" active>Inbox</a>
 *   <a bsListGroupItem href="/sent">Sent</a>
 * </div>
 * ```
 */
@Directive({
  selector: '[bsListGroup]',
  host: {
    '[class]': 'classes()',
  },
})
export class BsListGroup {
  /** Removes the outer borders and rounded corners, for use inside a card. */
  readonly flush = input(false, { transform: booleanAttribute });
  /** Numbers the items. Use it on an `<ol>`. */
  readonly numbered = input(false, { transform: booleanAttribute });
  /**
   * Lays the items out in a row: `true` always, or a breakpoint to start from. The
   * responsive variants use container queries, so wrap the list in `.contains-inline`.
   */
  readonly horizontal = input<boolean | BsBreakpoint | ''>(false);

  protected readonly classes = computed(() => {
    const horizontal = this.horizontal();
    return [
      'list-group',
      this.flush() ? 'list-group-flush' : '',
      this.numbered() ? 'list-group-numbered' : '',
      horizontal === true || horizontal === '' ? 'list-group-horizontal' : '',
      typeof horizontal === 'string' && horizontal ? `${horizontal}:list-group-horizontal` : '',
    ]
      .filter(Boolean)
      .join(' ');
  });
}

/**
 * Item of a `bsListGroup`. Links and buttons get the hover and focus styles of
 * `.list-group-item-action`.
 */
@Directive({
  selector: '[bsListGroupItem]',
  host: {
    class: 'list-group-item',
    '[class]': 'themeClass()',
    '[class.list-group-item-action]': 'isAction',
    '[class.active]': 'active()',
    '[class.disabled]': 'disabled()',
    '[attr.aria-current]': 'active() ? "true" : null',
    '[attr.aria-disabled]': 'disabled() && !isButton ? "true" : null',
    '[attr.disabled]': 'disabled() && isButton ? "" : null',
    '[attr.tabindex]': 'disabled() && !isButton && isAction ? "-1" : null',
  },
})
export class BsListGroupItem {
  private readonly tag = (inject(ElementRef).nativeElement as HTMLElement).tagName;
  protected readonly isButton = this.tag === 'BUTTON';
  protected readonly isAction = this.isButton || this.tag === 'A';

  /** Marks the item as the current selection. */
  readonly active = input(false, { transform: booleanAttribute });
  /** Disables the item. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Theme color of the item. */
  readonly theme = input<BsTheme | null>(null);

  protected readonly themeClass = computed(() => themeClass(this.theme()));
}
