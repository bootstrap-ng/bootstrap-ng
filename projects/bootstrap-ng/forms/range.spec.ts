import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BsTheme } from 'bootstrap-ng/util';
import { BsRange, BsRangeInput } from './range';

@Component({
  imports: [ReactiveFormsModule, BsRange, BsRangeInput],
  template: `
    <div
      bsRange
      [bubble]="bubble()"
      [formatter]="format"
      [theme]="theme()"
      (valueChange)="changes.push($event)">
      <input
        type="range"
        bsRange
        [min]="min()"
        max="100"
        list="ticks"
        [formControl]="volume"
        aria-label="Volume" />
    </div>
    <datalist id="ticks">
      <option value="100" label="Loud"></option>
      <option value="0" label="Quiet"></option>
      <option value="50"></option>
    </datalist>
  `,
})
class Host {
  readonly bubble = signal(false);
  readonly theme = signal<BsTheme | null>(null);
  readonly min = signal(0);
  volume = new FormControl(25);
  changes: number[] = [];
  format = (value: number) => `${value}%`;
}

describe('BsRange', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const wrapper: HTMLElement = fixture.nativeElement.querySelector('div[bsRange]');
    const input: HTMLInputElement = wrapper.querySelector('input')!;
    const fill = () => wrapper.style.getPropertyValue('--bs-range-fill');
    return { fixture, wrapper, input, fill, host: fixture.componentInstance };
  }

  it('sets the fill from the value', async () => {
    const { fixture, wrapper, input, fill, host } = await setup();
    expect(wrapper.classList).toContain('form-range');
    expect(input.classList).toContain('form-range-input');
    expect(fill()).toBe('0.25');

    input.value = '75';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fill()).toBe('0.75');
    expect(host.volume.value).toBe(75);
    expect(host.changes).toEqual([75]);

    host.volume.setValue(10);
    await fixture.whenStable();
    expect(fill()).toBe('0.1');

    host.min.set(-100);
    await fixture.whenStable();
    expect(fill()).toBe('0.55');
  });

  it('shows a formatted value bubble', async () => {
    const { fixture, wrapper, host } = await setup();
    expect(wrapper.querySelector('.form-range-bubble')).toBeNull();
    host.bubble.set(true);
    await fixture.whenStable();
    const bubble = wrapper.querySelector('.form-range-bubble')!;
    expect(bubble.getAttribute('aria-hidden')).toBe('true');
    expect(bubble.textContent?.trim()).toBe('25%');
    // The bubble is hidden from screen readers, so the input carries the formatted value.
    expect(wrapper.querySelector('input')!.getAttribute('aria-valuetext')).toBe('25%');
  });

  it('renders sorted tick marks from the datalist', async () => {
    const { wrapper } = await setup();
    const ticks = wrapper.querySelector<HTMLElement>('.form-range-ticks')!;
    expect(ticks.style.gridTemplateColumns).toBe('0fr 0.5fr 0.5fr 0fr');
    const labels = Array.from(ticks.querySelectorAll('.form-range-tick')).map((tick) =>
      tick.textContent?.trim(),
    );
    expect(labels).toEqual(['Quiet', '', 'Loud']);
  });

  it('sets the theme class next to form-range', async () => {
    const { fixture, wrapper, host } = await setup();
    expect(wrapper.className).toBe('form-range');

    host.theme.set('success');
    await fixture.whenStable();
    expect(wrapper.classList).toContain('form-range');
    expect(wrapper.classList).toContain('theme-success');

    host.theme.set(null);
    await fixture.whenStable();
    expect(wrapper.className).toBe('form-range');
  });
});
