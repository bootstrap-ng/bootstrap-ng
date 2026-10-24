import { ApplicationRef, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BsTypeahead, BsTypeaheadSearch, BsSubscribable } from './typeahead';

const FRUITS = ['Apple', 'Apricot', 'Banana', 'Cherry', 'Pineapple'];

interface Fruit {
  name: string;
}

@Component({
  imports: [BsTypeahead, ReactiveFormsModule],
  // Off screen, so the suggestions never open under the test runner's pointer, whose
  // pointermove would change the active suggestion.
  template: `
    <div style="position: fixed; top: -1000px">
      <input
        aria-label="Fruit"
        [bsTypeahead]="search()"
        [debounce]="debounce()"
        [minLength]="minLength()"
        [formatter]="formatter()"
        [formControl]="control"
        (itemSelect)="picked.set($event)" />
    </div>
  `,
})
class Host {
  readonly control = new FormControl('');
  readonly search = signal<BsTypeaheadSearch<unknown>>((term: string) =>
    FRUITS.filter((fruit) => fruit.toLowerCase().includes(term.toLowerCase())),
  );
  readonly debounce = signal(0);
  readonly minLength = signal(1);
  readonly formatter = signal<(item: unknown) => string>(String);
  readonly picked = signal<unknown>(null);
}

