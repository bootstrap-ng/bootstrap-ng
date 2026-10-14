import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BsTheme } from '../util/theme';
import { BsCheck, BsCheckSize, BsRadio } from './check';
import { BsFormField, BsLabel } from './form-field';

describe('BsCheck', () => {
  @Component({
    imports: [ReactiveFormsModule, BsCheck, BsFormField, BsLabel],
    template: `
      <div bsFormField>
        <input
          type="checkbox"
          bsCheck
          [theme]="theme()"
          [size]="size()"
          [(indeterminate)]="indeterminate"
          [formControl]="checked" />
        <label bsLabel>Check</label>
      </div>
    `,
  })
  class Host {
    readonly theme = signal<BsTheme | null>(null);
    readonly size = signal<BsCheckSize>('md');
    readonly indeterminate = signal(true);
    checked = new FormControl(false);
  }

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    return { fixture, input, host: fixture.componentInstance };
  }

  it('renders classes', async () => {
    const { fixture, input, host } = await setup();
    expect(input.classList).toContain('check');
    expect(input.classList).not.toContain('check-md');
    host.theme.set('success');
    host.size.set('lg');
    await fixture.whenStable();
    expect(input.classList).toContain('theme-success');
    expect(input.classList).toContain('check-lg');
  });

  it('syncs the indeterminate state', async () => {
    const { fixture, input, host } = await setup();
    expect(input.indeterminate).toBe(true);
    fixture.nativeElement.querySelector('label').click();
    await fixture.whenStable();
    expect(input.indeterminate).toBe(false);
    expect(host.indeterminate()).toBe(false);
    expect(host.checked.value).toBe(true);
  });
});

describe('BsRadio', () => {
  @Component({
    imports: [ReactiveFormsModule, BsRadio],
    template: `
      <input type="radio" bsRadio value="a" [formControl]="choice" aria-label="A" />
      <input
        type="radio"
        bsRadio
        value="b"
        size="sm"
        theme="danger"
        [formControl]="choice"
        aria-label="B" />
    `,
  })
  class Host {
    choice = new FormControl('a');
  }

  it('renders classes and works with forms', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [a, b] = fixture.nativeElement.querySelectorAll('input');
    expect(a.classList).toContain('radio');
    expect(b.classList).toContain('theme-danger');
    expect(b.classList).toContain('radio-sm');
    expect(a.checked).toBe(true);
    b.click();
    expect(fixture.componentInstance.choice.value).toBe('b');
  });
});
