import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BsCheckSize } from './check';
import { BsFormField, BsLabel } from './form-field';
import { BsSwitch, BsSwitchInput } from './switch';

@Component({
  imports: [ReactiveFormsModule, BsSwitch, BsSwitchInput, BsFormField, BsLabel],
  template: `
    <div bsFormField>
      <div bsSwitch theme="success" [size]="size()">
        <input type="checkbox" bsSwitch [formControl]="on" />
      </div>
      <label bsLabel>Notifications</label>
    </div>
  `,
})
class Host {
  readonly size = signal<BsCheckSize>('md');
  on = new FormControl(false);
}

describe('BsSwitch', () => {
  it('renders the wrapper and the switch input', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const wrapper: HTMLElement = fixture.nativeElement.querySelector('div[bsSwitch]');
    const input: HTMLInputElement = wrapper.querySelector('input')!;
    expect(wrapper.className).toBe('switch theme-success');
    expect(input.getAttribute('role')).toBe('switch');
    expect(input.hasAttribute('switch')).toBe(true);
    expect(fixture.nativeElement.querySelector('label').htmlFor).toBe(input.id);

    fixture.componentInstance.size.set('sm');
    await fixture.whenStable();
    expect(wrapper.classList).toContain('switch-sm');

    fixture.nativeElement.querySelector('label').click();
    expect(fixture.componentInstance.on.value).toBe(true);
  });
});
