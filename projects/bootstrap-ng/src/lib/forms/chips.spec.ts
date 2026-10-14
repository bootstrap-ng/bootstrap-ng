import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { BsChip, BsChipDismiss, BsChipInput } from './chips';
import { BsLiveAnnouncer } from '../util/announcer';
import { BsFormField, BsFormLabel } from './form-field';

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
});
