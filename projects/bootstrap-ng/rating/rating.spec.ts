import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { BsRating, BsRatingStar } from './rating';

function key(element: HTMLElement, name: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true });
  element.dispatchEvent(event);
  return event;
}

function pointer(star: HTMLElement, type: 'click' | 'pointermove', ratio = 0.75): void {
  const { left, top, width } = star.getBoundingClientRect();
  const init = { bubbles: true, clientX: left + width * ratio, clientY: top + 1 };
  star.dispatchEvent(type === 'click' ? new MouseEvent(type, init) : new PointerEvent(type, init));
}

describe('BsRating', () => {
  @Component({
    imports: [BsRating],
    template: `<div
      bsRating
      aria-label="Rating"
      [max]="max()"
      [allowHalf]="half()"
      [readonly]="readonly()"
      [resettable]="resettable()"
      [disabled]="disabled()"
      [size]="size()"
      [(value)]="value"></div>`,
  })
  class Host {
    readonly value = signal(3);
    readonly max = signal(5);
    readonly half = signal(false);
    readonly readonly = signal(false);
    readonly resettable = signal(false);
    readonly disabled = signal(false);
    readonly size = signal<'sm' | 'md' | 'lg'>('md');
  }

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = fixture.nativeElement.querySelector('[bsRating]') as HTMLElement;
    const stars = () => Array.from(host.children) as HTMLElement[];
    const filled = () =>
      stars().map((star) => {
        const clip = star.querySelector<HTMLElement>('span');
        return clip ? parseFloat(clip.style.width) / 100 : 0;
      });
    return { fixture, host, stars, filled, component: fixture.componentInstance };
  }

  it('renders a slider with a star per point', async () => {
    const { host, stars, filled } = await setup();
    expect(host.getAttribute('role')).toBe('slider');
    expect(host.tabIndex).toBe(0);
    expect(host.getAttribute('aria-valuemin')).toBe('0');
    expect(host.getAttribute('aria-valuemax')).toBe('5');
    expect(host.getAttribute('aria-valuenow')).toBe('3');
    expect(host.getAttribute('aria-valuetext')).toBe('3 out of 5');
    expect(host.id).toMatch(/^bs-control/);
    expect(host.classList).toContain('fs-xl');
    expect(stars()).toHaveLength(5);
    expect(filled()).toEqual([1, 1, 1, 0, 0]);
    expect(stars()[0].querySelector('span')!.classList).toContain('fg-warning');
  });

  it('follows max, size and fractional values', async () => {
    const { fixture, host, stars, filled, component } = await setup();
    component.max.set(10);
    component.size.set('lg');
    component.value.set(2.5);
    await fixture.whenStable();
    expect(stars()).toHaveLength(10);
    expect(host.classList).toContain('fs-3xl');
    expect(filled().slice(0, 4)).toEqual([1, 1, 0.5, 0]);
  });

  it('changes the value with the keyboard', async () => {
    const { fixture, host, component } = await setup();
    expect(key(host, 'ArrowRight').defaultPrevented).toBe(true);
    expect(component.value()).toBe(4);
    key(host, 'ArrowUp');
    key(host, 'ArrowUp');
    expect(component.value()).toBe(5);
    key(host, 'ArrowLeft');
    key(host, 'ArrowDown');
    expect(component.value()).toBe(3);
    key(host, 'Home');
    expect(component.value()).toBe(1);
    key(host, 'ArrowLeft');
    expect(component.value()).toBe(1);
    key(host, 'End');
    expect(component.value()).toBe(5);
    expect(key(host, 'Delete').defaultPrevented).toBe(false);
    expect(key(host, 'a').defaultPrevented).toBe(false);
    expect(component.value()).toBe(5);
    await fixture.whenStable();
    expect(host.getAttribute('aria-valuenow')).toBe('5');
  });

  it('steps by half a star with allowHalf', async () => {
    const { fixture, host, component } = await setup();
    component.half.set(true);
    component.value.set(2.7);
    await fixture.whenStable();
    key(host, 'ArrowRight');
    expect(component.value()).toBe(3);
    key(host, 'ArrowRight');
    expect(component.value()).toBe(3.5);
    key(host, 'ArrowLeft');
    key(host, 'ArrowLeft');
    expect(component.value()).toBe(2.5);
    key(host, 'Home');
    expect(component.value()).toBe(0.5);
  });

  it('swaps the arrow keys in right-to-left layouts', async () => {
    const { host, component } = await setup();
    host.dir = 'rtl';
    key(host, 'ArrowLeft');
    expect(component.value()).toBe(4);
    key(host, 'ArrowRight');
    key(host, 'ArrowRight');
    expect(component.value()).toBe(2);
  });

  it('clears the value when resettable', async () => {
    const { fixture, host, stars, component } = await setup();
    component.resettable.set(true);
    await fixture.whenStable();
    key(host, 'Home');
    expect(component.value()).toBe(0);
    component.value.set(4);
    await fixture.whenStable();
    key(host, 'Backspace');
    expect(component.value()).toBe(0);
    pointer(stars()[1], 'click');
    expect(component.value()).toBe(2);
    pointer(stars()[1], 'click');
    expect(component.value()).toBe(0);
  });

  it('previews on hover and sets the value on click', async () => {
    const { fixture, host, stars, filled, component } = await setup();
    pointer(stars()[4], 'pointermove');
    await fixture.whenStable();
    expect(filled()).toEqual([1, 1, 1, 1, 1]);
    expect(host.getAttribute('aria-valuenow')).toBe('3');
    host.dispatchEvent(new PointerEvent('pointerleave'));
    await fixture.whenStable();
    expect(filled()).toEqual([1, 1, 1, 0, 0]);
    pointer(stars()[1], 'click');
    expect(component.value()).toBe(2);
    pointer(stars()[1], 'click');
    expect(component.value()).toBe(2);
  });

  it('picks half stars with the pointer', async () => {
    const { fixture, host, stars, component } = await setup();
    component.half.set(true);
    await fixture.whenStable();
    pointer(stars()[3], 'click', 0.25);
    expect(component.value()).toBe(3.5);
    pointer(stars()[3], 'click', 0.75);
    expect(component.value()).toBe(4);
    host.dir = 'rtl';
    pointer(stars()[3], 'click', 0.75);
    expect(component.value()).toBe(3.5);
  });

  it('ignores input when readonly or disabled', async () => {
    const { fixture, host, stars, component } = await setup();
    component.readonly.set(true);
    await fixture.whenStable();
    expect(host.getAttribute('aria-readonly')).toBe('true');
    expect(host.tabIndex).toBe(0);
    expect(host.style.cursor).toBe('');
    key(host, 'ArrowRight');
    pointer(stars()[4], 'pointermove');
    pointer(stars()[4], 'click');
    expect(component.value()).toBe(3);

    component.readonly.set(false);
    component.disabled.set(true);
    await fixture.whenStable();
    expect(host.getAttribute('aria-disabled')).toBe('true');
    expect(host.hasAttribute('tabindex')).toBe(false);
    expect(host.classList).toContain('opacity-50');
    key(host, 'ArrowRight');
    pointer(stars()[4], 'click');
    expect(component.value()).toBe(3);
  });

  it('works with reactive forms', async () => {
    @Component({
      imports: [ReactiveFormsModule, BsRating],
      template: `<div bsRating aria-label="Rating" [formControl]="rating"></div>`,
    })
    class FormHost {
      readonly rating = new FormControl<number | null>(null, Validators.min(1));
    }
    const fixture = TestBed.createComponent(FormHost);
    await fixture.whenStable();
    const host = fixture.nativeElement.querySelector('[bsRating]') as HTMLElement;
    const { rating } = fixture.componentInstance;
    expect(host.getAttribute('aria-valuenow')).toBe('0');

    rating.setValue(2);
    await fixture.whenStable();
    expect(host.getAttribute('aria-valuenow')).toBe('2');

    key(host, 'ArrowRight');
    expect(rating.value).toBe(3);

    rating.setValue(0);
    host.dispatchEvent(new FocusEvent('focusout'));
    await fixture.whenStable();
    expect(rating.touched).toBe(true);
    expect(host.classList).toContain('is-invalid');
    expect(host.getAttribute('aria-invalid')).toBe('true');
    expect(host.querySelector('svg')!.classList).toContain('fg-danger');

    rating.disable();
    await fixture.whenStable();
    expect(host.getAttribute('aria-disabled')).toBe('true');
  });

  it('works with signal forms', async () => {
    @Component({
      imports: [FormField, BsRating],
      template: `<div bsRating aria-label="Rating" [formField]="f.stars"></div>`,
    })
    class SignalHost {
      readonly model = signal({ stars: 4 });
      readonly f = form(this.model, (path) => {
        required(path.stars);
      });
    }
    const fixture = TestBed.createComponent(SignalHost);
    await fixture.whenStable();
    const host = fixture.nativeElement.querySelector('[bsRating]') as HTMLElement;
    expect(host.getAttribute('aria-valuenow')).toBe('4');
    key(host, 'ArrowLeft');
    expect(fixture.componentInstance.model().stars).toBe(3);
  });

  it('renders a custom star template', async () => {
    @Component({
      imports: [BsRating, BsRatingStar],
      template: `<div bsRating aria-label="Rating" [value]="2.5">
        <ng-template bsRatingStar let-fill let-i="index">{{ i }}:{{ fill }}</ng-template>
      </div>`,
    })
    class TemplateHost {}
    const fixture = TestBed.createComponent(TemplateHost);
    await fixture.whenStable();
    const host = fixture.nativeElement.querySelector('[bsRating]') as HTMLElement;
    expect(host.querySelector('svg')).toBeNull();
    expect(Array.from(host.children).map((star) => star.textContent?.trim())).toEqual([
      '0:1',
      '1:1',
      '2:0.5',
      '3:0',
      '4:0',
    ]);
  });

  it('formats the value text', async () => {
    @Component({
      imports: [BsRating],
      template: `<div bsRating aria-label="Rating" max="10" [value]="7" [valueText]="text"></div>`,
    })
    class TextHost {
      readonly text = (value: number, max: number) => `${String(value)}/${String(max)} stars`;
    }
    const fixture = TestBed.createComponent(TextHost);
    await fixture.whenStable();
    const host = fixture.nativeElement.querySelector('[bsRating]') as HTMLElement;
    expect(host.getAttribute('aria-valuetext')).toBe('7/10 stars');
  });
});
