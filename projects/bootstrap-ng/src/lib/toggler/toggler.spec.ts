import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsToggler } from './toggler';

@Component({
  imports: [BsToggler],
  template: `
    <div class="self" bsToggler="highlight" (toggled)="last = $event">Click me</div>
    <button type="button" class="attr" bsToggler="true" attribute="hidden" [target]="panel">
      Toggle
    </button>
    <button type="button" class="many" bsToggler="bg-2" [target]="[a, b]">Both</button>
    <div #panel class="panel">Panel</div>
    <div #a class="a bg-2">A</div>
    <div #b class="b">B</div>
    <a href="#top" class="link" bsToggler="highlight">Link</a>
    <details><summary class="summary" bsToggler="highlight">Summary</summary></details>
  `,
})
class Host {
  last: boolean | null = null;
}

describe('BsToggler', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    return {
      fixture,
      host: fixture.componentInstance,
      q: (s: string) => root.querySelector<HTMLElement>(s)!,
    };
  }

  it('toggles a class on itself and is keyboard accessible', async () => {
    const { fixture, host, q } = await setup();
    const self = q('.self');
    expect(self.getAttribute('role')).toBe('button');
    expect(self.tabIndex).toBe(0);
    expect(self.getAttribute('aria-pressed')).toBe('false');
    self.click();
    await fixture.whenStable();
    expect(self.classList).toContain('highlight');
    expect(self.getAttribute('aria-pressed')).toBe('true');
    expect(host.last).toBe(true);
    self.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await fixture.whenStable();
    expect(self.classList).not.toContain('highlight');
    expect(host.last).toBe(false);
  });

  it('toggles an attribute on a target', async () => {
    const { fixture, q } = await setup();
    const button = q('.attr');
    expect(button.hasAttribute('role')).toBe(false);
    button.click();
    await fixture.whenStable();
    expect(q('.panel').getAttribute('hidden')).toBe('true');
    button.click();
    expect(q('.panel').hasAttribute('hidden')).toBe(false);
  });

  it('toggles every target', async () => {
    const { q } = await setup();
    q('.many').click();
    expect(q('.a').classList).not.toContain('bg-2');
    expect(q('.b').classList).toContain('bg-2');
  });

  it('only sets aria-pressed on buttons', async () => {
    const { q } = await setup();
    expect(q('.attr').getAttribute('aria-pressed')).toBe('false');
    expect(q('.link').hasAttribute('aria-pressed')).toBe(false);
    expect(q('.summary').hasAttribute('aria-pressed')).toBe(false);
  });
});
