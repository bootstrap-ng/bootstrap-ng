import {
  booleanAttribute,
  computed,
  contentChildren,
  Directive,
  ElementRef,
  inject,
  input,
  model,
} from '@angular/core';
import { uniqueId } from '../util/id';

const NAV_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];

/**
 * Tab list built on Bootstrap's `.nav`. Add `nav-tabs`, `nav-pills` or `nav-underline`
 * for the style. Arrow keys, Home and End move between tabs, as in the WAI-ARIA tabs
 * pattern.
 *
 * ```html
 * <nav bsTabs #tabs="bsTabs" class="nav-tabs" [(active)]="tab" aria-label="Sections">
 *   <button bsTab="home">Home</button>
 *   <button bsTab="profile">Profile</button>
 * </nav>
 * <div [bsTabContent]="tabs">
 *   <div bsTabPane="home">…</div>
 *   <div bsTabPane="profile">…</div>
 * </div>
 * ```
 */
@Directive({
  selector: '[bsTabs]',
  exportAs: 'bsTabs',
  host: {
    class: 'nav',
    role: 'tablist',
    '[id]': 'id()',
    '[attr.aria-orientation]': 'vertical() ? "vertical" : null',
    '(keydown)': 'onKeydown($event)',
  },
})
export class BsTabs {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly tabs = contentChildren(BsTab, { descendants: true });

  /** Key of the active tab. Defaults to the first enabled tab. Supports `[(active)]`. */
  readonly active = model<string | undefined>(undefined);
  /** Marks the tab list as vertical for assistive technologies. */
  readonly vertical = input(false, { transform: booleanAttribute });
  /** Element id, used to build the ids of the tabs and panes. Generated when not set. */
  readonly id = input(uniqueId('bs-tabs'));

  /**
   * Key of the tab that is shown: `active` when an enabled tab has it, otherwise the
   * first enabled tab, so one tab always stays reachable with the keyboard.
   */
  readonly selected = computed((): string | undefined => {
    const active = this.active();
    const enabled = this.tabs().filter((tab) => !tab.isDisabled());
    return (enabled.find((tab) => tab.key() === active) ?? enabled.at(0))?.key();
  });

  /** Shows the tab with the given key. */
  select(key: string): void {
    this.active.set(key);
  }

  /** Id of the tab element for a key. */
  tabId(key: string): string {
    return `${this.id()}-tab-${key}`;
  }

  /** Id of the pane element for a key. */
  paneId(key: string): string {
    return `${this.id()}-pane-${key}`;
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!NAV_KEYS.includes(event.key) || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    const tabs = this.tabs().filter((tab) => !tab.isDisabled());
    const current = tabs.findIndex((tab) => tab.element === event.target);
    if (current === -1 || tabs.length === 0) {
      return;
    }
    event.preventDefault();

    const rtl = getComputedStyle(this.element).direction === 'rtl';
    let next: number;
    switch (event.key) {
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = tabs.length - 1;
        break;
      case 'ArrowDown':
      case rtl ? 'ArrowLeft' : 'ArrowRight':
        next = (current + 1) % tabs.length;
        break;
      default:
        next = (current - 1 + tabs.length) % tabs.length;
    }

    const target = tabs[next];
    if (!target) {
      return;
    }
    target.element.focus();
    this.select(target.key());
  }
}

/** One tab of a `bsTabs` list. Its value is the key that matches a `bsTabPane`. */
@Directive({
  selector: '[bsTab]',
  exportAs: 'bsTab',
  host: {
    class: 'nav-link',
    role: 'tab',
    '[class.active]': 'isActive()',
    '[id]': 'tabs.tabId(key())',
    '[attr.type]': 'isButton ? "button" : null',
    '[attr.aria-selected]': 'isActive()',
    '[attr.aria-controls]': 'tabs.paneId(key())',
    '[attr.tabindex]': 'isActive() ? null : -1',
    '[attr.disabled]': 'isButton && isDisabled() ? "" : null',
    '[attr.aria-disabled]': '!isButton && isDisabled() ? "true" : null',
    '[class.disabled]': '!isButton && isDisabled()',
    '(click)': 'onClick($event)',
  },
})
export class BsTab {
  /** @internal */
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly tabs = inject(BsTabs);

  protected readonly isButton = this.element.tagName === 'BUTTON';
  /** Markup that disables a link statically, as in Bootstrap's docs. */
  private readonly markedDisabled =
    !this.isButton &&
    (this.element.classList.contains('disabled') ||
      this.element.getAttribute('aria-disabled') === 'true');

  /** Key of the tab. */
  readonly key = input.required<string>({ alias: 'bsTab' });
  /**
   * Disables the tab: sets `disabled` on a button, or `aria-disabled` and `.disabled`
   * on a link. When the active tab is disabled, the first enabled tab is shown.
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Whether this tab is shown. */
  readonly isActive = computed(() => this.tabs.selected() === this.key());

  /** Whether this tab is disabled. */
  readonly isDisabled = computed(() => this.disabled() || this.markedDisabled);

  protected onClick(event: MouseEvent): void {
    if (this.element.tagName === 'A') {
      event.preventDefault();
    }
    if (!this.isDisabled()) {
      this.tabs.select(this.key());
    }
  }
}

/** Container of the panes of a `bsTabs` list. */
@Directive({
  selector: '[bsTabContent]',
  exportAs: 'bsTabContent',
  host: { class: 'tab-content' },
})
export class BsTabContent {
  /** The tab list whose panes this element holds. */
  readonly tabs = input.required<BsTabs>({ alias: 'bsTabContent' });
  /** Fades panes in when they are shown. */
  readonly animation = input(true, { transform: booleanAttribute });
}

/** Content shown when the `bsTab` with the same key is active. */
@Directive({
  selector: '[bsTabPane]',
  exportAs: 'bsTabPane',
  host: {
    class: 'tab-pane',
    role: 'tabpanel',
    tabindex: '0',
    '[class.active]': 'isActive()',
    '[class.tab-pane-instant]': '!content.animation()',
    '[id]': 'content.tabs().paneId(key())',
    '[attr.aria-labelledby]': 'content.tabs().tabId(key())',
  },
})
export class BsTabPane {
  protected readonly content = inject(BsTabContent);

  /** Key of the tab that shows this pane. */
  readonly key = input.required<string>({ alias: 'bsTabPane' });

  /** Whether this pane is shown. */
  readonly isActive = computed(() => this.content.tabs().selected() === this.key());
}
