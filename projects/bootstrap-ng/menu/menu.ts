import {
  afterRenderEffect,
  booleanAttribute,
  Directive,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  OnDestroy,
  output,
  Provider,
  signal,
  untracked,
} from '@angular/core';
import {
  autoPosition,
  BsPlacement,
  configToken,
  provideConfig,
  uniqueId,
  waitForTransition,
} from 'bootstrap-ng/util';

const ITEM_SELECTOR = '.menu-item:not(.disabled):not(:disabled)';
const SUBMENU_CLOSE_DELAY = 100;

/** Visible, enabled items of `menu`, leaving out the items of its submenus. */
function menuItems(menu: HTMLElement): HTMLElement[] {
  return Array.from(menu.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
    (item) => item.closest('.menu') === menu && item.getClientRects().length > 0,
  );
}

type FocusTarget = 'first' | 'last';

/** Defaults for the inputs of menus. Inputs set on a component win over them. */
export interface BsMenuConfig {
  /** Where the menu appears next to its toggle. `start` and `end` follow the text direction. */
  placement: BsPlacement;
  /**
   * Which clicks close the menu: `true` any click, `'inside'` clicks in the menu,
   * `'outside'` clicks outside it, `false` none (use the toggle, Escape or `hide()`).
   */
  autoClose: boolean | 'inside' | 'outside';
  /** Opens the submenu on hover as well as on click and keyboard. */
  hover: boolean;
}

/** The defaults set with `provideBsMenuConfig()`. */
export const BS_MENU_CONFIG = configToken<BsMenuConfig>('BS_MENU_CONFIG');

/**
 * Sets defaults for the inputs of menus, for the whole app in `bootstrapApplication()`,
 * or for part of it in a component's `providers`.
 *
 * ```ts
 * providers: [provideBsMenuConfig({ autoClose: 'outside' })]
 * ```
 */
export function provideBsMenuConfig(config: Partial<BsMenuConfig>): Provider {
  return provideConfig(BS_MENU_CONFIG, config);
}

/**
 * Menu of actions or links, toggled by a `bsMenuToggle` button and positioned with
 * Floating UI. Bootstrap 6's replacement for dropdowns. Arrow keys, Home and End move
 * between `.menu-item` elements, and Escape closes the menu.
 *
 * ```html
 * <button bsButton [bsMenuToggle]="menu">Actions</button>
 * <div bsMenu #menu="bsMenu">
 *   <button class="menu-item" type="button">Edit</button>
 *   <button class="menu-item" type="button">Delete</button>
 * </div>
 * ```
 */
