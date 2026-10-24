import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsCollapse, BsCollapseToggle } from './collapse';

@Component({
  imports: [BsCollapse, BsCollapseToggle],
  template: `
    <button type="button" [bsCollapseToggle]="c">Toggle</button>
    <a href="#" [bsCollapseToggle]="c">Link</a>
    <div bsCollapse #c="bsCollapse" [(open)]="open" (shown)="shown = shown + 1">Content</div>
  `,
})
class Host {
  readonly open = signal(false);
  shown = 0;
}

describe('BsCollapse', () => {
  it('toggles the show class and ARIA state from a toggle', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    const content: HTMLElement = fixture.nativeElement.querySelector('.collapse');

    expect(content.id).toMatch(/^bs-collapse-\d+$/);
    expect(button.getAttribute('aria-controls')).toBe(content.id);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('role')).toBeNull();
    expect(link.getAttribute('role')).toBe('button');

    button.click();
    await fixture.whenStable();
    expect(content.classList).toContain('show');
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.componentInstance.open()).toBe(true);
    await vi.waitFor(() => expect(fixture.componentInstance.shown).toBe(1));

    link.click();
    await fixture.whenStable();
    expect(content.classList).not.toContain('show');
  });

  it('toggles from a link with Space, like a button', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    link.dispatchEvent(space);
    await fixture.whenStable();
    expect(space.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.open()).toBe(true);
  });

  it('follows the bound open state', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.open.set(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.collapse').classList).toContain('show');
  });

  it('accepts a static open attribute', async () => {
    @Component({
      imports: [BsCollapse],
      template: `<div bsCollapse open>Content</div>`,
    })
    class StaticHost {}
    const fixture = TestBed.createComponent(StaticHost);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.collapse').classList).toContain('show');
  });
});
