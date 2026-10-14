import {
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChildren,
  DestroyRef,
  Directive,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  input,
  model,
  numberAttribute,
  signal,
  untracked,
} from '@angular/core';
import { BsLiveAnnouncer } from '../util/announcer';
import { uniqueId } from '../util/id';

const SYNC_DELAY = 100;
const LOOP_DURATION = 300;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Carousel built on CSS scroll snapping, as in Bootstrap 6: the browser handles
 * sliding, swiping and momentum, and the directive handles the active slide,
 * controls, indicators, keyboard and autoplay. Add `carousel-fade` to crossfade.
 *
 * ```html
 * <div bsCarousel [(active)]="slide" aria-label="Highlights">
 *   <div class="carousel-inner">
 *     <div bsCarouselItem>…</div>
 *     <div bsCarouselItem>…</div>
 *   </div>
 *   <button bsButton="base" icon bsCarouselPrev>…</button>
 *   <button bsButton="base" icon bsCarouselNext>…</button>
 * </div>
 * ```
 */
@Directive({
  selector: '[bsCarousel]',
  exportAs: 'bsCarousel',
  host: {
    class: 'carousel slide',
    role: 'group',
    'aria-roledescription': 'carousel',
    '[id]': 'id()',
    '[class.carousel-playing]': 'isCycling()',
    '[style.--bs-carousel-interval]': 'interval() + "ms"',
    '(keydown)': 'onKeydown($event)',
    '(mouseenter)': 'hovered.set(true)',
    '(mouseleave)': 'hovered.set(false)',
    '(focusin)': 'onFocusin($event)',
    '(focusout)': 'onFocusout($event)',
    '(pointerdown)': 'onPointerdown($event)',
  },
})
export class BsCarousel {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly items = contentChildren(BsCarouselItem, { descendants: true });

  /** Index of the active slide. Supports `[(active)]`. */
  readonly active = model(0);
  /** Starts cycling through the slides. The user can pause it with a `bsCarouselPlayPause`. */
  readonly autoplay = input(false, { transform: booleanAttribute });
  /** Time in milliseconds between slides while playing. */
  readonly interval = input(5000, { transform: numberAttribute });
  /** Pauses autoplay while the pointer is over the carousel. */
  readonly pauseOnHover = input(true, { transform: booleanAttribute });
  /**
   * What happens past the last or first slide. `'loop'` keeps sliding in the same
   * direction onto the other end, `'wrap'` jumps back, and `'stop'` stops. Layouts that
   * show more than one slide, and users who prefer reduced motion, get `'wrap'` for `'loop'`.
   */
  readonly ends = input<'loop' | 'wrap' | 'stop'>('loop');
  /** Moves between slides with the left and right arrow keys. */
  readonly keyboard = input(true, { transform: booleanAttribute });
  /** Element id. Generated when not set. */
  readonly id = input(uniqueId('bs-carousel'));

  /** Number of slides. */
  readonly count = computed(() => this.items().length);
  /**
   * Index of the last slide that can scroll to the start of the viewport. In layouts
   * that show several slides, the slides after it are already in view at the end.
   */
  readonly lastIndex = computed(() => {
    const last = this.count() - 1;
    return Math.min(this.reachable() ?? last, last);
  });
  /** Last reachable index measured from the layout, if the slides scroll. */
  private readonly reachable = signal<number | undefined>(undefined);
  /** Whether the first render is done, so autoplay never starts during server rendering. */
  private readonly rendered = signal(false);
  /** Whether autoplay is on. */
  readonly isPlaying = signal(false);
  protected readonly hovered = signal(false);
  private readonly pageVisible = signal(true);
  /** Whether focus is inside the carousel, other than on the play/pause control. */
  private readonly focused = signal(false);
  protected readonly isCycling = computed(
    () =>
      this.isPlaying() &&
      this.pageVisible() &&
      !this.focused() &&
      !(this.pauseOnHover() && this.hovered()),
  );