@Directive({
  selector: '[bsMenu]',
  exportAs: 'bsMenu',
  host: {
    class: 'menu',
    '[class.show]': 'isOpen()',
    '[id]': 'id()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class BsMenu implements OnDestroy {
  private readonly config = inject(BS_MENU_CONFIG);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);

  /** Whether the menu is open. Supports two-way binding with `[(open)]`. */
  // eslint-disable-next-line @angular-eslint/no-input-rename -- `open` state pattern, see AGENTS.md
  readonly openInput = input(false, { alias: 'open', transform: booleanAttribute });
  /** Emits the new open state when it changes from inside the menu. */
  readonly openChange = output<boolean>();
  private readonly openState = linkedSignal(() => this.openInput());
  /** Current open state. */
  readonly isOpen = this.openState.asReadonly();
  /** Where the menu appears next to its toggle. `start` and `end` follow the text direction. */
  readonly placement = input<BsPlacement>(this.config.placement ?? 'bottom-start');
  /**
   * Which clicks close the menu: `true` any click, `'inside'` clicks in the menu,
   * `'outside'` clicks outside it, `false` none (use the toggle, Escape or `hide()`).
   */
  readonly autoClose = input<boolean | 'inside' | 'outside'>(this.config.autoClose ?? true);
  /** Element id, used for `aria-controls` on the toggle. Generated when not set. */
  readonly id = input(uniqueId('bs-menu'));

  /** Emits after the menu is shown and its transition has finished. */
  readonly shown = output();
  /** Emits after the menu is hidden and its transition has finished. */
  readonly hidden = output();

  private toggleElement: HTMLElement | null = null;
  private stopPositioning: (() => void) | undefined;
  private pendingFocus: FocusTarget | null = null;

  private readonly onDocumentClick = (event: MouseEvent) => {
    const path = event.composedPath();
    if (this.toggleElement && path.includes(this.toggleElement)) {
      return;
    }
    const inside = path.includes(this.element);
    const autoClose = this.autoClose();
    if (
      autoClose === false ||
      (autoClose === 'inside' && !inside) ||
      (autoClose === 'outside' && inside)
    ) {
      return;
    }
    // Clicks on form controls and submenu triggers inside the menu keep it open.
    const target = event.target as HTMLElement;
    if (inside && target.closest('form, input, select, textarea, label, .submenu > .menu-item')) {
      return;
    }
    // An item chosen from the menu would take focus with it as the menu hides.
    const focusInside = inside && this.element.contains(this.document.activeElement);
    this.hide();
    if (focusInside) {
      this.toggleElement?.focus();
    }
  };

  private readonly onDocumentFocusin = (event: FocusEvent) => {
    const target = event.target as Node;
    const autoClose = this.autoClose();
    if (
      (autoClose === true || autoClose === 'outside') &&
      !this.element.contains(target) &&
      !this.toggleElement?.contains(target)
    ) {
      this.hide();
    }
  };

  constructor() {
    let rendered = false;
    afterRenderEffect(() => {
      const open = this.isOpen();
      if (open === rendered) {
        return;
      }
      rendered = open;
      if (open) {
        this.startPositioning();
        this.document.addEventListener('click', this.onDocumentClick);
        this.document.addEventListener('focusin', this.onDocumentFocusin);
        if (this.pendingFocus) {
          this.focusItem(this.pendingFocus);
          this.pendingFocus = null;
        }
      } else {
        this.removeDocumentListeners();
      }
      void waitForTransition(this.element).then(() => {
        if (this.isOpen() !== open) {
          return;
        }
        if (open) {
          this.shown.emit();
        } else {
          this.stopPositioning?.();
          this.stopPositioning = undefined;
          this.hidden.emit();
        }
      });
    });
  }

  /** Opens the menu. Pass `'first'` or `'last'` to move focus to that item. */
  show(focus?: FocusTarget): void {
    if (focus) {
      if (this.isOpen()) {
        this.focusItem(focus);
      } else {
        this.pendingFocus = focus;
      }
    }
    this.setOpen(true);
  }

  hide(): void {
    this.setOpen(false);
  }

  toggle(): void {
    this.setOpen(!this.isOpen());
  }

  /** @internal Called by `bsMenuToggle`. */
  registerToggle(element: HTMLElement | null): void {
    this.toggleElement = element;
  }

  ngOnDestroy(): void {
    this.removeDocumentListeners();
    this.stopPositioning?.();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.hide();
      this.toggleElement?.focus();
      return;
    }
    // Leave arrow keys to text fields inside the menu.
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable) {
      return;
    }
    const items = this.items();
    if (!items.length) {
      return;
    }
    const current = items.indexOf(target);
    let next: number;
    switch (event.key) {
      case 'ArrowDown':
        next = current === -1 ? 0 : (current + 1) % items.length;
        break;
      case 'ArrowUp':
        next = current === -1 ? items.length - 1 : (current - 1 + items.length) % items.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = items.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    items[next]?.focus();
  }

  private items(): HTMLElement[] {
    return menuItems(this.element);
  }

  private focusItem(which: FocusTarget): void {
    const items = this.items();
    (which === 'first' ? items[0] : items.at(-1))?.focus();
  }

  private startPositioning(): void {
    if (!this.toggleElement || this.stopPositioning) {
      return;
    }
    this.stopPositioning = autoPosition(this.toggleElement, this.element, () => ({
      placement: this.placement(),
      offset: 2,
    }));
  }

  private removeDocumentListeners(): void {
    this.document.removeEventListener('click', this.onDocumentClick);
    this.document.removeEventListener('focusin', this.onDocumentFocusin);
  }

  private setOpen(open: boolean): void {
    if (this.openState() !== open) {
      this.openState.set(open);
      this.openChange.emit(open);
    }
  }
}

