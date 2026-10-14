import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BsAccordion, BsAccordionBody, BsAccordionHeader, BsAccordionItem } from './accordion';

@Component({
  imports: [BsAccordion, BsAccordionItem, BsAccordionHeader, BsAccordionBody],
  template: `
    <div bsAccordion theme="primary" size="sm" [exclusive]="exclusive()">
      <details bsAccordionItem [(open)]="first">
        <summary bsAccordionHeader>One</summary>
        <div bsAccordionBody>Body one</div>
      </details>
      <details bsAccordionItem>
        <summary bsAccordionHeader>Two</summary>
        <div bsAccordionBody>Body two</div>
      </details>
    </div>
  `,
})
class Host {
  readonly exclusive = signal(true);
  readonly first = signal(true);
}

@Component({
  imports: [BsAccordion, BsAccordionItem, BsAccordionHeader, BsAccordionBody],
  template: `
    <div bsAccordion flush>
      <details bsAccordionItem #item="bsAccordionItem" (openChange)="changes.push($event)">
        <summary bsAccordionHeader>One</summary>
        <div bsAccordionBody>Body one</div>
      </details>
    </div>
  `,
})
class MethodsHost {
  changes: boolean[] = [];
}

describe('BsAccordion', () => {
  it('renders Bootstrap markup', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement.querySelector('[bsAccordion]');
    expect([...root.classList].sort()).toEqual(['accordion', 'accordion-sm', 'theme-primary']);
    const items = root.querySelectorAll('details');
    expect(items[0].classList).toContain('accordion-item');
    expect(items[0].querySelector('summary')?.classList).toContain('accordion-header');
    expect(items[0].querySelector('summary svg.accordion-icon')).not.toBeNull();
    expect(items[0].querySelector('.accordion-body')?.textContent).toBe('Body one');
  });

  it('shares a group name only when exclusive', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const items: NodeListOf<HTMLDetailsElement> = fixture.nativeElement.querySelectorAll('details');
    const name = items[0].getAttribute('name');
    expect(name).toMatch(/^bs-accordion-\d+$/);
    expect(items[1].getAttribute('name')).toBe(name);

    fixture.componentInstance.exclusive.set(false);
    await fixture.whenStable();
    expect(items[0].hasAttribute('name')).toBe(false);
  });

  it('syncs open state both ways', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const first: HTMLDetailsElement = fixture.nativeElement.querySelector('details');
    expect(first.open).toBe(true);

    fixture.componentInstance.first.set(false);
    await fixture.whenStable();
    expect(first.open).toBe(false);

    first.open = true;
    first.dispatchEvent(new Event('toggle'));
    await fixture.whenStable();
    expect(fixture.componentInstance.first()).toBe(true);
  });

  it('closes the other items when one opens', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const items: NodeListOf<HTMLDetailsElement> = fixture.nativeElement.querySelectorAll('details');
    items[1].querySelector('summary')!.click();
    await vi.waitFor(() => expect(fixture.componentInstance.first()).toBe(false));
    expect(items[0].open).toBe(false);
    expect(items[1].open).toBe(true);
  });

  it('opens and closes from its methods', async () => {
    const fixture = TestBed.createComponent(MethodsHost);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement.querySelector('[bsAccordion]');
    expect(root.classList).toContain('accordion-flush');
    const details: HTMLDetailsElement = root.querySelector('details')!;
    const item = fixture.debugElement
      .query(By.directive(BsAccordionItem))
      .injector.get(BsAccordionItem);

    // Let the browser's toggle event for each change fire before the next one.
    const settle = async () => {
      await fixture.whenStable();
      await new Promise((resolve) => setTimeout(resolve));
    };

    item.show();
    await settle();
    expect(details.open).toBe(true);
    item.toggle();
    await settle();
    expect(details.open).toBe(false);
    item.hide();
    await settle();
    expect(item.isOpen()).toBe(false);
    expect(fixture.componentInstance.changes).toEqual([true, false]);
  });
});