describe('BsTypeahead', () => {
  let host: Host;
  let input: HTMLInputElement;
  const listbox = () => document.querySelector<HTMLElement>('bs-typeahead-popup');
  const options = () => Array.from(document.querySelectorAll<HTMLElement>('[role=option]'));

  async function setup(): Promise<void> {
    const fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    document.body.append(fixture.nativeElement as HTMLElement);
    await fixture.whenStable();
    input = (fixture.nativeElement as HTMLElement).querySelector('input')!;
    input.focus();
  }

  function type(value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function key(name: string): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true });
    input.dispatchEvent(event);
    return event;
  }

  afterEach(() => input.blur());

  it('sets combobox ARIA on the input', async () => {
    await setup();
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-autocomplete')).toBe('list');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.getAttribute('autocomplete')).toBe('off');
  });

  it('shows matching suggestions with the term highlighted', async () => {
    await setup();
    type('ap');
    await vi.waitFor(() => expect(options().length).toBe(3));
    expect(listbox()!.classList).toContain('menu');
    expect(listbox()!.getAttribute('role')).toBe('listbox');
    await vi.waitFor(() => expect(input.getAttribute('aria-expanded')).toBe('true'));
    expect(input.getAttribute('aria-controls')).toBe(listbox()!.id);
    expect(options()[0].querySelector('strong')!.textContent).toBe('Ap');
    expect(options()[2].textContent.trim()).toBe('Pineapple');
    expect(options()[2].querySelector('strong')!.textContent).toBe('ap');
  });

  it('moves through suggestions with the arrow keys and picks one with Enter', async () => {
    await setup();
    type('ap');
    await vi.waitFor(() => expect(options().length).toBe(3));
    key('ArrowDown');
    await vi.waitFor(() => expect(options()[0].classList).toContain('active'));
    await vi.waitFor(() =>
      expect(input.getAttribute('aria-activedescendant')).toBe(options()[0].id),
    );
    expect(options()[0].getAttribute('aria-selected')).toBe('true');
    key('ArrowDown');
    key('ArrowDown');
    key('ArrowDown');
    // Past the end, focus returns to the input.
    await vi.waitFor(() => expect(input.hasAttribute('aria-activedescendant')).toBe(false));
    key('ArrowUp');
    await vi.waitFor(() => expect(options()[2].classList).toContain('active'));
    expect(key('Enter').defaultPrevented).toBe(true);
    expect(input.value).toBe('Pineapple');
    expect(host.control.value).toBe('Pineapple');
    expect(host.picked()).toBe('Pineapple');
    await vi.waitFor(() => expect(listbox()).toBeNull());
    await vi.waitFor(() => expect(input.getAttribute('aria-expanded')).toBe('false'));
  });

  it('keeps free text and leaves Enter alone without an active suggestion', async () => {
    await setup();
    type('Kiwi');
    expect(host.control.value).toBe('Kiwi');
    expect(key('Enter').defaultPrevented).toBe(false);
    expect(listbox()).toBeNull();
  });

  it('picks a suggestion with the mouse', async () => {
    await setup();
    type('ch');
    await vi.waitFor(() => expect(options().length).toBe(1));
    const pointerdown = new PointerEvent('pointerdown', { bubbles: true, cancelable: true });
    options()[0].dispatchEvent(pointerdown);
    expect(pointerdown.defaultPrevented).toBe(true);
    options()[0].dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
    options()[0].click();
    expect(host.control.value).toBe('Cherry');
  });

  it('closes on Escape, Tab and blur, and reopens with ArrowDown', async () => {
    await setup();
    type('an');
    await vi.waitFor(() => expect(listbox()).not.toBeNull());
    const escape = key('Escape');
    expect(escape.defaultPrevented).toBe(true);
    await vi.waitFor(() => expect(listbox()).toBeNull());
    expect(key('Escape').defaultPrevented).toBe(false);

    expect(key('ArrowDown').defaultPrevented).toBe(true);
    await vi.waitFor(() => expect(listbox()).not.toBeNull());
    key('Tab');
    await vi.waitFor(() => expect(listbox()).toBeNull());

    type('an');
    await vi.waitFor(() => expect(listbox()).not.toBeNull());
    input.blur();
    await vi.waitFor(() => expect(listbox()).toBeNull());
  });

  it('waits for minLength characters', async () => {
    await setup();
    host.minLength.set(2);
    await TestBed.inject(ApplicationRef).whenStable();
    type('a');
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(listbox()).toBeNull();
    expect(key('ArrowDown').defaultPrevented).toBe(false);
    type('ap');
    await vi.waitFor(() => expect(options().length).toBe(3));
  });

  it('debounces, and uses the latest answer of a promise search', async () => {
    await setup();
    const calls: string[] = [];
    host.debounce.set(30);
    host.search.set((term: string) => {
      calls.push(term);
      return new Promise((resolve) => setTimeout(() => resolve([`${term} result`]), 5));
    });
    await TestBed.inject(ApplicationRef).whenStable();
    type('a');
    type('ab');
    type('abc');
    await vi.waitFor(() => expect(options().length).toBe(1));
    expect(calls).toEqual(['abc']);
    expect(options()[0].textContent.trim()).toBe('abc result');
  });

  it('subscribes to an observable search and unsubscribes from a stale one', async () => {
    await setup();
    const unsubscribed: string[] = [];
    const nexts = new Map<string, (value: readonly unknown[]) => void>();
    const search = (term: string): BsSubscribable<readonly unknown[]> => ({
      subscribe(observer) {
        nexts.set(term, observer.next);
        return { unsubscribe: () => unsubscribed.push(term) };
      },
    });
    host.search.set(search);
    await TestBed.inject(ApplicationRef).whenStable();
    type('x');
    type('xy');
    expect(unsubscribed).toEqual(['x']);
    nexts.get('xy')!([{ name: 'Xylophone' }]);
    host.formatter.set((item) => (item as Fruit).name);
    await vi.waitFor(() => expect(options()[0]?.textContent.trim()).toBe('Xylophone'));
  });

  it('announces how many suggestions there are, and closes when none match', async () => {
    await setup();
    type('ap');
    await vi.waitFor(() =>
      expect(document.querySelector('[aria-live="polite"]')!.textContent).toBe(
        '3 suggestions available',
      ),
    );
    type('zzz');
    await vi.waitFor(() =>
      expect(document.querySelector('[aria-live="polite"]')!.textContent).toBe('No suggestions'),
    );
    expect(listbox()).toBeNull();
  });

  it('keeps listening to an observable search that first answers with no results', async () => {
    await setup();
    let next: ((value: readonly unknown[]) => void) | undefined;
    let unsubscribed = false;
    const results: BsSubscribable<readonly unknown[]> = {
      subscribe(observer) {
        next = observer.next;
        return { unsubscribe: () => (unsubscribed = true) };
      },
    };
    host.search.set(() => results);
    await TestBed.inject(ApplicationRef).whenStable();
    type('ap');
    next?.([]);
    expect(listbox()).toBeNull();
    expect(unsubscribed).toBe(false);
    next?.(['Apple']);
    await vi.waitFor(() => expect(options().map((o) => o.textContent.trim())).toEqual(['Apple']));
  });
});