  private syncTimer: ReturnType<typeof setTimeout> | undefined;
  private looping = false;
  private loopFrame: number | undefined;

  constructor() {
    const destroyRef = inject(DestroyRef);
    const announcer = inject(BsLiveAnnouncer);
    effect(() => this.isPlaying.set(this.autoplay()));

    // Announce the new slide, except while autoplay would announce every few seconds,
    // as in the WAI-ARIA carousel pattern.
    let announced: number | undefined;
    effect(() => {
      const active = this.active();
      const item = this.items()[active];
      const previous = announced;
      announced = active;
      if (previous === undefined || previous === active || !item || untracked(this.isPlaying)) {
        return;
      }
      announcer.announce(untracked(item.announcement));
    });

    // Keep the active slide within the slides, for example when slides are removed.
    effect(() => {
      const count = this.count();
      const active = this.active();
      if (count > 0 && (active >= count || active < 0)) {
        this.active.set(Math.min(Math.max(active, 0), count - 1));
      }
    });

    effect((onCleanup) => {
      this.active();
      if (!this.rendered() || !this.isCycling()) {
        return;
      }
      const timer = setTimeout(() => this.step(1), this.interval());
      onCleanup(() => clearTimeout(timer));
    });

    let first = true;
    afterRenderEffect(() => {
      const index = this.active();
      this.items();
      this.measure();
      this.scrollTo(index, first);
      first = false;
    });

    afterNextRender(() => {
      this.rendered.set(true);
      const inner = this.inner();
      // Let keyboard users focus the slides to scroll them and use the arrow keys.
      if (inner && !inner.hasAttribute('tabindex')) {
        inner.tabIndex = 0;
      }
      const onScroll = () => {
        clearTimeout(this.syncTimer);
        this.syncTimer = setTimeout(() => this.syncFromScroll(), SYNC_DELAY);
      };
      const onVisibility = () => this.pageVisible.set(this.document.visibilityState !== 'hidden');
      inner?.addEventListener('scroll', onScroll, { passive: true });
      this.document.addEventListener('visibilitychange', onVisibility);
      const resizeObserver =
        inner && typeof ResizeObserver !== 'undefined'
          ? new ResizeObserver(() => this.measure())
          : undefined;
      if (inner) {
        resizeObserver?.observe(inner);
      }
      destroyRef.onDestroy(() => {
        resizeObserver?.disconnect();
        clearTimeout(this.syncTimer);
        cancelAnimationFrame(this.loopFrame ?? 0);
        inner?.removeEventListener('scroll', onScroll);
        this.document.removeEventListener('visibilitychange', onVisibility);
      });
    });
  }

  /** Shows the next slide. */
  next(): void {
    this.step(1);
  }

  /** Shows the previous slide. */
  prev(): void {
    this.step(-1);
  }

  /** Shows the slide at `index`. */
  to(index: number): void {
    if (this.count() > 0) {
      this.active.set(Math.min(Math.max(index, 0), this.lastIndex()));
    }
  }

  /** Starts autoplay. */
  play(): void {
    this.isPlaying.set(true);
  }

  /** Stops autoplay. */
  pause(): void {
    this.isPlaying.set(false);
  }

  /** Whether there is a slide before the active one, taking `ends` into account. */
  hasPrev(): boolean {
    return this.ends() !== 'stop' || this.active() > 0;
  }

  /** Whether there is a slide after the active one, taking `ends` into account. */
  hasNext(): boolean {
    return this.ends() !== 'stop' || this.active() < this.lastIndex();
  }

  /** @internal Navigation by the user stops autoplay for good, as in Bootstrap. */
  userNavigate(action: () => void): void {
    this.pause();
    action();
  }

  /**
   * @internal Moves focus from a previous or next control that just became
   * disabled at an end to the opposite control, so focus is not lost.
   */
  keepControlFocus(from: 'prev' | 'next'): void {
    const available = from === 'prev' ? this.hasPrev() : this.hasNext();
    if (!available) {
      const other = from === 'prev' ? '[bsCarouselNext]' : '[bsCarouselPrev]';
      this.element.querySelector<HTMLElement>(other)?.focus({ preventScroll: true });
    }
  }