/**
 * Makes an element open and close a `bsMenu`, and keeps `aria-expanded` and
 * `aria-controls` in sync. ArrowDown and ArrowUp open the menu and focus its first or
 * last item.
 */
@Directive({
  selector: '[bsMenuToggle]',
  host: {
    '[class.show]': 'menu().isOpen()',
    '[attr.aria-expanded]': 'menu().isOpen()',
    '[attr.aria-controls]': 'menu().id()',
    '[attr.role]': 'isButton ? null : "button"',
    '(click)': 'onClick($event)',
    '(keydown.space)': 'onSpace($event)',
    '(keydown)': 'onKeydown($event)',
  },
})
export class BsMenuToggle {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly isButton = this.element.tagName === 'BUTTON';

  /** The menu to toggle. */
  readonly menu = input.required<BsMenu>({ alias: 'bsMenuToggle' });

  constructor() {
    effect((onCleanup) => {
      const menu = this.menu();
      menu.registerToggle(this.element);
      onCleanup(() => menu.registerToggle(null));
    });
  }

  protected onClick(event: MouseEvent): void {
    if (!this.isButton) {
      event.preventDefault();
    }
    this.menu().toggle();
  }

  /** Links don't activate on Space, but `role="button"` promises they do. */
  protected onSpace(event: Event): void {
    if (!this.isButton) {
      event.preventDefault();
      this.menu().toggle();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.menu().show('first');
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.menu().show('last');
        break;
      case 'Escape':
        if (this.menu().isOpen()) {
          event.preventDefault();
          this.menu().hide();
        }
        break;
    }
  }
}

const TOP_LEVEL = {};
/** Top-level submenus of each menu, so opening one closes the others. */
const topLevelSubmenus = new WeakMap<object, Set<BsSubmenu>>();

/**
 * Nested menu inside a `bsMenu`. Put it on a wrapper holding a `.menu-item` trigger
 * followed by a `.menu` of items. The submenu opens on hover, on click, and with the
 * arrow key that points into it, and can be nested again.
 *
 * ```html
 * <div bsSubmenu>
 *   <button class="menu-item" type="button">Share</button>
 *   <div class="menu">
 *     <button class="menu-item" type="button">Email</button>
 *   </div>
 * </div>
 * ```
 */
