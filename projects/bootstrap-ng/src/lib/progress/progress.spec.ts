import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsProgress, BsProgressStacked } from './progress';

@Component({
  imports: [BsProgress, BsProgressStacked],
  template: `
    <bs-progress
      id="single"
      [value]="value()"
      [max]="200"
      theme="success"
      animated
      aria-label="Upload">
      {{ value() }}
    </bs-progress>
    <div bsProgressStacked>
      <bs-progress id="segment" [value]="30" aria-label="Segment" />
    </div>
  `,
})
class Host {
  readonly value = signal<unknown>(50);
}

describe('BsProgress', () => {
  it('sets ARIA values and bar width', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement.querySelector('#single');
    const bar = el.querySelector('.progress-bar') as HTMLElement;
    expect(el.classList).toContain('progress');
    expect(el.getAttribute('role')).toBe('progressbar');
    expect(el.getAttribute('aria-valuenow')).toBe('50');
    expect(el.getAttribute('aria-valuemax')).toBe('200');
    expect(el.getAttribute('aria-label')).toBe('Upload');
    expect(bar.style.width).toBe('25%');
    expect(bar.classList).toContain('theme-success');
    expect(bar.classList).toContain('progress-bar-striped');
    expect(bar.classList).toContain('progress-bar-animated');
    expect(bar.textContent.trim()).toBe('50');
  });

  it('clamps the width between 0 and 100 percent', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.value.set(500);
    await fixture.whenStable();
    const bar = fixture.nativeElement.querySelector('#single .progress-bar') as HTMLElement;
    expect(bar.style.width).toBe('100%');
  });

  it('clamps aria-valuenow to the range and treats a non-number as the minimum', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement.querySelector('#single');
    const bar = el.querySelector('.progress-bar') as HTMLElement;
    const cases: [unknown, string, string][] = [
      [500, '200', '100%'],
      [-10, '0', '0%'],
      ['abc', '0', '0%'],
      [null, '0', '0%'],
    ];
    for (const [value, now, width] of cases) {
      fixture.componentInstance.value.set(value);
      await fixture.whenStable();
      expect(el.getAttribute('aria-valuenow')).toBe(now);
      expect(bar.style.width).toBe(width);
    }
  });

  it('sets the width on the progress element when stacked', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement.querySelector('#segment');
    expect(el.parentElement?.classList).toContain('progress-stacked');
    expect(el.style.width).toBe('30%');
    expect((el.querySelector('.progress-bar') as HTMLElement).style.width).toBe('');
  });
});
