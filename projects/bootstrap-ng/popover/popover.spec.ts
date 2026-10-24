import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsPopover } from './popover';

@Component({
  imports: [BsPopover],
  template: `
    <div style="position: fixed; top: -1000px">
      <button
        type="button"
        bsPopover="Popover body"
        [popoverTitle]="title()"
        placement="end"
        #popover="bsPopover"
        (shown)="shown = shown + 1">
        Toggle
      </button>
    </div>
  `,
})
class Host {
  readonly title = signal('Popover title');
  shown = 0;
}

@Component({
  imports: [BsPopover],
  template: `
    <div style="position: fixed; top: -1000px">
      <button type="button" class="trigger" [bsPopover]="links" (shown)="shown = true">
        Toggle
      </button>
      <button type="button" class="after">After</button>
      <ng-template #links>
        <a href="#one" class="one">One</a>
        <a href="#two" class="two">Two</a>
      </ng-template>
    </div>
  `,
})
class InteractiveHost {
  shown = false;
}

@Component({
  imports: [BsPopover],
  template: `
    <div style="position: fixed; top: -1000px">
      <a href="#" tabindex="0" class="trigger" bsPopover="Selectable text" trigger="focus">
        Dismissible
      </a>
      <button type="button" class="outside">Outside</button>
    </div>
  `,
})
class FocusHost {}

describe('BsPopover', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    return { fixture, host: fixture.componentInstance, button };
  }

  const popover = () => document.querySelector<HTMLElement>('.popover');

  afterEach(() => document.querySelectorAll('.popover').forEach((tip) => tip.remove()));

  it('toggles on click with a header and body', async () => {
    const { fixture, host, button } = await setup();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    button.click();
    await fixture.whenStable();
    await vi.waitFor(() => expect(host.shown).toBe(1));

    const tip = popover()!;
    expect(tip.classList).toContain('show');
    expect(tip.classList).toContain('bs-popover-auto');
    expect(tip.querySelector('.popover-arrow')).not.toBeNull();
    expect(tip.querySelector('.popover-header')!.textContent).toBe('Popover title');
    expect(tip.querySelector('.popover-body')!.textContent).toBe('Popover body');
    expect(button.getAttribute('aria-describedby')).toBe(tip.id);
    expect(button.getAttribute('aria-expanded')).toBe('true');

    button.click();
    await vi.waitFor(() => expect(popover()).toBeNull());
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('leaves out the header without a title', async () => {
    const { fixture, host, button } = await setup();
    host.title.set('');
    await fixture.whenStable();
    button.click();
    await vi.waitFor(() => expect(popover()).not.toBeNull());
    expect(popover()!.querySelector('.popover-header')).toBeNull();
  });

  it('does not open on hover or focus by default', async () => {
    const { button } = await setup();
    button.dispatchEvent(new MouseEvent('mouseenter'));
    button.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(popover()).toBeNull();
  });

  it('puts interactive content in the tab order after its trigger', async () => {
    const fixture = TestBed.createComponent(InteractiveHost);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const trigger = root.querySelector<HTMLButtonElement>('.trigger')!;
    const tab = (target: Element, shiftKey = false) => {
      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey,
        bubbles: true,
        cancelable: true,
      });
      target.dispatchEvent(event);
      return event;
    };

    // Closed, Tab is left to the browser.
    expect(tab(trigger).defaultPrevented).toBe(false);
    trigger.focus();
    trigger.click();
    await vi.waitFor(() => expect(fixture.componentInstance.shown).toBe(true));
    const tip = popover()!;
    const one = tip.querySelector<HTMLElement>('.one')!;
    const two = tip.querySelector<HTMLElement>('.two')!;

    tab(trigger);
    expect(document.activeElement).toBe(one);
    // Moving within the tip is left to the browser.
    expect(tab(one).defaultPrevented).toBe(false);
    tab(one, true);
    expect(document.activeElement).toBe(trigger);
    two.focus();
    tab(two);
    expect(document.activeElement).toBe(root.querySelector('.after'));

    // Escape from inside the tip closes it and returns focus to the trigger.
    one.focus();
    one.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.activeElement).toBe(trigger);
    await vi.waitFor(() => expect(popover()).toBeNull());
  });

  it('keeps a focus-triggered popover open while its content is pressed', async () => {
    const fixture = TestBed.createComponent(FocusHost);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const trigger = root.querySelector<HTMLElement>('.trigger')!;
    trigger.focus();
    await vi.waitFor(() => expect(popover()?.classList).toContain('show'));
    const body = popover()!.querySelector('.popover-body')!;

    // Pressing on the text moves focus to the page, as a real click would.
    body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    trigger.blur();
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(popover()?.classList).toContain('show');

    // A press anywhere else dismisses it.
    root
      .querySelector('.outside')!
      .dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await vi.waitFor(() => expect(popover()).toBeNull());
  });
});
