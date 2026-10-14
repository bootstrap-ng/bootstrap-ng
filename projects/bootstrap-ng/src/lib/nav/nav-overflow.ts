import {
  afterNextRender,
  ApplicationRef,
  Component,
  ComponentRef,
  createComponent,
  DestroyRef,
  Directive,
  DOCUMENT,
  effect,
  ElementRef,
  EnvironmentInjector,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { BsMenu, BsMenuToggle } from '../menu/menu';
import { BsBreakpoint } from '../drawer/drawer';

/** @internal The "More" item that holds the overflowing links of a `bsNavOverflow`. */
@Component({
  selector: 'li[bsNavOverflowMore]',
  imports: [BsMenu, BsMenuToggle],
  host: { class: 'nav-item nav-overflow-item' },
  template: `
    <button
      type="button"
      class="nav-link nav-overflow-toggle"
      [bsMenuToggle]="menu"
      [attr.aria-label]="text() ? null : label()">
      @if (iconEnd()) {
        @if (text()) {
          <span class="nav-overflow-text">{{ text() }}</span>
        }
      }
      <span class="nav-overflow-icon" aria-hidden="true">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path
            d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
        </svg>
      </span>
      @if (!iconEnd()) {
        @if (text()) {
          <span class="nav-overflow-text">{{ text() }}</span>
        }
      }
    </button>
    <div bsMenu #menu="bsMenu" class="nav-overflow-menu" placement="bottom-end"></div>
  `,
})
export class BsNavOverflowMore {
  readonly text = signal('More');
  readonly label = signal('More');
  readonly iconEnd = signal(false);
  readonly menu = viewChild.required(BsMenu);
  readonly menuElement = viewChild.required(BsMenu, { read: ElementRef });
}

/**
 * Moves the links of a `.nav` that do not fit into a "More" menu (the Priority+
 * pattern). Put it on a wrapper around the `.nav`: the wrapper's width decides what
 * fits. Add `.nav-overflow-keep` to items that must stay visible. The menu shows copies
 * of the links; choosing one clicks the original, so `routerLink` and click handlers
 * keep working.
 *
 * ```html
 * <div bsNavOverflow>
 *   <ul class="nav nav-pills">
 *     <li class="nav-item"><a class="nav-link" href="/">Home</a></li>
 *     …
 *   </ul>
 * </div>
 * ```
 */
@Directive({
  selector: '[bsNavOverflow]',
  exportAs: 'bsNavOverflow',
  host: { class: 'nav-overflow nav-overflow-initialized' },
})
export class BsNavOverflow {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);

  /** Visible text of the "More" toggle. Empty shows only the icon. */
  readonly moreText = input('More');
  /** Accessible label of the toggle when `moreText` is empty. */
  readonly moreLabel = input('More');
  /** Puts the icon after the text. */
  readonly iconPlacement = input<'start' | 'end'>('start');
  /** Keeps at least this many items visible before moving the rest into the menu. */
  readonly threshold = input(0, { transform: numberAttribute });
  /** Moves every item into the menu below this width: a breakpoint or a number of pixels. */
  readonly collapseBelow = input<BsBreakpoint | number | null>(null);

  /** Number of items currently in the "More" menu. */
  readonly overflowCount = signal(0);
  /** Emits the number of items in the menu when it changes. */
  readonly overflowChange = output<number>();

  private more: ComponentRef<BsNavOverflowMore> | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);
    effect(() => {
      const more = this.more;
      const text = this.moreText();
      const label = this.moreLabel();
      const iconEnd = this.iconPlacement() === 'end';
      if (more) {
        more.instance.text.set(text);
        more.instance.label.set(label);
        more.instance.iconEnd.set(iconEnd);
      }
      this.threshold();
      this.collapseBelow();
      if (more) {
        queueMicrotask(() => this.update());
      }
    });

    afterNextRender(() => {
      const nav = this.nav();
      if (!nav) {
        return;
      }
      const host = this.document.createElement('li');
      nav.append(host);
      this.more = createComponent(BsNavOverflowMore, {
        environmentInjector: this.injector,
        hostElement: host,
      });
      this.more.instance.text.set(this.moreText());
      this.more.instance.label.set(this.moreLabel());
      this.more.instance.iconEnd.set(this.iconPlacement() === 'end');
      this.appRef.attachView(this.more.hostView);
      this.more.changeDetectorRef.detectChanges();

      const resize = new ResizeObserver(() => this.update());
      resize.observe(this.element);
      // Recalculate when items are added or removed, for example by an `@for`.
      const mutations = new MutationObserver(() => this.update());
      mutations.observe(nav, { childList: true });
      this.update();

      const more = this.more;
      destroyRef.onDestroy(() => {
        resize.disconnect();
        mutations.disconnect();
        this.restore();
        this.appRef.detachView(more.hostView);
        more.destroy();
        host.remove();
      });
    });
  }

  /** Measures again and moves items in or out of the menu. */
  update(): void {
    const more = this.more;
    const nav = this.nav();
    if (!more || !nav) {
      return;
    }
    const moreItem = more.location.nativeElement as HTMLElement;
    this.restore();
    const items = this.items();
    const candidates = items.filter((item) => !item.classList.contains('nav-overflow-keep'));
    const available = this.availableWidth();
    let overflowing: HTMLElement[] = [];

    if (available < this.collapseWidth()) {
      overflowing = candidates;
    } else {
      const gap = Number.parseFloat(getComputedStyle(nav).columnGap) || 0;
      // n items have n - 1 gaps between them.
      const allWidth =
        items.reduce((sum, item) => sum + item.offsetWidth + gap, 0) - (items.length ? gap : 0);
      if (allWidth > available + 1) {
        // Reserve room for "More" only when it is shown. With it after the items,
        // every item is followed by a gap.
        const keepWidth = items
          .filter((item) => item.classList.contains('nav-overflow-keep'))
          .reduce((sum, item) => sum + item.offsetWidth + gap, 0);
        const limit = available - keepWidth - moreItem.offsetWidth;
        let used = 0;
        for (const item of candidates) {
          used += item.offsetWidth + gap;
          if (used > limit + 1) {
            overflowing.push(item);
          }
        }
      }
      const threshold = this.threshold();
      if (items.length - overflowing.length < threshold && items.length > threshold) {
        overflowing = items
          .slice(threshold)
          .filter((item) => !item.classList.contains('nav-overflow-keep'));
      }
    }

    const menu = more.instance.menuElement().nativeElement as HTMLElement;
    for (const item of overflowing) {
      menu.append(...this.menuEntries(item));
      item.classList.add('d-none');
      item.dataset['bsNavOverflow'] = 'true';
    }
    moreItem.classList.toggle('d-none', overflowing.length === 0);
    if (overflowing.length !== this.overflowCount()) {
      this.overflowCount.set(overflowing.length);
      this.overflowChange.emit(overflowing.length);
    }
  }

  private nav(): HTMLElement | null {
    return this.element.querySelector<HTMLElement>('.nav');
  }

  private items(): HTMLElement[] {
    const nav = this.nav();
    return nav
      ? Array.from(nav.querySelectorAll<HTMLElement>(':scope > .nav-item')).filter(
          (item) => !item.classList.contains('nav-overflow-item'),
        )
      : [];
  }

  private availableWidth(): number {
    const style = getComputedStyle(this.element);
    const padding =
      (Number.parseFloat(style.paddingInlineStart) || 0) +
      (Number.parseFloat(style.paddingInlineEnd) || 0);
    return this.element.clientWidth - padding;
  }

  private collapseWidth(): number {
    const value = this.collapseBelow();
    if (typeof value === 'number') {
      return value;
    }
    if (!value) {
      return 0;
    }
    const css = getComputedStyle(this.document.documentElement).getPropertyValue(
      `--bs-breakpoint-${value}`,
    );
    return Number.parseFloat(css) || 0;
  }

  /** Menu entries for a nav item: a copy of its link, or its own menu's items under a header. */
  private menuEntries(item: HTMLElement): HTMLElement[] {
    const link = item.querySelector<HTMLElement>('.nav-link');
    if (!link) {
      return [];
    }
    const itemMenu = item.querySelector<HTMLElement>('.menu');
    if (itemMenu) {
      const header = this.document.createElement('div');
      header.className = 'menu-header';
      header.textContent = link.textContent.trim();
      const copies = Array.from(
        itemMenu.querySelectorAll<HTMLElement>('.menu-item:not(.submenu > .menu-item)'),
      ).map((original) => this.copy(original));
      return [header, ...copies];
    }
    return [this.copy(link)];
  }

  private copy(original: HTMLElement): HTMLElement {
    const copy = original.cloneNode(true) as HTMLElement;
    copy.className = 'menu-item';
    copy.classList.toggle('active', original.classList.contains('active'));
    const disabled = original.classList.contains('disabled') || original.hasAttribute('disabled');
    copy.classList.toggle('disabled', disabled);
    for (const name of ['id', 'aria-controls', 'aria-expanded', 'aria-haspopup', 'role']) {
      copy.removeAttribute(name);
    }
    copy.addEventListener('click', (event) => {
      event.preventDefault();
      if (!disabled) {
        this.more?.instance.menu().hide();
        original.click();
      }
    });
    return copy;
  }

  private restore(): void {
    const more = this.more;
    if (more) {
      (more.instance.menuElement().nativeElement as HTMLElement).replaceChildren();
    }
    for (const item of this.items()) {
      if (item.dataset['bsNavOverflow']) {
        item.classList.remove('d-none');
        delete item.dataset['bsNavOverflow'];
      }
    }
    (more?.location.nativeElement as HTMLElement | undefined)?.classList.remove('d-none');
  }
}
