import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import fc from 'fast-check';
import { BsStrength, BsStrengthText, passwordScore } from './strength';

describe('passwordScore', () => {
  it('scores like Bootstrap', () => {
    expect(passwordScore('')).toBe(0);
    expect(passwordScore('abc')).toBe(1);
    expect(passwordScore('abcdefgh')).toBe(2);
    expect(passwordScore('Abcdefgh1!')).toBe(5);
    expect(passwordScore('Abcdefgh1!@#xyzw')).toBe(8);
    expect(passwordScore('abcdefgh', 8, { lowercase: 0 })).toBe(1);
  });

  it('scores between 0 and 8 and never drops as the password grows', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), fc.integer({ min: 0, max: 32 }), (start, end, min) => {
        const score = passwordScore(start, min);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(8);
        expect(passwordScore(start + end, min)).toBeGreaterThanOrEqual(score);
      }),
    );
  });
});

describe('BsStrength', () => {
  @Component({
    imports: [BsStrength, BsStrengthText],
    template: `
      <input #password type="password" aria-label="Password" />
      <div bsStrength #meter="bsStrength" [input]="password"></div>
      <span [bsStrengthText]="meter"></span>
      <div bsStrength="fair" variant="bar" id="static"></div>
      <div bsStrength id="bound" [password]="value()" [messages]="{ strong: 'Excellent!' }"></div>
    `,
  })
  class Host {
    readonly value = signal<string | null>(null);
  }

  it('scores the typed password and shows the level', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const meter = root.querySelector<HTMLElement>('[bsStrength]')!;
    const text = root.querySelector<HTMLElement>('.strength-text')!;
    const input = root.querySelector('input')!;
    expect(meter.classList).toContain('strength');
    expect(meter.querySelectorAll('.strength-segment')).toHaveLength(4);
    expect(meter.hasAttribute('data-bs-strength')).toBe(false);
    expect(text.textContent).toBe('');

    input.value = 'Abcdefgh1!';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(meter.getAttribute('data-bs-strength')).toBe('good');
    expect(meter.querySelectorAll('.strength-segment.active')).toHaveLength(3);
    expect(meter.getAttribute('role')).toBe('meter');
    expect(meter.getAttribute('aria-valuenow')).toBe('3');
    expect(meter.getAttribute('aria-valuetext')).toBe('Good');
    expect(text.textContent).toBe('Good');
    expect(text.getAttribute('aria-live')).toBe('polite');
    expect(text.style.getPropertyValue('--bs-strength-color')).toBe('var(--bs-info-fg-emphasis)');
  });

  it('supports static levels, the bar and a bound password', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const bar = root.querySelector<HTMLElement>('#static')!;
    expect(bar.classList).toContain('strength-bar');
    expect(bar.children).toHaveLength(0);
    expect(bar.getAttribute('data-bs-strength')).toBe('fair');
    fixture.componentInstance.value.set('Abcdefgh1!@#xyzw');
    await fixture.whenStable();
    const bound = root.querySelector<HTMLElement>('#bound')!;
    expect(bound.getAttribute('data-bs-strength')).toBe('strong');
    expect(bound.getAttribute('aria-valuetext')).toBe('Excellent!');
  });

  it('rescores when a form writes the input without an input event', async () => {
    @Component({
      imports: [BsStrength, ReactiveFormsModule],
      template: `
        <input #password type="password" aria-label="Password" [formControl]="pw" />
        <div bsStrength [input]="password"></div>
        <button type="button" (click)="pw.setValue('Abcdefgh1!')">Fill</button>
        <button type="button" id="reset" (click)="pw.reset()">Reset</button>
      `,
    })
    class FormHost {
      readonly pw = new FormControl('');
    }
    const fixture = TestBed.createComponent(FormHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const meter = root.querySelector<HTMLElement>('[bsStrength]')!;
    root.querySelector<HTMLButtonElement>('button')!.click();
    await fixture.whenStable();
    expect(meter.getAttribute('data-bs-strength')).toBe('good');
    root.querySelector<HTMLButtonElement>('#reset')!.click();
    await fixture.whenStable();
    expect(meter.hasAttribute('data-bs-strength')).toBe(false);
  });
});
