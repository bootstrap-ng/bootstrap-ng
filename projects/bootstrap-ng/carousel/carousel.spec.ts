import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsLiveAnnouncer } from 'bootstrap-ng/util';
import {
  BsCarousel,
  BsCarouselIndicator,
  BsCarouselItem,
  BsCarouselNext,
  BsCarouselPlayPause,
  BsCarouselPrev,
} from './carousel';

@Component({
  imports: [
    BsCarousel,
    BsCarouselItem,
    BsCarouselPrev,
    BsCarouselNext,
    BsCarouselIndicator,
    BsCarouselPlayPause,
  ],
  template: `
    <div style="position: fixed; top: -1000px">
      <div
        bsCarousel
        #c="bsCarousel"
        aria-label="Test"
        [(active)]="active"
        [ends]="ends()"
        [autoplay]="autoplay()"
        [interval]="interval()">
        <div class="carousel-indicators">
          @for (i of [0, 1, 2]; track i) {
            <button
              type="button"
              [bsCarouselIndicator]="i"
              [attr.aria-label]="'Slide ' + (i + 1)"></button>
          }
        </div>
        <div class="carousel-inner">
          <div bsCarouselItem>One</div>
          <div bsCarouselItem>Two</div>
          <div bsCarouselItem aria-label="Last slide">Three</div>
        </div>
        <button type="button" class="prev" bsCarouselPrev>Previous</button>
        <button type="button" class="next" bsCarouselNext>Next</button>
        <button type="button" class="play" bsCarouselPlayPause><span>Toggle</span></button>
      </div>
    </div>
  `,
})
class Host {
  readonly active = signal(0);
  readonly ends = signal<'loop' | 'wrap' | 'stop'>('wrap');
  readonly autoplay = signal(false);
  readonly interval = signal(50);
}

@Component({
  imports: [BsCarousel, BsCarouselItem, BsCarouselPrev],
  template: `
    <div style="position: fixed; top: -1000px">
      <div bsCarousel aria-label="Dynamic" ends="stop" [(active)]="active">
        <div class="carousel-inner">
          @for (slide of slides(); track slide) {
            <div bsCarouselItem>{{ slide }}</div>
          }
        </div>
        <button type="button" class="prev" bsCarouselPrev>Previous</button>
      </div>
    </div>
  `,
})
class DynamicHost {
  readonly active = signal(0);
  readonly slides = signal(['One', 'Two', 'Three', 'Four', 'Five']);
}

