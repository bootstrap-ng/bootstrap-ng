import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsButtonGroup, BsButtonToolbar } from './button-group';

@Component({
  imports: [BsButtonGroup, BsButtonToolbar],
  template: `
    <div bsButtonToolbar aria-label="Toolbar">
      <div bsButtonGroup class="one" size="sm" aria-label="One"></div>
      <div bsButtonGroup class="two" vertical aria-label="Two"></div>
    </div>
  `,
})
class Host {}

@Component({
  imports: [BsButtonGroup, BsButtonToolbar],
  template: `
    <div bsButtonToolbar aria-label="Toolbar">
      <div bsButtonGroup aria-label="One">
        <button type="button">A</button>
        <button type="button" disabled>B</button>
        <button type="button">C</button>
      </div>
      <input aria-label="Search" />
      <div bsButtonGroup aria-label="Two">
        <button type="button">D</button>
      </div>
    </div>
  `,
})
class KeyboardHost {}

describe('BsButtonGroup', () => {
  it('sets classes and roles', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const toolbar = root.querySelector('[bsButtonToolbar]')!;
    expect(toolbar.className).toBe('btn-toolbar');
    expect(toolbar.getAttribute('role')).toBe('toolbar');
    const one = root.querySelector('.one')!;
    expect(one.classList).toContain('btn-group');
    expect(one.classList).toContain('btn-group-sm');
    expect(one.getAttribute('role')).toBe('group');
    expect(root.querySelector('.two')!.classList).toContain('btn-group-vertical');
  });

  it('moves focus between toolbar controls with the arrow keys', async () => {
    const fixture = TestBed.createComponent(KeyboardHost);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const [a, , c, d] = Array.from(root.querySelectorAll('button'));
    const input = root.querySelector('input')!;
    const press = (target: HTMLElement, key: string) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      target.dispatchEvent(event);
      return event;
    };

    a.focus();
    // The disabled button is skipped.
    expect(press(a, 'ArrowRight').defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(c);
    press(c, 'ArrowRight');
    expect(document.activeElement).toBe(input);
    // Text fields keep their arrow keys.
    expect(press(input, 'ArrowRight').defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(input);
    d.focus();
    press(d, 'ArrowRight');
    expect(document.activeElement).toBe(a);
    press(a, 'ArrowLeft');
    expect(document.activeElement).toBe(d);
    press(d, 'Home');
    expect(document.activeElement).toBe(a);
    press(a, 'End');
    expect(document.activeElement).toBe(d);
    expect(press(d, 'Enter').defaultPrevented).toBe(false);
  });
});
