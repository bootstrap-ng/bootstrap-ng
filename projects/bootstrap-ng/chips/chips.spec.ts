import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { BsChip, BsChipDismiss, BsChipInput, provideBsChipInputConfig } from './chips';
import { BsLiveAnnouncer } from 'bootstrap-ng/util';
import { BsFormField, BsFormLabel } from 'bootstrap-ng/forms';

describe('BsChip', () => {
  it('renders chip classes and a dismiss button', async () => {
    @Component({
      imports: [BsChip, BsChipDismiss],
      template: `<span bsChip theme="success" active
        >Tag <button bsChipDismiss aria-label="Remove Tag"></button
      ></span>`,
    })
    class Host {}
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const chip: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(chip.classList).toContain('chip');
    expect(chip.classList).toContain('theme-success');
    expect(chip.classList).toContain('active');
    const button = chip.querySelector('button')!;
    expect(button.className).toBe('chip-dismiss');
    expect(button.type).toBe('button');
    expect(button.getAttribute('aria-label')).toBe('Remove Tag');
    expect(button.querySelector('svg')).not.toBeNull();
  });
});

describe('BsChipInput', () => {
  @Component({
    imports: [ReactiveFormsModule, BsChipInput, BsFormField, BsFormLabel],
    template: `
      <div bsFormField>
        <label bsFormLabel>Tags</label>
        <div bsChipInput theme="primary" [maxChips]="max()" [formControl]="tags"></div>
      </div>
    `,
  })
  class Host {
    readonly max = signal<number | null>(null);
    tags = new FormControl<string[]>(['One', 'Two']);
  }

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const host = root.querySelector<HTMLElement>('[bsChipInput]')!;
    const input = host.querySelector('input')!;
    const chips = () => Array.from(host.querySelectorAll<HTMLElement>('.chip'));
    const type = async (text: string, key?: string) => {
      input.value = text;
      input.dispatchEvent(new Event('input'));
      if (key) {
        input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      }
      await fixture.whenStable();
    };
    return { fixture, root, host, input, chips, type, component: fixture.componentInstance };
  }

  it('renders the value and wires the label to the input', async () => {
    const { root, host, input, chips } = await setup();
    expect(host.classList).toContain('chip-input');
    expect(host.classList).toContain('theme-primary');
    expect(input.classList).toContain('form-ghost');
    expect(chips().map((c) => c.textContent?.trim())).toEqual(['One', 'Two']);
    expect(root.querySelector('label')!.htmlFor).toBe(input.id);
  });

  it('ignores Enter while IME composition is active', async () => {
    const { input, chips, component } = await setup();
    input.value = 'さ';
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, isComposing: true }),
    );
    await vi.waitFor(() => expect(component.tags.value).toEqual(['One', 'Two']));
    expect(chips()).toHaveLength(2);
  });

  it('adds chips with Enter and the separator', async () => {
    const { chips, type, component } = await setup();
    await type('Three', 'Enter');
    await type('Four, Five,');
    expect(component.tags.value).toEqual(['One', 'Two', 'Three', 'Four', 'Five']);
    expect(chips()).toHaveLength(5);
    await vi.waitFor(() =>
      expect(document.querySelector('[aria-live="polite"]')!.textContent).toBe('Added Five'),
    );
    await type('One', 'Enter');
    expect(component.tags.value).toHaveLength(5);
  });

  it('respects maxChips', async () => {
    const { fixture, input, chips, type, component } = await setup();
    component.max.set(3);
    await fixture.whenStable();
    input.focus();
    await type('Three', 'Enter');
    expect(component.tags.value).toEqual(['One', 'Two', 'Three']);
    // The full input stays focusable, so chips can still be removed with the keyboard.
    expect(input.disabled).toBe(false);
    expect(input.readOnly).toBe(true);
    expect(document.activeElement).toBe(input);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    await fixture.whenStable();
    expect(document.activeElement).toBe(chips()[2]);
    chips()[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    await fixture.whenStable();
    expect(component.tags.value).toEqual(['One', 'Two']);
    expect(input.readOnly).toBe(false);
  });

  it('pastes at the caret', async () => {
    const { fixture, input, component } = await setup();
    input.value = 'ab';
    input.setSelectionRange(1, 1);
    const clipboardData = new DataTransfer();
    clipboardData.setData('text/plain', 'x,y');
    input.dispatchEvent(new ClipboardEvent('paste', { clipboardData, cancelable: true }));
    await fixture.whenStable();
    expect(component.tags.value).toEqual(['One', 'Two', 'ax', 'yb']);
  });

  it('keeps rejected text in the input', async () => {
    const { input, type, component } = await setup();
    await type('One, Three,');
    expect(component.tags.value).toEqual(['One', 'Two', 'Three']);
    expect(input.value).toBe('One');
    await type('Four', 'Enter');
    expect(input.value).toBe('');
  });

  it('removes chips with the dismiss button and the keyboard', async () => {
    const { fixture, input, chips, component } = await setup();
    chips()[0].querySelector('button')!.click();
    await fixture.whenStable();
    expect(component.tags.value).toEqual(['Two']);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    await fixture.whenStable();
    expect(chips()[0].classList).toContain('active');
    expect(document.activeElement).toBe(chips()[0]);
    chips()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    await fixture.whenStable();
    expect(component.tags.value).toEqual([]);
  });

  it('clears the text and selection on Escape but keeps focus', async () => {
    const { fixture, input, chips } = await setup();
    input.focus();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    await fixture.whenStable();
    input.focus();
    input.value = 'Draft';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(input.value).toBe('');
    expect(chips().some((chip) => chip.classList.contains('active'))).toBe(false);
    expect(document.activeElement).toBe(input);
  });

  it('marks the control touched on blur and shows validation', async () => {
    const { fixture, input, component } = await setup();
    component.tags.setValidators(() => ({ tooMany: true }));
    component.tags.updateValueAndValidity();
    input.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(component.tags.touched).toBe(true);
    expect(input.classList).toContain('is-invalid');
  });

  it('follows the form disabled state', async () => {
    const { fixture, input, host, component } = await setup();
    component.tags.disable();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    expect(host.classList).toContain('disabled');
  });

  it('works with Signal Forms and [(value)]', async () => {
    @Component({
      imports: [FormField, BsChipInput],
      template: `
        <div bsChipInput aria-label="Tags" [formField]="post.tags"></div>
        <div bsChipInput aria-label="Other" [(value)]="other"></div>
      `,
    })
    class SignalHost {
      readonly model = signal({ tags: ['a'] });
      post = form(this.model);
      readonly other = signal(['x']);
    }
    const fixture = TestBed.createComponent(SignalHost);
    await fixture.whenStable();
    const [first, second] = fixture.nativeElement.querySelectorAll('input');
    first.value = 'b';
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    second.value = 'y';
    second.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await fixture.whenStable();
    expect(fixture.componentInstance.model().tags).toEqual(['a', 'b']);
    expect(fixture.componentInstance.other()).toEqual(['x', 'y']);
  });

  it('announces the same removal again', async () => {
    const { fixture, chips, component } = await setup();
    const announce = vi.spyOn(TestBed.inject(BsLiveAnnouncer), 'announce');
    component.tags.setValue(['One', 'One', 'Two']);
    await fixture.whenStable();
    chips()[0].querySelector('button')!.click();
    await fixture.whenStable();
    chips()[0].querySelector('button')!.click();
    await fixture.whenStable();
    expect(component.tags.value).toEqual(['Two']);
    expect(announce.mock.calls.map(([message]) => message)).toEqual(['Removed One', 'Removed One']);
  });

  it('moves between chips with the arrow keys, Home and End', async () => {
    const { fixture, input, chips, component } = await setup();
    component.tags.setValue(['One', 'Two', 'Three']);
    await fixture.whenStable();
    const key = async (target: HTMLElement, key: string, init: KeyboardEventInit = {}) => {
      const event = new KeyboardEvent('keydown', { key, cancelable: true, ...init });
      target.dispatchEvent(event);
      await fixture.whenStable();
      return event;
    };
    const active = () => chips().map((chip) => chip.classList.contains('active'));

    input.focus();
    input.setSelectionRange(0, 0);
    expect((await key(input, 'ArrowLeft')).defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(chips()[2]);
    expect(active()).toEqual([false, false, true]);

    await key(chips()[2], 'ArrowLeft');
    expect(document.activeElement).toBe(chips()[1]);
    await key(chips()[1], 'Home');
    expect(document.activeElement).toBe(chips()[0]);
    expect(active()).toEqual([true, false, false]);
    // ArrowLeft on the first chip stays there.
    await key(chips()[0], 'ArrowLeft');
    expect(document.activeElement).toBe(chips()[0]);

    await key(chips()[0], 'ArrowRight');
    expect(document.activeElement).toBe(chips()[1]);
    await key(chips()[1], 'ArrowRight');
    await key(chips()[2], 'ArrowRight');
    // Past the last chip, focus returns to the input and the selection clears.
    expect(document.activeElement).toBe(input);
    expect(active()).toEqual([false, false, false]);

    await key(input, 'ArrowLeft');
    await key(chips()[2], 'End');
    expect(document.activeElement).toBe(input);
    await key(input, 'ArrowLeft');
    await key(chips()[2], 'Escape');
    expect(document.activeElement).toBe(input);
    expect(active()).toEqual([false, false, false]);
  });

  it('leaves ArrowLeft to the text when the caret is not at the start', async () => {
    const { fixture, input, chips } = await setup();
    input.focus();
    input.value = 'ab';
    input.setSelectionRange(2, 2);
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', cancelable: true });
    input.dispatchEvent(event);
    await fixture.whenStable();
    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(input);
    expect(chips().some((chip) => chip.classList.contains('active'))).toBe(false);
  });

  it('extends the selection with Shift and removes all selected chips at once', async () => {
    const { fixture, input, chips, component } = await setup();
    component.tags.setValue(['A', 'B', 'C', 'D']);
    await fixture.whenStable();
    input.focus();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    await fixture.whenStable();
    chips()[3].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true }));
    await fixture.whenStable();
    chips()[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true }));
    await fixture.whenStable();
    expect(chips().map((chip) => chip.classList.contains('active'))).toEqual([
      false,
      true,
      true,
      true,
    ]);
    const announce = vi.spyOn(TestBed.inject(BsLiveAnnouncer), 'announce');
    chips()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));
    await fixture.whenStable();
    expect(component.tags.value).toEqual(['A']);
    expect(announce).toHaveBeenCalledWith('Removed B, C, D');
    // Nothing took the removed chips' place, so focus moves to the input.
    expect(document.activeElement).toBe(input);
  });

  it('selects every chip with Ctrl+A or Cmd+A', async () => {
    const { fixture, chips, component } = await setup();
    chips()[0].click();
    await fixture.whenStable();
    const plain = new KeyboardEvent('keydown', { key: 'a', cancelable: true });
    chips()[0].dispatchEvent(plain);
    expect(plain.defaultPrevented).toBe(false);
    chips()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true }));
    await fixture.whenStable();
    expect(chips().every((chip) => chip.classList.contains('active'))).toBe(true);
    chips()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    await fixture.whenStable();
    expect(component.tags.value).toEqual([]);

    component.tags.setValue(['X', 'Y']);
    await fixture.whenStable();
    chips()[1].click();
    chips()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'a', metaKey: true }));
    await fixture.whenStable();
    expect(chips().every((chip) => chip.classList.contains('active'))).toBe(true);
  });

  it('selects chips with click, Ctrl/Cmd+click and Shift+click', async () => {
    const { fixture, chips, component } = await setup();
    component.tags.setValue(['A', 'B', 'C', 'D']);
    await fixture.whenStable();
    const click = async (index: number, init: MouseEventInit = {}) => {
      chips()[index].dispatchEvent(new MouseEvent('click', { bubbles: true, ...init }));
      await fixture.whenStable();
    };
    const active = () => chips().map((chip) => chip.classList.contains('active'));

    await click(0);
    expect(active()).toEqual([true, false, false, false]);
    expect(document.activeElement).toBe(chips()[0]);
    await click(2, { ctrlKey: true });
    expect(active()).toEqual([true, false, true, false]);
    await click(0, { metaKey: true });
    expect(active()).toEqual([false, false, true, false]);
    // The last Ctrl/Cmd+click sets the anchor for Shift+click.
    await click(3, { shiftKey: true });
    expect(active()).toEqual([true, true, true, true]);
    await click(1);
    expect(active()).toEqual([false, true, false, false]);
    await click(3, { shiftKey: true });
    expect(active()).toEqual([false, true, true, true]);
  });

  it('ignores chip clicks while disabled', async () => {
    const { fixture, chips, component } = await setup();
    component.tags.disable();
    await fixture.whenStable();
    chips()[0].click();
    await fixture.whenStable();
    expect(chips()[0].classList).not.toContain('active');
    chips()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    await fixture.whenStable();
    expect(component.tags.value).toEqual(['One', 'Two']);
  });

  it('focuses the input when the field padding is clicked', async () => {
    const { fixture, host, input, chips } = await setup();
    chips()[0].click();
    await fixture.whenStable();
    expect(document.activeElement).toBe(chips()[0]);
    host.click();
    await fixture.whenStable();
    expect(document.activeElement).toBe(input);
    // Focusing the input clears the chip selection.
    expect(chips()[0].classList).not.toContain('active');
  });

  it('adds and removes chips through its API', async () => {
    const { fixture, chips, component } = await setup();
    const chipInput = fixture.debugElement.query(By.directive(BsChipInput))
      .componentInstance as BsChipInput;
    expect(chipInput.add('  Three  ')).toBe(true);
    expect(chipInput.add('   ')).toBe(false);
    expect(chipInput.add('One')).toBe(false);
    expect(chipInput.remove('Missing')).toBe(false);
    expect(chipInput.remove('One')).toBe(true);
    await fixture.whenStable();
    expect(component.tags.value).toEqual(['Two', 'Three']);
    // Focus moves to the chip that took the removed one's place.
    expect(document.activeElement).toBe(chips()[0]);

    chips()[0].click();
    await fixture.whenStable();
    chipInput.clear();
    await fixture.whenStable();
    expect(component.tags.value).toEqual([]);
    expect(chipInput.selected().size).toBe(0);

    component.tags.disable();
    await fixture.whenStable();
    expect(chipInput.add('Four')).toBe(false);
  });

  it('supports duplicates, no separator, no dismiss buttons and no blur creation', async () => {
    @Component({
      imports: [BsChipInput],
      template: `<div
        bsChipInput
        aria-label="Tags"
        removeLabel="Delete"
        allowDuplicates
        [separator]="null"
        [dismissible]="dismissible()"
        [createOnBlur]="false"
        [(value)]="tags"></div>`,
    })
    class OptionsHost {
      readonly tags = signal(['a']);
      readonly dismissible = signal(true);
    }
    const fixture = TestBed.createComponent(OptionsHost);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const input = root.querySelector('input')!;
    expect(input.getAttribute('aria-label')).toBe('Tags');
    expect(root.querySelector('[bsChipInput]')!.hasAttribute('aria-label')).toBe(false);
    expect(root.querySelector('.chip button')!.getAttribute('aria-label')).toBe('Delete a');

    input.value = 'a, b';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    // Without a separator, typing a comma adds nothing.
    expect(fixture.componentInstance.tags()).toEqual(['a']);

    input.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(fixture.componentInstance.tags()).toEqual(['a']);
    expect(input.value).toBe('a, b');

    input.value = 'a';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await fixture.whenStable();
    expect(fixture.componentInstance.tags()).toEqual(['a', 'a']);

    fixture.componentInstance.dismissible.set(false);
    await fixture.whenStable();
    expect(root.querySelector('.chip button')).toBeNull();
  });

  it('adds the typed text on blur', async () => {
    const { fixture, input, component } = await setup();
    input.value = 'Three';
    input.dispatchEvent(new FocusEvent('blur'));
    await fixture.whenStable();
    expect(component.tags.value).toEqual(['One', 'Two', 'Three']);
    expect(input.value).toBe('');
  });

  it('lets the browser handle a paste without a separator or into a full field', async () => {
    const { fixture, input, component } = await setup();
    const paste = (text: string) => {
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', text);
      const event = new ClipboardEvent('paste', { clipboardData, cancelable: true });
      input.dispatchEvent(event);
      return event;
    };
    expect(paste('plain').defaultPrevented).toBe(false);
    component.max.set(2);
    await fixture.whenStable();
    expect(paste('x,y').defaultPrevented).toBe(false);
    expect(component.tags.value).toEqual(['One', 'Two']);
  });

  it('takes defaults from provideBsChipInputConfig', async () => {
    TestBed.configureTestingModule({
      providers: [provideBsChipInputConfig({ separator: ';', removeLabel: 'Retirer' })],
    });
    @Component({
      imports: [BsChipInput],
      template: `<div bsChipInput aria-label="Tags" [(value)]="tags"></div>`,
    })
    class ConfigHost {
      readonly tags = signal(['a']);
    }
    const fixture = TestBed.createComponent(ConfigHost);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('.chip button')!.getAttribute('aria-label')).toBe('Retirer a');
    const input = root.querySelector('input')!;
    input.value = 'b;c;';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.tags()).toEqual(['a', 'b', 'c']);
  });
});