  /** @internal */
  indexOf(item: BsCarouselItem): number {
    return this.items().indexOf(item);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.keyboard() || /^(INPUT|TEXTAREA|SELECT)$/.test((event.target as Element).tagName)) {
      return;
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }
    event.preventDefault();
    const forward = (event.key === 'ArrowRight') !== this.isRtl();
    this.userNavigate(() => (forward ? this.next() : this.prev()));
  }

  // Autoplay pauses while focus is inside, as in the WAI-ARIA carousel pattern. The
  // play/pause control is left out so it can still restart autoplay.
  protected onFocusin(event: FocusEvent): void {
    this.focused.set(!this.isPlayPause(event.target));
  }

  protected onFocusout(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (!(next instanceof Node) || !this.element.contains(next)) {
      this.focused.set(false);
    }
  }

  private isPlayPause(target: EventTarget | null): boolean {
    return target instanceof Element && target.closest('[bsCarouselPlayPause]') !== null;
  }

  protected onPointerdown(event: PointerEvent): void {
    // Dragging, swiping or tapping the slides is an explicit interaction.
    if (this.inner()?.contains(event.target as Node)) {
      this.pause();
    }
  }

  private step(delta: number): void {
    const count = this.count();
    if (count === 0) {
      return;
    }
    if (this.looping) {
      return;
    }
    // Slides past the last reachable one are already in view, so skip them.
    const last = this.lastIndex();
    let next = Math.min(this.active(), last) + delta;
    if (next < 0 || next > last) {
      if (this.ends() === 'stop') {
        this.pause();
        return;
      }
      next = next < 0 ? last : 0;
      if (this.ends() === 'loop' && this.canLoop()) {
        this.loopTo(next, delta > 0);
        return;
      }
    }
    this.active.set(next);
  }

  private canLoop(): boolean {
    const inner = this.inner();
    if (!inner || this.isFade() || this.count() < 2 || this.reducedMotion()) {
      return false;
    }
    const style = getComputedStyle(this.element);
    const value = (name: string) => Number.parseFloat(style.getPropertyValue(name)) || 0;
    return (
      (value('--bs-carousel-items') || 1) === 1 &&
      value('--bs-carousel-items-peek') === 0 &&
      !this.element.classList.contains('carousel-center') &&
      !this.element.classList.contains('carousel-auto')
    );
  }

  private reducedMotion(): boolean {
    return (
      this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false
    );
  }

  /**
   * Slides past an end onto a temporary copy of the destination slide, then jumps to
   * the real slide in the same frame, so the carousel never visibly scrolls backwards.
   */
  private loopTo(index: number, forward: boolean): void {
    const inner = this.inner();
    const items = this.items();
    const target = items[index]?.element;
    const current = items[this.active()]?.element;
    if (!inner || !target || !current) {
      this.active.set(index);
      return;
    }
    const clone = target.cloneNode(true) as HTMLElement;
    clone.classList.remove('active');
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
    clone.setAttribute('aria-hidden', 'true');
    clone.inert = true;

    this.looping = true;
    inner.style.scrollSnapType = 'none';
    if (forward) {
      inner.append(clone);
    } else {
      inner.prepend(clone);
      // Prepending pushes the slides along; stay on the current one.
      this.jumpBy(inner, this.offsetOf(inner, current));
    }

    const start = inner.scrollLeft;
    const distance = this.scrollDelta(inner, clone);
    let startTime: number | null = null;
    const frame = (now: number) => {
      startTime ??= now;
      const progress = Math.min((now - startTime) / LOOP_DURATION, 1);
      inner.scrollTo({ left: start + distance * easeInOutCubic(progress), behavior: 'instant' });
      if (progress < 1) {
        this.loopFrame = requestAnimationFrame(frame);
        return;
      }
      clone.remove();
      this.jumpBy(inner, this.offsetOf(inner, target));
      inner.style.scrollSnapType = '';
      this.looping = false;
      this.active.set(index);
    };
    this.loopFrame = requestAnimationFrame(frame);
  }

  private jumpBy(inner: HTMLElement, offset: number): void {
    const rtl = getComputedStyle(inner).direction === 'rtl';
    inner.scrollBy({ left: rtl ? -offset : offset, behavior: 'instant' });
  }

  private scrollDelta(inner: HTMLElement, element: HTMLElement): number {
    const offset = this.offsetOf(inner, element);
    return getComputedStyle(inner).direction === 'rtl' ? -offset : offset;
  }

  private inner(): HTMLElement | null {
    return this.element.querySelector<HTMLElement>('.carousel-inner');
  }

  private isFade(): boolean {
    return this.element.classList.contains('carousel-fade');
  }

  private isRtl(): boolean {
    return getComputedStyle(this.element).direction === 'rtl';
  }

  /** Distance in pixels from each slide's snap point to the viewport's snap point. */
  private offsets(inner: HTMLElement): number[] {
    return this.items().map(({ element }) => this.offsetOf(inner, element));
  }

  /** Distance in pixels from a slide's snap point to the viewport's snap point. */
  private offsetOf(inner: HTMLElement, element: HTMLElement): number {
    const style = getComputedStyle(inner);
    const rtl = style.direction === 'rtl';
    const box = inner.getBoundingClientRect();
    const padStart = Number.parseFloat(style.scrollPaddingInlineStart) || 0;
    const rect = element.getBoundingClientRect();
    if (getComputedStyle(element).scrollSnapAlign.includes('center')) {
      const offset = rect.left + rect.width / 2 - (box.left + box.width / 2);
      return rtl ? -offset : offset;
    }
    return rtl ? box.right - padStart - rect.right : rect.left - (box.left + padStart);
  }

  private scrollTo(index: number, instant: boolean): void {
    const inner = this.inner();
    if (!inner || this.isFade() || !this.items()[index]) {
      return;
    }
    const offset = this.offsets(inner)[index];
    if (offset === undefined || Math.abs(offset) < 1) {
      return;
    }
    const rtl = getComputedStyle(inner).direction === 'rtl';
    inner.scrollTo({
      left: inner.scrollLeft + (rtl ? -offset : offset),
      behavior: instant ? 'instant' : 'auto',
    });
  }

  /**
   * Finds the last slide that can scroll to the start of the viewport, from the
   * scroll range as in Bootstrap. Layouts that don't scroll keep every slide.
   */
  private measure(): void {
    const inner = this.inner();
    const max = inner ? inner.scrollWidth - inner.clientWidth : 0;
    if (!inner || this.isFade() || max <= 0) {
      this.reachable.set(undefined);
      return;
    }
    const position = Math.abs(inner.scrollLeft);
    const index = this.offsets(inner).findIndex((offset) => position + offset >= max - 1);
    this.reachable.set(index === -1 ? undefined : index);
  }

  private syncFromScroll(): void {
    const inner = this.inner();
    if (!inner || this.isFade() || this.looping) {
      return;
    }
    this.measure();
    const offsets = this.offsets(inner).map(Math.abs);
    const nearest = offsets.indexOf(Math.min(...offsets));
    if (nearest !== -1 && nearest !== this.active()) {
      this.active.set(nearest);
    }
  }
}

