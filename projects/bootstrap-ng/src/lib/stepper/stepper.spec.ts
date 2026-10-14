import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BsStepper, BsStepperItem } from './stepper';

@Component({
  imports: [BsStepper, BsStepperItem],
  template: `
    <ol bsStepper #stepper="bsStepper" [(step)]="step" [horizontal]="horizontal()">
      <li bsStepperItem>One</li>
      <li bsStepperItem theme="success">Two</li>
      <li bsStepperItem>Three</li>
    </ol>
    <button type="button" class="next" (click)="stepper.next()">Next</button>
    <button type="button" class="previous" (click)="stepper.previous()">Previous</button>
  `,
})
class Host {
  readonly step = signal(1);
  readonly horizontal = signal<boolean | 'md'>(true);
}

@Component({
  imports: [BsStepper],
  template: `<ol bsStepper [(step)]="step"></ol>`,
})
class EmptyHost {
  readonly step = signal(0);
  readonly stepper = viewChild.required(BsStepper);
}

describe('BsStepper', () => {
  it('marks done and current steps', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const stepper = root.querySelector('ol')!;
    expect(stepper.className).toBe('stepper stepper-horizontal');
    const items = () => Array.from(root.querySelectorAll('li'));
    expect(items().map((item) => item.classList.contains('active'))).toEqual([true, true, false]);
    expect(items()[1].getAttribute('aria-current')).toBe('step');
    expect(items()[1].classList).toContain('theme-success');

    root.querySelector<HTMLButtonElement>('.next')!.click();
    root.querySelector<HTMLButtonElement>('.next')!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.step()).toBe(2);
    expect(items()[2].getAttribute('aria-current')).toBe('step');
    expect(items()[1].hasAttribute('aria-current')).toBe(false);

    fixture.componentInstance.horizontal.set('md');
    await fixture.whenStable();
    expect(stepper.className).toBe('stepper md:stepper-horizontal');
  });

  it('stays on step 0 when there are no steps', async () => {
    const fixture = TestBed.createComponent(EmptyHost);
    await fixture.whenStable();
    fixture.componentInstance.stepper().next();
    await fixture.whenStable();
    expect(fixture.componentInstance.step()).toBe(0);
  });
});
