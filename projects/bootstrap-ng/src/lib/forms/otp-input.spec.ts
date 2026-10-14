import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BsOtp, BsOtpInput, BsOtpType } from './otp-input';

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
    input.setSelectionRange(0, 1);
    await beforeInput('insertText', '9');
    expect(component.code.value).toBe('92');
    await beforeInput('insertText', 'x');
    expect(component.code.value).toBe('92');
    expect(slots()[0]).toBe('9');
    input.setSelectionRange(2, 2);
    await beforeInput('deleteContentBackward');
    expect(component.code.value).toBe('9');
  });

  it('replaces a selection of several characters', async () => {
    const { fixture, input, beforeInput, component } = await setup();
    component.code.setValue('123456');
    input.focus();
    await fixture.whenStable();
    input.setSelectionRange(0, 6);
    await beforeInput('insertText', '9');
    expect(component.code.value).toBe('9');
    component.code.setValue('123456');
    await fixture.whenStable();
    input.setSelectionRange(2, 4);
    await beforeInput('insertText', '0');
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
});