/** One slide of a `bsCarousel`. */
@Directive({
  selector: '[bsCarouselItem]',
  exportAs: 'bsCarouselItem',
  host: {
    class: 'carousel-item',
    role: 'group',
    'aria-roledescription': 'slide',
    '[class.active]': 'isActive()',
    '[attr.aria-label]': 'label() ?? generatedLabel()',
  },
})
export class BsCarouselItem {
  /** @internal */
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly carousel = inject(BsCarousel);

  protected readonly index = computed(() => this.carousel.indexOf(this));
  /** Whether this is the active slide. */
  readonly isActive = computed(() => this.carousel.active() === this.index());
  /** Accessible label. Defaults to "n of total". */
  // eslint-disable-next-line @angular-eslint/no-input-rename -- mirrors the native aria-label attribute
  readonly label = input<string | null>(null, { alias: 'aria-label' });
  protected readonly generatedLabel = computed(
    () => `${this.index() + 1} of ${this.carousel.count()}`,
  );
  /** @internal What screen readers hear when this slide becomes active. */
  readonly announcement = computed(() => this.label() ?? `Slide ${this.generatedLabel()}`);
}

/** Shows the previous slide of the parent `bsCarousel`. */
@Directive({
  selector: '[bsCarouselPrev]',
  host: {
    '[attr.aria-controls]': 'carousel.id()',
    '[attr.disabled]': 'isButton && !carousel.hasPrev() ? "" : null',
    '(click)': 'carousel.userNavigate(prev)',
  },
})
export class BsCarouselPrev {
  protected readonly carousel = inject(BsCarousel);
  protected readonly isButton =
    (inject(ElementRef).nativeElement as HTMLElement).tagName === 'BUTTON';
  protected readonly prev = () => {
    this.carousel.prev();
    this.carousel.keepControlFocus('prev');
  };
}

