import {
  afterNextRender,
  booleanAttribute,
  DestroyRef,
  Directive,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';

/**
 * Highlights the link in a navigation for the section scrolled into view. Put it on
 * the element that holds the sections, and pass the element holding the links. Each
 * link's `href` is `#` and the id of a section. The active link gets `.active` and
 * `aria-current="true"`, and so does the nav link or menu toggle it sits under.
 *
 * ```html
 * <nav #toc><a class="nav-link" href="#intro">Intro</a></nav>
 * <div [bsScrollspy]="toc"><section id="intro">…</section></div>
 * ```
 */
@Directive({
  selector: '[bsScrollspy]',
  exportAs: 'bsScrollspy',
})
export class BsScrollspy {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);

  /** The element holding the links. */
  readonly nav = input.required<HTMLElement>({ alias: 'bsScrollspy' });
  /**
   * Position of the activation line from the top of the scroll area, as a percentage or
   * in pixels (for example below a sticky header). The active section is the last one
   * whose top has passed it.
   */
  readonly topMargin = input('12%');
  /** Scrolls smoothly to a section when its link is clicked, unless the user prefers reduced motion. */
  readonly smoothScroll = input(false, { transform: booleanAttribute });

  /** Id of the active section. */
  readonly activeId = signal<string | null>(null);
  /** Emits the id of each section that becomes active. */
  readonly activate = output<string>();

  private sections: HTMLElement[] = [];
  private linkBySection = new Map<HTMLElement, HTMLElement>();
  private sectionByLink = new Map<HTMLElement, HTMLElement>();
  private readonly intersecting = new Set<Element>();
  private lastActive: HTMLElement | null = null;
  private activeLink: HTMLElement | null = null;
  /** The active link and the parent links marked with it. */
  private activeElements: HTMLElement[] = [];
  private currentNav: HTMLElement | null = null;
  private atBottom = false;
  private observer: IntersectionObserver | null = null;
  private sentinelObserver: IntersectionObserver | null = null;
  private sentinel: HTMLElement | null = null;
  /** Stops watching the scroll area's height, which a pixel `topMargin` depends on. */
  private stopResize: (() => void) | null = null;
  private rendered = false;

  private readonly onNavClick = (event: MouseEvent) => {
    const link = (event.target as Element).closest<HTMLElement>('[href]');
    const section = link && this.sectionByLink.get(link);
    if (!section) {
      return;
    }
    event.preventDefault();
    const smooth = this.smoothScroll() && !this.reducedMotion();
    section.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    const { pathname, search } = this.document.location;
    this.document.defaultView?.history.replaceState(null, '', `${pathname}${search}#${section.id}`);
    if (!section.hasAttribute('tabindex')) {
      section.setAttribute('tabindex', '-1');
    }
    section.focus({ preventScroll: true });
  };

  constructor() {
    effect((onCleanup) => {
      const nav = this.nav();
      this.topMargin();
      nav.addEventListener('click', this.onNavClick);
      onCleanup(() => nav.removeEventListener('click', this.onNavClick));
      if (nav !== this.currentNav) {
        // Unmark the links of the previous nav before collecting the new one's.
        this.clearActive();
        this.currentNav = nav;
      }
      if (this.rendered) {
        untracked(() => this.refresh());
      }
    });
    afterNextRender(() => {
      this.rendered = true;
      this.refresh();
    });
    inject(DestroyRef).onDestroy(() => {
      this.disconnect();
      this.clearActive();
    });
  }

  /** Finds the links and sections again, for example after sections were added. */
  refresh(): void {
    this.disconnect();
    this.collect();
    const root = this.scrollRoot();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.intersecting.add(entry.target);
          } else {
            this.intersecting.delete(entry.target);
          }
        }
        this.computeActive();
      },
      { root, rootMargin: this.rootMargin(root) },
    );
    this.sections.forEach((section) => observer.observe(section));
    this.observer = observer;
    this.watchResize(root);

    // A short last section never reaches the activation line, so activate it once
    // the end of the content scrolls into view.
    if (this.sections.length) {
      const sentinel = this.document.createElement('div');
      sentinel.setAttribute('aria-hidden', 'true');
      sentinel.style.cssText = 'position:relative;width:0;height:0;margin:0;padding:0;border:0';
      this.element.append(sentinel);
      this.sentinel = sentinel;
      this.sentinelObserver = new IntersectionObserver(
        (entries) => {
          const scroller = root ?? this.document.documentElement;
          this.atBottom =
            !!entries.at(-1)?.isIntersecting && scroller.scrollHeight > scroller.clientHeight;
          this.computeActive();
        },
        { root },
      );
      this.sentinelObserver.observe(sentinel);
    }
  }

  private collect(): void {
    this.sections = [];
    this.linkBySection = new Map();
    this.sectionByLink = new Map();
    for (const link of this.nav().querySelectorAll<HTMLElement>('[href]')) {
      const href = link.getAttribute('href') ?? '';
      const hash = href.slice(href.indexOf('#') + 1);
      if (!href.includes('#') || !hash || link.matches('.disabled, :disabled')) {
        continue;
      }
      const section = this.document.getElementById(decode(hash));
      if (!section || !this.element.contains(section)) {
        continue;
      }
      this.sectionByLink.set(link, section);
      this.linkBySection.set(section, link);
      if (!this.sections.includes(section)) {
        this.sections.push(section);
      }
    }
    this.sections.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  }

  private computeActive(): void {
    if (!this.sections.length) {
      return;
    }
    let active = this.atBottom ? this.sections.at(-1) : undefined;
    if (!this.atBottom) {
      for (const section of this.sections) {
        if (this.intersecting.has(section)) {
          active = section;
        }
      }
      active ??= this.lastActive ?? this.sections[0];
    }
    if (!active) {
      return;
    }
    this.lastActive = active;
    const link = this.linkBySection.get(active);
    if (!link || link === this.activeLink) {
      return;
    }
    this.clearActive();
    this.activeLink = link;
    this.activeElements = [link, ...this.parentLinks(link)];
    for (const element of this.activeElements) {
      element.classList.add('active');
      element.setAttribute('aria-current', 'true');
    }
    this.activeId.set(active.id);
    this.activate.emit(active.id);
  }

  /** The nav link or menu toggle that a nested link sits under. */
  private parentLinks(link: HTMLElement): HTMLElement[] {
    const parents: HTMLElement[] = [];
    const nav = this.nav();
    let group = link.parentElement?.closest<HTMLElement>('.nav, .list-group, .menu');
    while (group && nav.contains(group) && group !== nav) {
      const previous = group.previousElementSibling as HTMLElement | null;
      if (previous?.matches('.nav-link, .list-group-item, [aria-expanded]')) {
        parents.push(previous);
      }
      group = group.parentElement?.closest<HTMLElement>('.nav, .list-group, .menu');
    }
    return parents;
  }

  private clearActive(): void {
    for (const element of this.activeElements) {
      element.classList.remove('active');
      element.removeAttribute('aria-current');
    }
    this.activeElements = [];
    this.activeLink = null;
  }

  private scrollRoot(): HTMLElement | null {
    return getComputedStyle(this.element).overflowY === 'visible' ? null : this.element;
  }

  /**
   * A pixel `topMargin` becomes a percentage of the scroll area's height, so observe
   * again with a new margin when that height changes, as Bootstrap does.
   */
  private watchResize(root: HTMLElement | null): void {
    if (this.topMargin().endsWith('%')) {
      return;
    }
    const height = () => (root ?? this.document.documentElement).clientHeight;
    const measured = height();
    const onResize = () => {
      if (height() !== measured) {
        this.refresh();
      }
    };
    if (root) {
      const resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(root);
      this.stopResize = () => resizeObserver.disconnect();
    } else {
      const view = this.document.defaultView;
      view?.addEventListener('resize', onResize);
      this.stopResize = () => view?.removeEventListener('resize', onResize);
    }
  }

  private rootMargin(root: HTMLElement | null): string {
    const value = this.topMargin();
    let percent = Number.parseFloat(value) || 0;
    if (!value.endsWith('%')) {
      const height = root ? root.clientHeight : this.document.documentElement.clientHeight;
      percent = height ? (percent / height) * 100 : 12;
    }
    return `0px 0px -${Math.min(Math.max(100 - percent, 0), 100)}% 0px`;
  }

  private reducedMotion(): boolean {
    return (
      this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false
    );
  }

  private disconnect(): void {
    this.observer?.disconnect();
    this.sentinelObserver?.disconnect();
    this.sentinel?.remove();
    this.stopResize?.();
    this.observer = null;
    this.sentinelObserver = null;
    this.sentinel = null;
    this.stopResize = null;
    this.intersecting.clear();
    this.atBottom = false;
  }
}

function decode(hash: string): string {
  try {
    return decodeURIComponent(hash);
  } catch {
    return hash;
  }
}
