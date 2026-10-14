import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsScrollspy } from './scrollspy';

@Component({
  imports: [BsScrollspy],
  template: `
    <nav #toc class="nav">
      <a class="nav-link" href="#one">One</a>
      <a class="nav-link" href="#two">Two</a>
      <a class="nav-link" href="#three">Three</a>
    </nav>
    <div
      class="content"
      [bsScrollspy]="toc"
      (activate)="activated.push($event)"
      style="height: 200px; overflow-y: auto; position: relative">
      <section id="one" style="height: 300px">One</section>
      <section id="two" style="height: 300px">Two</section>
      <section id="three" style="height: 100px">Three</section>
    </div>
  `,
})
class Host {
  activated: string[] = [];
}

@Component({
  imports: [BsScrollspy],
  template: `
    <nav #a class="nav nav-a">
      <a class="nav-link parent" href="#top">Sections</a>
      <nav class="nav">
        <a class="nav-link" href="#first">First</a>
        <a class="nav-link" href="#second">Second</a>
      </nav>
    </nav>
    <nav #b class="nav nav-b">
      <a class="nav-link" href="#first">First</a>
      <a class="nav-link" href="#second">Second</a>
    </nav>
    @if (shown()) {
      <div
        [bsScrollspy]="useB() ? b : a"
        style="height: 200px; overflow-y: auto; position: relative">
        <section id="first" style="height: 300px">First</section>
        <section id="second" style="height: 300px">Second</section>
      </div>
    }
  `,
})
class SwitchHost {
  readonly shown = signal(true);
  readonly useB = signal(false);
}

@Component({
  imports: [BsScrollspy],
  template: `
    <nav #toc class="nav">
      <a class="nav-link" href="#px-one">One</a>
      <a class="nav-link" href="#px-two">Two</a>
      <a class="nav-link" href="#px-three">Three</a>
    </nav>
    <div
      class="content"
      [bsScrollspy]="toc"
      topMargin="100px"
      [style.height.px]="height()"
      style="overflow-y: auto; position: relative">
      <section id="px-one" style="height: 300px">One</section>
      <section id="px-two" style="height: 300px">Two</section>
      <section id="px-three" style="height: 300px">Three</section>
    </div>
  `,
})
class PixelHost {
  readonly height = signal(400);
}

describe('BsScrollspy', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const content = root.querySelector<HTMLElement>('.content')!;
    const link = (hash: string) => root.querySelector<HTMLElement>(`[href="#${hash}"]`)!;
    return { fixture, host: fixture.componentInstance, content, link };
  }

  it('activates the first section at the top', async () => {
    const { host, link } = await setup();
    await vi.waitFor(() => expect(link('one').classList).toContain('active'));
    expect(link('one').getAttribute('aria-current')).toBe('true');
    expect(host.activated).toEqual(['one']);
  });

  it('follows the scroll position and activates the last section at the bottom', async () => {
    const { host, content, link } = await setup();
    content.scrollTop = 320;
    await vi.waitFor(() => expect(link('two').classList).toContain('active'));
    expect(link('one').classList).not.toContain('active');
    expect(link('one').hasAttribute('aria-current')).toBe(false);
    content.scrollTop = content.scrollHeight;
    await vi.waitFor(() => expect(link('three').classList).toContain('active'));
    expect(host.activated.at(-1)).toBe('three');
  });

  it('scrolls to a section on click without leaving the page', async () => {
    const { content, link } = await setup();
    const href = location.href;
    link('two').click();
    await vi.waitFor(() => expect(content.scrollTop).toBeGreaterThan(250));
    expect(location.pathname).toBe(new URL(href).pathname);
    expect(location.hash).toBe('#two');
    expect(document.activeElement?.id).toBe('two');
    history.replaceState(null, '', href);
  });

  it('keeps a pixel top margin in place when the scroll area resizes', async () => {
    const fixture = TestBed.createComponent(PixelHost);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const content = root.querySelector<HTMLElement>('.content')!;
    const link = (hash: string) => root.querySelector<HTMLElement>(`[href="#${hash}"]`)!;
    await vi.waitFor(() => expect(link('px-one').classList).toContain('active'));

    fixture.componentInstance.height.set(200);
    await fixture.whenStable();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    // The second section's top is 80px down, above the 100px activation line.
    content.scrollTop = 220;
    await vi.waitFor(() => expect(link('px-two').classList).toContain('active'));
  });

  describe('cleanup', () => {
    async function setupSwitch() {
      const fixture = TestBed.createComponent(SwitchHost);
      await fixture.whenStable();
      const root: HTMLElement = fixture.nativeElement;
      const link = (nav: 'a' | 'b') =>
        root.querySelector<HTMLElement>(`.nav-${nav} [href="#first"]`)!;
      await vi.waitFor(() => expect(link('a').classList).toContain('active'));
      const parent = root.querySelector<HTMLElement>('.parent')!;
      expect(parent.classList).toContain('active');
      return { fixture, host: fixture.componentInstance, link, parent };
    }

    it('clears the active link when the nav changes', async () => {
      const { fixture, host, link, parent } = await setupSwitch();
      host.useB.set(true);
      await fixture.whenStable();
      await vi.waitFor(() => expect(link('b').classList).toContain('active'));
      for (const element of [link('a'), parent]) {
        expect(element.classList).not.toContain('active');
        expect(element.hasAttribute('aria-current')).toBe(false);
      }
    });

    it('clears the active link when destroyed', async () => {
      const { fixture, host, link, parent } = await setupSwitch();
      host.shown.set(false);
      await fixture.whenStable();
      for (const element of [link('a'), parent]) {
        expect(element.classList).not.toContain('active');
        expect(element.hasAttribute('aria-current')).toBe(false);
      }
    });
  });
});