/** Shows the next slide of the parent `bsCarousel`. */
@Directive({
  selector: '[bsCarouselNext]',
  host: {
    '[attr.aria-controls]': 'carousel.id()',
    '[attr.disabled]': 'isButton && !carousel.hasNext() ? "" : null',
    '(click)': 'carousel.userNavigate(next)',
  },
})
export class BsCarouselNext {
  protected readonly carousel = inject(BsCarousel);
  protected readonly isButton =
    (inject(ElementRef).nativeElement as HTMLElement).tagName === 'BUTTON';
  protected readonly next = () => {
    this.carousel.next();
    this.carousel.keepControlFocus('next');
  };
}

/**
 * Indicator button that shows the slide at its index. Place it inside a
 * `.carousel-indicators` element in the carousel.
 */
@Directive({
  selector: '[bsCarouselIndicator]',
  host: {
    type: 'button',
    '[class.active]': 'isActive()',
    '[attr.data-bs-target]': '"#" + carousel.id()',
    '[attr.aria-current]': 'isActive() ? "true" : null',
    '[attr.aria-label]': 'label() ?? "Slide " + (index() + 1)',
    '(click)': 'onClick()',
  },
})
export class BsCarouselIndicator {
  protected readonly carousel = inject(BsCarousel);

  /** Index of the slide this indicator shows. */
  readonly index = input.required({ alias: 'bsCarouselIndicator', transform: numberAttribute });
  /** Accessible label. Defaults to "Slide n". */
  // eslint-disable-next-line @angular-eslint/no-input-rename -- mirrors the native aria-label attribute
  readonly label = input<string | null>(null, { alias: 'aria-label' });

  protected readonly isActive = computed(() => this.carousel.active() === this.index());

  protected onClick(): void {
    this.carousel.userNavigate(() => this.carousel.to(this.index()));
  }
}

/**
 * Button that pauses and resumes autoplay, as WCAG 2.2.2 requires for moving content.
 * Put `.carousel-icon-pause` and `.carousel-icon-play` inside it.
 */
@Directive({
  selector: '[bsCarouselPlayPause]',
  host: {
    class: 'carousel-control-play-pause',
    '[class.paused]': '!carousel.isPlaying()',
    '[attr.aria-controls]': 'carousel.id()',
    '[attr.aria-label]': 'carousel.isPlaying() ? pauseLabel() : playLabel()',
    '(click)': 'toggle()',
  },
})
export class BsCarouselPlayPause {
  protected readonly carousel = inject(BsCarousel);

  /** Accessible label while playing. */
  readonly pauseLabel = input('Pause');
  /** Accessible label while paused. */
  readonly playLabel = input('Play');

  protected toggle(): void {
    if (this.carousel.isPlaying()) {
      this.carousel.pause();
    } else {
      this.carousel.play();
    }
  }
}