// Bootstrap's CSS isn't loaded in unit tests, so lay the slides out as it does.
@Component({
  imports: [BsCarousel, BsCarouselItem],
  template: `
    <div style="position: fixed; top: -1000px; width: 100px" [attr.dir]="dir()">
      <div bsCarousel aria-label="Scroll" [(active)]="active" [keyboard]="keyboard()">
        <div
          class="carousel-inner"
          style="display: flex; overflow-x: auto; scroll-snap-type: x mandatory">
          @for (i of [0, 1, 2]; track i) {
            <div
              bsCarouselItem
              style="flex: 0 0 100%; min-width: 0; height: 10px; scroll-snap-align: start">
              <input style="width: 50px" [attr.aria-label]="'Field ' + i" />
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
class ScrollHost {
  readonly active = signal(0);
  readonly keyboard = signal(true);
  readonly dir = signal<'ltr' | 'rtl'>('ltr');
}

// Three slides visible out of five, like `--bs-carousel-items: 3`, so the last two
// slides can never reach the start of the viewport.
@Component({
  imports: [BsCarousel, BsCarouselItem, BsCarouselPrev, BsCarouselNext],
  template: `
    <div style="position: fixed; top: -1000px; width: 300px">
      <div bsCarousel #c="bsCarousel" aria-label="Multi" [(active)]="active" [ends]="ends()">
        <div class="carousel-inner" style="display: flex; overflow-x: auto">
          @for (i of [0, 1, 2, 3, 4]; track i) {
            <div bsCarouselItem style="flex: 0 0 100px; height: 10px">{{ i }}</div>
          }
        </div>
        <button type="button" class="prev" bsCarouselPrev>Previous</button>
        <button type="button" class="next" bsCarouselNext>Next</button>
      </div>
    </div>
  `,
})
class MultiHost {
  readonly active = signal(0);
  readonly ends = signal<'loop' | 'wrap' | 'stop'>('wrap');
}

describe('BsCarousel', () => {
  async function setup(init?: (host: Host) => void) {
    const fixture = TestBed.createComponent(Host);
    init?.(fixture.componentInstance);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement.querySelector('.carousel');
    const q = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
    const items = () => Array.from(root.querySelectorAll('.carousel-item'));
    const activeIndex = () => items().findIndex((item) => item.classList.contains('active'));
    return { fixture, host: fixture.componentInstance, root, q, items, activeIndex };
  }

  it('renders carousel semantics', async () => {
    const { root, items, q } = await setup();
    expect(root.classList).toContain('carousel');
    expect(root.getAttribute('aria-roledescription')).toBe('carousel');
    expect(items()[1].getAttribute('aria-roledescription')).toBe('slide');
    expect(items()[1].getAttribute('aria-label')).toBe('2 of 3');
    expect(q('.next').getAttribute('aria-controls')).toBe(root.id);
    expect(q('[data-bs-target]').getAttribute('data-bs-target')).toBe(`#${root.id}`);
  });

  it('keeps a label set on a slide', async () => {
    const { items } = await setup();
    expect(items()[2].getAttribute('aria-label')).toBe('Last slide');
    expect(items()[0].getAttribute('aria-label')).toBe('1 of 3');
  });

  it('clamps an active index past the last slide', async () => {
    const { fixture, host, q, activeIndex } = await setup((h) => {
      h.ends.set('stop');
      h.active.set(5);
    });
    expect(host.active()).toBe(2);
    expect(activeIndex()).toBe(2);
    q<HTMLButtonElement>('.prev').click();
    await fixture.whenStable();
    expect(host.active()).toBe(1);
  });

  it('clamps the active index when slides are removed', async () => {
    const fixture = TestBed.createComponent(DynamicHost);
    fixture.componentInstance.active.set(4);
    await fixture.whenStable();
    fixture.componentInstance.slides.set(['One', 'Two']);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    expect(fixture.componentInstance.active()).toBe(1);
    expect(root.querySelectorAll('.carousel-item')[1].classList).toContain('active');
    root.querySelector<HTMLButtonElement>('.prev')!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.active()).toBe(0);
  });

  it('moves with next and previous and wraps', async () => {
    const { fixture, host, q, activeIndex } = await setup();
    expect(activeIndex()).toBe(0);
    q<HTMLButtonElement>('.next').click();
    await fixture.whenStable();
    expect(host.active()).toBe(1);
    expect(activeIndex()).toBe(1);
    q<HTMLButtonElement>('.prev').click();
    q<HTMLButtonElement>('.prev').click();
    await fixture.whenStable();
    expect(host.active()).toBe(2);
  });

  it('loops onto a temporary copy of the first slide', async () => {
    const { fixture, host, root, q } = await setup((h) => {
      h.ends.set('loop');
      h.active.set(2);
    });
    const inner = q('.carousel-inner');
    // Give the slides a scroll-snap layout so there is something to scroll.
    inner.style.cssText = 'display: flex; overflow-x: auto; width: 200px';
    root.querySelectorAll<HTMLElement>('.carousel-item').forEach((item) => {
      item.style.cssText = 'flex: 0 0 100%';
    });
    q<HTMLButtonElement>('.next').click();
    const clone = inner.lastElementChild as HTMLElement;
    expect(clone.getAttribute('aria-hidden')).toBe('true');
    expect(clone.textContent).toBe('One');
    expect(host.active()).toBe(2);
    await vi.waitFor(() => expect(host.active()).toBe(0));
    await fixture.whenStable();
    expect(inner.querySelectorAll('.carousel-item').length).toBe(3);
    expect(Math.round(inner.scrollLeft)).toBe(0);
  });

  it('stops at the ends and disables the controls', async () => {
    const { fixture, host, q } = await setup((h) => h.ends.set('stop'));
    expect(q<HTMLButtonElement>('.prev').disabled).toBe(true);
    host.active.set(2);
    await fixture.whenStable();
    expect(q<HTMLButtonElement>('.next').disabled).toBe(true);
    expect(q<HTMLButtonElement>('.prev').disabled).toBe(false);
  });

  it('moves focus to the opposite control at an end', async () => {
    const { fixture, q } = await setup((h) => {
      h.ends.set('stop');
      h.active.set(1);
    });
    q<HTMLButtonElement>('.next').focus();
    q<HTMLButtonElement>('.next').click();
    await fixture.whenStable();
    expect(q<HTMLButtonElement>('.next').disabled).toBe(true);
    expect(document.activeElement).toBe(q('.prev'));
  });

  it('makes the slides focusable', async () => {
    const { q } = await setup();
    expect(q('.carousel-inner').tabIndex).toBe(0);
  });

  it('shows a slide from its indicator', async () => {
    const { fixture, host, root } = await setup();
    const indicators = root.querySelectorAll<HTMLButtonElement>('.carousel-indicators button');
    expect(indicators[0].getAttribute('aria-current')).toBe('true');
    expect(indicators[2].getAttribute('aria-label')).toBe('Slide 3');
    indicators[2].click();
    await fixture.whenStable();
    expect(host.active()).toBe(2);
    expect(indicators[2].classList).toContain('active');
    expect(indicators[0].hasAttribute('aria-current')).toBe(false);
  });

  it('moves with the arrow keys', async () => {
    const { fixture, host, root } = await setup();
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(host.active()).toBe(1);
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await fixture.whenStable();
    expect(host.active()).toBe(0);
  });

  it('announces the new slide, but not while autoplaying', async () => {
    const announce = vi.spyOn(TestBed.inject(BsLiveAnnouncer), 'announce');
    const { fixture, host, q } = await setup((h) => h.autoplay.set(true));
    await vi.waitFor(() => expect(host.active()).toBeGreaterThan(0));
    expect(announce).not.toHaveBeenCalled();
    // Keep autoplay on but stop it stepping again before the clicks below.
    host.interval.set(60_000);
    await fixture.whenStable();
    host.active.set(0);
    await fixture.whenStable();
    expect(announce).not.toHaveBeenCalled();
    q<HTMLButtonElement>('.next').click();
    await fixture.whenStable();
    expect(announce).toHaveBeenLastCalledWith('Slide 2 of 3');
    q<HTMLButtonElement>('.next').click();
    await fixture.whenStable();
    expect(announce).toHaveBeenLastCalledWith('Last slide');
  });

  it('autoplays and pauses from the play/pause button', async () => {
    const { fixture, host, root, q } = await setup((h) => h.autoplay.set(true));
    const toggle = q<HTMLButtonElement>('.play');
    expect(root.classList).toContain('carousel-playing');
    expect(toggle.getAttribute('aria-label')).toBe('Pause');
    await vi.waitFor(() => expect(host.active()).toBeGreaterThan(0));
    toggle.click();
    await fixture.whenStable();
    expect(toggle.classList).toContain('paused');
    expect(toggle.getAttribute('aria-label')).toBe('Play');
    expect(root.classList).not.toContain('carousel-playing');
    const paused = host.active();
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(host.active()).toBe(paused);
  });

  it('stops autoplay when the user navigates', async () => {
    const { fixture, q, root } = await setup((h) => h.autoplay.set(true));
    q<HTMLButtonElement>('.next').click();
    await fixture.whenStable();
    expect(root.classList).not.toContain('carousel-playing');
  });

  it('pauses autoplay while hovered and when the slides are touched', async () => {
    const { fixture, host, root, q } = await setup((h) => h.autoplay.set(true));
    root.dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    expect(root.classList).not.toContain('carousel-playing');
    const hovered = host.active();
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(host.active()).toBe(hovered);
    root.dispatchEvent(new MouseEvent('mouseleave'));
    await fixture.whenStable();
    expect(root.classList).toContain('carousel-playing');

    q('.carousel-item').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await fixture.whenStable();
    expect(q<HTMLButtonElement>('.play').getAttribute('aria-label')).toBe('Play');
  });

  it('pauses autoplay while focus is inside, except on the play/pause button', async () => {
    const outside = document.body.appendChild(document.createElement('button'));
    try {
      const { fixture, host, root, q } = await setup((h) => h.autoplay.set(true));
      q<HTMLButtonElement>('.play').focus();
      await fixture.whenStable();
      expect(root.classList).toContain('carousel-playing');

      q('.carousel-inner').focus();
      await fixture.whenStable();
      expect(root.classList).not.toContain('carousel-playing');
      const focused = host.active();
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(host.active()).toBe(focused);

      q<HTMLButtonElement>('.next').focus();
      await fixture.whenStable();
      expect(root.classList).not.toContain('carousel-playing');

      outside.focus();
      await fixture.whenStable();
      expect(root.classList).toContain('carousel-playing');
      expect(q<HTMLButtonElement>('.play').getAttribute('aria-label')).toBe('Pause');
    } finally {
      outside.remove();
    }
  });

  it('stops autoplay at the last slide when ends is stop', async () => {
    const { fixture, host, q } = await setup((h) => {
      h.ends.set('stop');
      h.active.set(1);
      h.autoplay.set(true);
    });
    await vi.waitFor(() => expect(host.active()).toBe(2));
    await vi.waitFor(() =>
      expect(q<HTMLButtonElement>('.play').getAttribute('aria-label')).toBe('Play'),
    );
    await fixture.whenStable();
    expect(host.active()).toBe(2);
  });

  describe('scrolling', () => {
    async function setupScroll(init?: (host: ScrollHost) => void) {
      const fixture = TestBed.createComponent(ScrollHost);
      init?.(fixture.componentInstance);
      await fixture.whenStable();
      const root: HTMLElement = fixture.nativeElement.querySelector('.carousel');
      const inner = root.querySelector<HTMLElement>('.carousel-inner')!;
      return { fixture, host: fixture.componentInstance, root, inner };
    }

    it('scrolls to the active slide', async () => {
      const { fixture, host, inner } = await setupScroll();
      host.active.set(2);
      await fixture.whenStable();
      await vi.waitFor(() => expect(inner.scrollLeft).toBe(200));
    });

    it('updates the active slide after the user scrolls', async () => {
      const { host, inner } = await setupScroll();
      inner.scrollTo({ left: 100, behavior: 'instant' });
      await vi.waitFor(() => expect(host.active()).toBe(1));
    });

    it('reverses the arrow keys in right-to-left layouts', async () => {
      const { fixture, host, root } = await setupScroll((h) => h.dir.set('rtl'));
      root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      await fixture.whenStable();
      expect(host.active()).toBe(1);
    });

    it('ignores the arrow keys in form fields and when keyboard is off', async () => {
      const { fixture, host, root } = await setupScroll();
      const field = root.querySelector('input')!;
      field.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await fixture.whenStable();
      expect(host.active()).toBe(0);

      host.keyboard.set(false);
      await fixture.whenStable();
      root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      await fixture.whenStable();
      expect(host.active()).toBe(0);
    });
  });

  describe('with several slides visible', () => {
    // A scroll syncs the active slide from the scroll position 100ms later. Wait for that
    // before navigating, or it could reset the slide just picked before it scrolls there.
    const scrollSynced = () =>
      new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 150)));

    async function setupMulti(init?: (host: MultiHost) => void) {
      const fixture = TestBed.createComponent(MultiHost);
      init?.(fixture.componentInstance);
      await fixture.whenStable();
      const root: HTMLElement = fixture.nativeElement.querySelector('.carousel');
      const inner = root.querySelector<HTMLElement>('.carousel-inner')!;
      const q = (selector: string) => root.querySelector<HTMLButtonElement>(selector)!;
      return { fixture, host: fixture.componentInstance, inner, q };
    }

    it('wraps from the last reachable slide', async () => {
      const { fixture, host, inner, q } = await setupMulti();
      q('.next').click();
      q('.next').click();
      await fixture.whenStable();
      expect(host.active()).toBe(2);
      await vi.waitFor(() => expect(inner.scrollLeft).toBe(200));
      await scrollSynced();
      q('.next').click();
      await fixture.whenStable();
      expect(host.active()).toBe(0);
    });

    it('clamps next, previous and indicators to the last reachable slide', async () => {
      const { fixture, host, inner, q } = await setupMulti((h) => h.ends.set('stop'));
      const carousel = fixture.debugElement.children[0].children[0].injector.get(BsCarousel);
      carousel.to(4);
      await fixture.whenStable();
      expect(host.active()).toBe(2);
      await vi.waitFor(() => expect(inner.scrollLeft).toBe(200));
      await scrollSynced();
      await fixture.whenStable();
      expect(q('.next').disabled).toBe(true);
      q('.prev').click();
      await fixture.whenStable();
      expect(host.active()).toBe(1);
      expect(q('.next').disabled).toBe(false);
    });
  });

  it('does not autoplay during server-side rendering', async () => {
    const global = globalThis as { ngServerMode?: boolean | undefined };
    const previous = global.ngServerMode;
    global.ngServerMode = true;
    try {
      const fixture = TestBed.createComponent(Host);
      fixture.componentInstance.autoplay.set(true);
      fixture.detectChanges();
      await new Promise((resolve) => setTimeout(resolve, 150));
      fixture.detectChanges();
      expect(fixture.componentInstance.active()).toBe(0);
    } finally {
      global.ngServerMode = previous;
    }
  });
});
