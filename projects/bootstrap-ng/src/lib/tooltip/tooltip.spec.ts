import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BsTooltip } from './tooltip';

@Component({
  imports: [BsTooltip],
  // Off screen so the test runner's pointer never hovers the triggers.
  template: `
    <div style="position: fixed; top: -1000px">
      <button type="button" [bsTooltip]="text()" placement="bottom" (hidden)="hidden = hidden + 1">
        Hover me
      </button>
      <button type="button" [bsTooltip]="rich" trigger="click" class="rich">Rich</button>
    </div>
    <ng-template #rich><em>Rich</em> {{ text() }}</ng-template>
  `,
})
class Host {
  readonly text = signal('Tooltip text');
  hidden = 0;
}

@Component({
  imports: [BsTooltip],
  template: `
    <div style="position: fixed; top: -1000px">
      <button
        type="button"
        class="manual"
        bsTooltip="Manual"
        trigger="manual"
        [animation]="false"
        #manual="bsTooltip"
        (shown)="shown = shown + 1">
        Manual
      </button>
      <button type="button" class="delayed" bsTooltip="Delayed" delay="50">Delayed</button>
      <button type="button" class="hinted" bsTooltip="Tip" aria-describedby="hint">Hinted</button>
      <p id="hint">Hint</p>
      <dialog class="dialog" open>
        <button type="button" class="in-dialog" bsTooltip="In dialog">In dialog</button>
      </dialog>
    </div>
  `,
})
class OptionsHost {
  shown = 0;
}