@Directive({
  selector: '[bsSubmenu]',
  exportAs: 'bsSubmenu',
  host: {
    class: 'submenu',
    '[class.show]': 'isOpen()',
    '(click)': 'onClick($event)',
    '(mouseover)': 'onMouseover($event)',
    '(mouseleave)': 'scheduleClose()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class BsSubmenu implements OnDestroy {
  private readonly config = inject(BS_MENU_CONFIG);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly rootMenu = inject(BsMenu, { optional: true });
  private readonly parentSubmenu = inject(BsSubmenu, { optional: true, skipSelf: true });
  private readonly openState = signal(false);
  /** Whether the submenu is open. */
  readonly isOpen = this.openState.asReadonly();
  /** Opens the submenu on hover as well as on click and keyboard. */
  readonly hover = input(this.config.hover ?? true, { transform: booleanAttribute });

  private readonly children = new Set<BsSubmenu>();
  private stopPositioning: (() => void) | undefined;
  private closeTimer: ReturnType<typeof setTimeout> | undefined;
  /** Opened by hovering the trigger, so the click that usually follows keeps it open. */
  private openedByHover = false;

  constructor() {
    this.group().add(this);
    // Close with the menu or submenu this one sits in.
    effect(() => {
      if (this.rootMenu?.isOpen() === false || this.parentSubmenu?.isOpen() === false) {
        untracked(() => this.close());
      }
    });
    afterRenderEffect(() => {
      const trigger = this.trigger();
      if (trigger) {
        trigger.setAttribute('aria-haspopup', 'true');
        trigger.setAttribute('aria-expanded', String(this.isOpen()));
      }
    });
  }

  /** Opens the submenu. Pass `'first'` to also focus its first item. */
  open(focus?: 'first'): void {
    clearTimeout(this.closeTimer);
    const menu = this.menu();
    if (!menu) {
      return;
    }
    for (const sibling of this.siblings()) {
      sibling.close();
    }
    if (!this.openState()) {
      this.openState.set(true);
      menu.classList.add('show');
      // Stay transparent until Floating UI has placed the submenu.
      menu.style.opacity = '0';
      this.stopPositioning = autoPosition(this.element, menu, () => ({
        placement: 'end-start',
        offset: 0,
        fallbackPlacements: ['start-start', 'end-end', 'start-end'],
      }));
      requestAnimationFrame(() => (menu.style.opacity = ''));
    }
    if (focus) {
      menuItems(menu)[0]?.focus();
    }
  }

  /** Closes the submenu and any submenus inside it. */
  close(): void {
    clearTimeout(this.closeTimer);
    if (!this.openState()) {
      return;
    }
    for (const child of this.children) {
      child.close();
    }
    this.openedByHover = false;
    this.openState.set(false);
    this.menu()?.classList.remove('show');
    this.stopPositioning?.();
    this.stopPositioning = undefined;
  }

  ngOnDestroy(): void {
    this.close();
    this.group().delete(this);
  }

  protected onClick(event: MouseEvent): void {
    if (this.isTriggerEvent(event)) {
      if (this.openedByHover) {
        // A tap sends mouseover right before click, and a mouse click follows a hover.
        this.openedByHover = false;
      } else if (this.openState()) {
        this.close();
      } else {
        this.open();
      }
    }
  }

  protected onMouseover(event: MouseEvent): void {
    if (!this.hover()) {
      return;
    }
    clearTimeout(this.closeTimer);
    if (this.isTriggerEvent(event) && !this.openState()) {
      this.open();
      this.openedByHover = true;
    }
  }

  protected scheduleClose(): void {
    if (!this.hover()) {
      return;
    }
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => this.close(), SUBMENU_CLOSE_DELAY);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const rtl = getComputedStyle(this.element).direction === 'rtl';
    const into = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    const trigger = this.trigger();
    const menu = this.menu();
    if (!trigger || !menu) {
      return;
    }
    if (event.target === trigger) {
      if (event.key === into || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        this.open('first');
      }
      return;
    }
    const item = event.target as HTMLElement;
    if (item.closest('.menu') !== menu) {
      // The event comes from a nested submenu, which handles it.
      return;
    }
    const items = menuItems(menu);
    const current = items.indexOf(item);
    let next: number;
    switch (event.key) {
      case back:
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        this.close();
        trigger.focus();
        return;
      case 'ArrowDown':
        next = (current + 1) % items.length;
        break;
      case 'ArrowUp':
        next = (current - 1 + items.length) % items.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = items.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    items[next]?.focus();
  }

  private trigger(): HTMLElement | null {
    return this.element.querySelector<HTMLElement>(':scope > .menu-item');
  }

  private menu(): HTMLElement | null {
    return this.element.querySelector<HTMLElement>(':scope > .menu');
  }

  private isTriggerEvent(event: Event): boolean {
    const trigger = this.trigger();
    return !!trigger && trigger.contains(event.target as Node);
  }

  private siblings(): BsSubmenu[] {
    return [...this.group()].filter((submenu) => submenu !== this);
  }

  /** The submenus next to this one: children of the same submenu or top-level menu. */
  private group(): Set<BsSubmenu> {
    if (this.parentSubmenu) {
      return this.parentSubmenu.children;
    }
    const key = this.rootMenu ?? TOP_LEVEL;
    let group = topLevelSubmenus.get(key);
    if (!group) {
      group = new Set();
      topLevelSubmenus.set(key, group);
    }
    return group;
  }
}

/** The menu directives, to add to `imports` together. */
export const BS_MENU = [BsMenu, BsMenuToggle, BsSubmenu] as const;
