import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { userEvent } from 'vitest/browser';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BsOtp, BsOtpInput, BsOtpType } from './otp-input';

/** Real key presses, so the browser edits the input and records Undo history. */
// eslint-disable-next-line @angular-eslint/no-experimental -- Vitest's API, not Angular's
const press = (keys: string) => userEvent.keyboard(keys);

describe('BsOtp', () => {
  @Component({
    imports: [BsOtp, BsOtpInput, ReactiveFormsModule],
    template: `
      <div
        bsOtp
        connected
        [type]="type()"
        [mask]="mask()"
        [groups]="[3, 3]"
        (complete)="done.set($event)">
        <input bsOtpInput maxlength="6" aria-label="Code" [formControl]="code" />
      </div>
    `,
  })
  class Host {
    readonly type = signal<BsOtpType>('numeric');
    readonly mask = signal(false);
    code = new FormControl('12');
    readonly done = signal('');
  }

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement.querySelector('[bsOtp]');
    document.body.append(fixture.nativeElement);
    const input = host.querySelector('input')!;
    const slots = () =>
      Array.from(host.querySelectorAll('.otp-slot')).map((s) => s.textContent?.trim());
    const beforeInput = async (inputType: string, data: string | null = null) => {
      input.dispatchEvent(new InputEvent('beforeinput', { inputType, data, cancelable: true }));
      await fixture.whenStable();
    };
    const paste = async (text: string) => {
      const clipboardData = new DataTransfer();
      clipboardData.setData('text', text);
      const event = new ClipboardEvent('paste', { clipboardData, cancelable: true });
      input.dispatchEvent(event);
      await fixture.whenStable();
      return event;
    };
    return {
      fixture,
      host,
      input,
      slots,
      beforeInput,
      paste,
      component: fixture.componentInstance,
    };
  }

  it('renders slots, separators and input attributes', async () => {
    const { host, input, slots } = await setup();
    expect(host.classList).toContain('otp');
    expect(host.classList).toContain('otp-connected');
    expect(host.classList).toContain('otp-rendered');
    expect(input.classList).toContain('otp-input');
    expect(input.getAttribute('inputmode')).toBe('numeric');
    expect(input.getAttribute('autocomplete')).toBe('one-time-code');
    expect(input.getAttribute('maxlength')).toBe('6');
    expect(slots()).toEqual(['1', '2', '', '', '', '']);
    expect(host.querySelectorAll('.otp-separator')).toHaveLength(1);
    expect(host.querySelector('.otp-slots')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('overwrites characters and filters disallowed ones', async () => {
    const { fixture, input, slots, beforeInput, component } = await setup();
    input.focus();
    await fixture.whenStable();
    input.setSelectionRange(0, 0);
    await press('9');
    await fixture.whenStable();
    expect(component.code.value).toBe('92');
    // The next slot is selected, ready to overwrite.
    expect([input.selectionStart, input.selectionEnd]).toEqual([1, 2]);
    await beforeInput('insertText', 'x');
    expect(component.code.value).toBe('92');
    expect(slots()[0]).toBe('9');
    input.setSelectionRange(2, 2);
    await press('{Backspace}');
    await fixture.whenStable();
    expect(component.code.value).toBe('9');
  });

  it('keeps edits in the undo history', async () => {
    const { fixture, input, paste, component } = await setup();
    input.focus();
    await fixture.whenStable();
    await press('3');
    await fixture.whenStable();
    expect(component.code.value).toBe('123');
    await paste('456');
    expect(component.code.value).toBe('123456');
    await press('{Control>}z{/Control}');
    await fixture.whenStable();
    expect(component.code.value).toBe('123');
    await press('{Control>}z{/Control}');
    await fixture.whenStable();
    expect(component.code.value).toBe('12');
    await press('{Control>}{Shift>}z{/Shift}{/Control}');
    await fixture.whenStable();
    expect(component.code.value).toBe('123');
  });

  it('replaces a selection of several characters', async () => {
    const { fixture, input, component } = await setup();
    component.code.setValue('123456');
    input.focus();
    await fixture.whenStable();
    input.setSelectionRange(0, 6);
    await press('9');
    await fixture.whenStable();
    expect(component.code.value).toBe('9');
    component.code.setValue('123456');
    await fixture.whenStable();
    input.setSelectionRange(2, 4);
    await press('0');
    await fixture.whenStable();
    expect(component.code.value).toBe('12056');
  });

  it('ignores group sizes below one', async () => {
    @Component({
      imports: [BsOtp, BsOtpInput],
      template: `
        <div bsOtp [groups]="[0]">
          <input bsOtpInput maxlength="3" aria-label="Code" />
        </div>
        <div bsOtp [groups]="[-2]">
          <input bsOtpInput maxlength="3" aria-label="Code" />
        </div>
      `,
    })
    class GroupsHost {}
    const fixture = TestBed.createComponent(GroupsHost);
    await fixture.whenStable();
    const [zero, negative] = fixture.nativeElement.querySelectorAll('[bsOtp]');
    expect(zero.querySelectorAll('.otp-slot')).toHaveLength(3);
    expect(zero.querySelectorAll('.otp-separator')).toHaveLength(2);
    expect(negative.querySelectorAll('.otp-separator')).toHaveLength(2);
  });

  it('sanitizes pasted codes and emits complete', async () => {
    const { fixture, input, component } = await setup();
    input.value = '123-456';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(component.code.value).toBe('123456');
    expect(component.done()).toBe('123456');
  });

  it('keeps every character of a pasted code with a separator', async () => {
    const { input, paste, component } = await setup();
    const event = await paste('654-321');
    expect(event.defaultPrevented).toBe(true);
    expect(input.value).toBe('654321');
    expect(component.code.value).toBe('654321');
    expect(component.done()).toBe('654321');
  });

  it('pastes a partial code over the selection', async () => {
    const { input, paste, component } = await setup();
    component.code.setValue('123456');
    input.setSelectionRange(2, 4);
    await paste('9-9');
    expect(input.value).toBe('129956');
    expect(input.selectionStart).toBe(4);
    expect(component.code.value).toBe('129956');
  });

  it('ignores empty pastes and read-only inputs', async () => {
    const { input, paste, component } = await setup();
    expect((await paste('')).defaultPrevented).toBe(false);
    expect((await paste('--')).defaultPrevented).toBe(true);
    expect(input.value).toBe('12');
    input.readOnly = true;
    expect((await paste('654321')).defaultPrevented).toBe(false);
    expect(component.code.value).toBe('12');
  });

  it('masks the value and marks the active slot', async () => {
    const { fixture, host, input, slots, component } = await setup();
    component.mask.set(true);
    input.focus();
    await fixture.whenStable();
    expect(slots().slice(0, 3)).toEqual(['•', '•', '']);
    expect(host.querySelectorAll('.otp-slot-active')).toHaveLength(1);
    component.type.set('alpha');
    await fixture.whenStable();
    expect(input.getAttribute('inputmode')).toBe('text');
  });

  it('deletes a selection or the character before the caret', async () => {
    const { fixture, input, component } = await setup();
    component.code.setValue('123456');
    input.focus();
    await fixture.whenStable();
    input.setSelectionRange(1, 3);
    await press('{Backspace}');
    await fixture.whenStable();
    expect(component.code.value).toBe('1456');
    // The slot that took the deleted characters' place is selected, ready to overwrite.
    expect([input.selectionStart, input.selectionEnd]).toEqual([1, 2]);

    input.setSelectionRange(0, 0);
    await press('{Backspace}');
    await fixture.whenStable();
    expect(component.code.value).toBe('1456');
  });

  it('leaves other input types to the browser', async () => {
    const { input } = await setup();
    const event = new InputEvent('beforeinput', {
      inputType: 'insertText',
      data: '12',
      cancelable: true,
    });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('removes the active slot on blur', async () => {
    const { fixture, host, input } = await setup();
    input.focus();
    await fixture.whenStable();
    expect(host.querySelectorAll('.otp-slot-active')).toHaveLength(1);
    input.blur();
    await fixture.whenStable();
    expect(host.querySelectorAll('.otp-slot-active')).toHaveLength(0);
  });

  it('follows the caret while focused', async () => {
    const { fixture, host, input } = await setup();
    const activeIndex = () =>
      Array.from(host.querySelectorAll('.otp-slot')).findIndex((slot) =>
        slot.classList.contains('otp-slot-active'),
      );
    input.focus();
    await fixture.whenStable();
    expect(activeIndex()).toBe(2);
    input.setSelectionRange(0, 1);
    document.dispatchEvent(new Event('selectionchange'));
    await fixture.whenStable();
    expect(activeIndex()).toBe(0);
  });

  it('moves to the clicked slot, but not past the first empty one', async () => {
    const { fixture, host, input } = await setup();
    // Unit tests load no Bootstrap CSS, so lay the slots out in a row like it does.
    const style = document.createElement('style');
    style.textContent = '.otp-slots { display: flex } .otp-slot { width: 2rem }';
    document.head.append(style);
    onTestFinished(() => style.remove());
    const slot = (index: number) =>
      host.querySelectorAll('.otp-slot')[index].getBoundingClientRect();
    const pointerDown = (index: number) => {
      const rect = slot(index);
      const event = new PointerEvent('pointerdown', {
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        cancelable: true,
      });
      input.dispatchEvent(event);
      return event;
    };

    // Before focus, the slot is remembered and selected when focus arrives.
    expect(pointerDown(1).defaultPrevented).toBe(false);
    input.focus();
    await fixture.whenStable();
    expect([input.selectionStart, input.selectionEnd]).toEqual([1, 2]);

    // While focused, the browser's caret placement is replaced.
    expect(pointerDown(0).defaultPrevented).toBe(true);
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, 1]);
    pointerDown(5);
    expect([input.selectionStart, input.selectionEnd]).toEqual([2, 2]);
  });

  it('focuses the first empty slot and clears through its API', async () => {
    const { fixture, input, component } = await setup();
    const otpInput = fixture.debugElement.query(By.directive(BsOtpInput)).injector.get(BsOtpInput);
    otpInput.focus();
    await fixture.whenStable();
    expect(document.activeElement).toBe(input);
    expect([input.selectionStart, input.selectionEnd]).toEqual([2, 2]);

    input.blur();
    otpInput.clear();
    await fixture.whenStable();
    expect(component.code.value).toBe('');
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(0);
  });

  it('applies size and validation classes', async () => {
    @Component({
      imports: [BsOtp, BsOtpInput],
      template: `
        <div bsOtp [size]="size()">
          <input bsOtpInput maxlength="4" aria-label="Code" [validation]="validation()" />
        </div>
      `,
    })
    class StateHost {
      readonly size = signal<'sm' | 'lg' | null>('sm');
      readonly validation = signal<'valid' | 'invalid'>('invalid');
    }
    const fixture = TestBed.createComponent(StateHost);
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement.querySelector('[bsOtp]');
    const input = host.querySelector('input')!;
    expect(host.classList).toContain('otp-sm');
    expect(host.classList).toContain('is-invalid');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(host.querySelectorAll('.otp-slot')).toHaveLength(4);

    fixture.componentInstance.size.set('lg');
    fixture.componentInstance.validation.set('valid');
    await fixture.whenStable();
    expect(host.classList).toContain('otp-lg');
    expect(host.classList).not.toContain('otp-sm');
    expect(host.classList).toContain('is-valid');
    expect(host.classList).not.toContain('is-invalid');
  });

  it('accepts letters and digits for the alphanumeric type', async () => {
    const { fixture, input, component } = await setup();
    component.type.set('alphanumeric');
    component.code.setValue('');
    input.focus();
    await fixture.whenStable();
    expect(input.getAttribute('pattern')).toBe('[A-Za-z0-9]*');
    await press('a1-');
    await fixture.whenStable();
    expect(component.code.value).toBe('a1');
  });

  it('follows the visible slots with taps and arrow keys in right-to-left layouts', async () => {
    const { fixture, host, input, component } = await setup();
    const style = document.createElement('style');
    style.textContent = '.otp-slots { display: flex } .otp-slot { width: 2rem }';
    document.head.append(style);
    host.dir = 'rtl';
    onTestFinished(() => style.remove());
    component.code.setValue('1234');
    input.focus();
    await fixture.whenStable();
    const slot = host.querySelectorAll('.otp-slot')[1].getBoundingClientRect();
    input.dispatchEvent(
      new PointerEvent('pointerdown', {
        clientX: slot.left + slot.width / 2,
        clientY: slot.top + slot.height / 2,
        cancelable: true,
      }),
    );
    expect([input.selectionStart, input.selectionEnd]).toEqual([1, 2]);

    await press('{ArrowLeft}');
    expect([input.selectionStart, input.selectionEnd]).toEqual([2, 3]);
    await press('{ArrowRight}{ArrowRight}');
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, 1]);
  });

  it('shows the restored value after a native form reset', async () => {
    @Component({
      imports: [BsOtp, BsOtpInput],
      template: `<form>
        <div bsOtp><input bsOtpInput maxlength="4" aria-label="Code" value="12" /></div>
      </form>`,
    })
    class FormHost {}
    const fixture = TestBed.createComponent(FormHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const input = root.querySelector('input')!;
    const slots = () =>
      Array.from(root.querySelectorAll('.otp-slot')).map((s) => s.textContent?.trim());
    input.focus();
    await press('34');
    await fixture.whenStable();
    expect(slots()).toEqual(['1', '2', '3', '4']);
    root.querySelector('form')!.reset();
    await vi.waitFor(() => expect(slots()).toEqual(['1', '2', '', '']));
  });
});