describe('BsTooltip', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    return { fixture, host: fixture.componentInstance, button };
  }

  const tooltip = () => document.querySelector<HTMLElement>('.tooltip');

  afterEach(() => document.querySelectorAll('.tooltip').forEach((tip) => tip.remove()));

  it('shows on focus with Bootstrap markup and hides on blur', async () => {
    const { fixture, host, button } = await setup();
    button.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await fixture.whenStable();
    await vi.waitFor(() => expect(tooltip()?.classList).toContain('show'));

    const tip = tooltip()!;
    expect(tip.getAttribute('role')).toBe('tooltip');
    expect(tip.classList).toContain('bs-tooltip-auto');
    expect(tip.querySelector('.tooltip-arrow')).not.toBeNull();
    expect(tip.querySelector('.tooltip-inner')!.textContent).toBe('Tooltip text');
    expect(button.getAttribute('aria-describedby')).toBe(tip.id);
    expect(tip.getAttribute('data-bs-placement')).toBeTruthy();

    button.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    await vi.waitFor(() => expect(host.hidden).toBe(1));
    await fixture.whenStable();
    expect(tooltip()).toBeNull();
    expect(button.getAttribute('aria-describedby')).toBeNull();
  });

  it('shows on hover and hides on Escape', async () => {
    const { fixture, host, button } = await setup();
    button.dispatchEvent(new MouseEvent('mouseenter'));
    await vi.waitFor(() => expect(tooltip()?.classList).toContain('show'));
    const escape = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    document.dispatchEvent(escape);
    // Handled, so a dialog around the trigger does not close as well.
    expect(escape.defaultPrevented).toBe(true);
    await vi.waitFor(() => expect(host.hidden).toBe(1));
    await fixture.whenStable();
    expect(tooltip()).toBeNull();
  });

  it('leaves Escape outside the trigger and tip to others, such as a modal dialog', async () => {
    const { fixture, host, button } = await setup();
    button.dispatchEvent(new MouseEvent('mouseenter'));
    await vi.waitFor(() => expect(tooltip()?.classList).toContain('show'));
    const dialog = document.createElement('dialog');
    const inside = document.createElement('button');
    dialog.append(inside);
    document.body.append(dialog);
    try {
      dialog.showModal();
      inside.focus();
      const escape = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });
      inside.dispatchEvent(escape);
      expect(escape.defaultPrevented).toBe(false);
      await vi.waitFor(() => expect(host.hidden).toBe(1));
      await fixture.whenStable();
      expect(tooltip()).toBeNull();
    } finally {
      dialog.remove();
    }
  });

  it('updates the text while shown', async () => {
    const { fixture, host, button } = await setup();
    button.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await vi.waitFor(() => expect(tooltip()).not.toBeNull());
    host.text.set('New text');
    await fixture.whenStable();
    expect(tooltip()!.querySelector('.tooltip-inner')!.textContent).toBe('New text');
  });

  it('does not show without content', async () => {
    const { fixture, host, button } = await setup();
    host.text.set('');
    await fixture.whenStable();
    button.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(tooltip()).toBeNull();
  });

  it('renders a template and toggles on click', async () => {
    const { fixture } = await setup();
    const rich: HTMLButtonElement = fixture.nativeElement.querySelector('.rich');
    rich.click();
    await vi.waitFor(() => expect(tooltip()?.classList).toContain('show'));
    expect(tooltip()!.querySelector('.tooltip-inner em')!.textContent).toBe('Rich');
    expect(rich.getAttribute('aria-expanded')).toBe('true');
    rich.click();
    await vi.waitFor(() => expect(tooltip()).toBeNull());
  });

  it('hides when its content is cleared while shown', async () => {
    const { fixture, host, button } = await setup();
    button.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await vi.waitFor(() => expect(tooltip()?.classList).toContain('show'));
    host.text.set('');
    await fixture.whenStable();
    await vi.waitFor(() => expect(tooltip()).toBeNull());
    expect(host.hidden).toBe(1);
  });

  it('stays open while the pointer moves onto the tooltip', async () => {
    const { button } = await setup();
    button.dispatchEvent(new MouseEvent('mouseenter'));
    await vi.waitFor(() => expect(tooltip()?.classList).toContain('show'));
    button.dispatchEvent(new MouseEvent('mouseleave'));
    tooltip()!.dispatchEvent(new MouseEvent('mouseenter'));
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(tooltip()?.classList).toContain('show');
    tooltip()!.dispatchEvent(new MouseEvent('mouseleave'));
    await vi.waitFor(() => expect(tooltip()).toBeNull());
  });

  describe('options', () => {
    async function setupOptions() {
      const fixture = TestBed.createComponent(OptionsHost);
      await fixture.whenStable();
      const q = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
      return { fixture, host: fixture.componentInstance, q };
    }

    it('only opens a manual tooltip from its methods', async () => {
      const { fixture, host, q } = await setupOptions();
      const button = q('.manual');
      const tip = fixture.debugElement.query(By.css('.manual')).injector.get(BsTooltip);
      button.dispatchEvent(new MouseEvent('mouseenter'));
      button.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      button.click();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      expect(tooltip()).toBeNull();
      expect(button.hasAttribute('aria-expanded')).toBe(false);

      await tip.toggle();
      expect(tip.isOpen()).toBe(true);
      expect(tooltip()!.classList).toContain('tooltip-instant');
      expect(host.shown).toBe(1);
      await tip.toggle();
      expect(tooltip()).toBeNull();
    });

    it('waits for the delay before showing', async () => {
      const { q } = await setupOptions();
      q('.delayed').dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      expect(tooltip()).toBeNull();
      await vi.waitFor(() => expect(tooltip()?.classList).toContain('show'));
      q('.delayed').dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
      expect(tooltip()).not.toBeNull();
      await vi.waitFor(() => expect(tooltip()).toBeNull());
    });

    it('renders inside an open dialog so it stays in the top layer', async () => {
      const { q } = await setupOptions();
      q('.in-dialog').dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      await vi.waitFor(() => expect(tooltip()).not.toBeNull());
      expect(tooltip()!.parentElement).toBe(q('dialog'));
    });

    it('keeps the trigger’s own aria-describedby', async () => {
      const { fixture, q } = await setupOptions();
      const button = q('.hinted');
      expect(button.getAttribute('aria-describedby')).toBe('hint');
      button.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      await vi.waitFor(() => expect(tooltip()).not.toBeNull());
      await fixture.whenStable();
      expect(button.getAttribute('aria-describedby')).toBe(`hint ${tooltip()!.id}`);
      button.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
      await vi.waitFor(() => expect(tooltip()).toBeNull());
      await fixture.whenStable();
      expect(button.getAttribute('aria-describedby')).toBe('hint');
    });

    it('removes its tooltip when destroyed', async () => {
      const { fixture, q } = await setupOptions();
      q('.in-dialog').dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      await vi.waitFor(() => expect(tooltip()).not.toBeNull());
      fixture.destroy();
      expect(tooltip()).toBeNull();
    });
  });
});
