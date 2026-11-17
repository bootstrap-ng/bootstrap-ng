import { ApplicationRef, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { BsFormControl } from 'bootstrap-ng/forms';
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

const FRUIT_OBJECTS: Fruit[] = FRUITS.map((name) => ({ name }));
const searchFruits = (term: string): Fruit[] =>
  FRUIT_OBJECTS.filter((fruit) => fruit.name.toLowerCase().includes(term.toLowerCase()));
const fruitName = (fruit: Fruit): string => fruit.name;

@Component({
  imports: [BsTypeahead, BsFormControl, ReactiveFormsModule],
  template: `
    <div style="position: fixed; top: -1000px">
      <input
        aria-label="Fruit"
        bsFormControl
        [bsTypeahead]="search"
        [debounce]="0"
        [formatter]="name"
        [editable]="editable()"
        [formControl]="control" />
    </div>
  `,
})
class ReactiveObjectHost {
  readonly control = new FormControl<Fruit | string | null>(null, Validators.required);
  readonly search = searchFruits;
  readonly name = fruitName;
  readonly editable = signal(true);
}

@Component({
  imports: [BsTypeahead, BsFormControl, FormField],
  template: `
    <div style="position: fixed; top: -1000px">
      <input
        aria-label="Fruit"
        bsFormControl
        [bsTypeahead]="search"
        [debounce]="0"
        [formatter]="name"
        editable="false"
        [formField]="fruitForm.fruit" />
    </div>
  `,
})
class SignalObjectHost {
  readonly model = signal<{ fruit: Fruit | null }>({ fruit: null });
  readonly fruitForm = form(this.model, (path) => {
    required(path.fruit);
  });
  readonly search = searchFruits;
  readonly name = fruitName;
}

@Component({
  imports: [BsTypeahead, FormsModule],
  template: `
    <div style="position: fixed; top: -1000px">
      <input
        aria-label="Fruit"
        [bsTypeahead]="search"
        [debounce]="0"
        [formatter]="name"
        [(ngModel)]="fruit" />
    </div>
  `,
})
class NgModelObjectHost {
  readonly fruit = signal<Fruit | string | null>({ name: 'Banana' });
  readonly search = searchFruits;
  readonly name = fruitName;
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

  describe('with object values', () => {
    async function render<T>(component: new () => T): Promise<T> {
      const fixture = TestBed.createComponent(component);
      document.body.append(fixture.nativeElement as HTMLElement);
      await fixture.whenStable();
      input = (fixture.nativeElement as HTMLElement).querySelector('input')!;
      input.focus();
      return fixture.componentInstance;
    }

    async function pick(term: string, index = 0): Promise<void> {
      type(term);
      await vi.waitFor(() => expect(options().length).toBeGreaterThan(index));
      options()[index].click();
    }

    it('sets a reactive form control to the picked object and typed text to a string', async () => {
      const objectHost = await render(ReactiveObjectHost);
      await pick('ch');
      expect(objectHost.control.value).toEqual({ name: 'Cherry' });
      expect(input.value).toBe('Cherry');
      type('Cherr');
      expect(objectHost.control.value).toBe('Cherr');
    });

    it('sets the value to null for typed text when not editable, and shows it as invalid', async () => {
      const objectHost = await render(ReactiveObjectHost);
      objectHost.editable.set(false);
      await TestBed.inject(ApplicationRef).whenStable();
      type('Kiwi');
      expect(objectHost.control.value).toBeNull();
      expect(input.value).toBe('Kiwi');
      input.blur();
      expect(objectHost.control.touched).toBe(true);
      await vi.waitFor(() => expect(input.classList).toContain('is-invalid'));
      input.focus();
      await pick('ban');
      expect(objectHost.control.value).toEqual({ name: 'Banana' });
      await vi.waitFor(() => expect(input.classList).not.toContain('is-invalid'));
    });

    it('formats objects written by the form and shows strings as they are', async () => {
      const objectHost = await render(ReactiveObjectHost);
      objectHost.control.setValue({ name: 'Apricot' });
      expect(input.value).toBe('Apricot');
      objectHost.control.setValue('Kiwi');
      expect(input.value).toBe('Kiwi');
      objectHost.control.setValue(null);
      expect(input.value).toBe('');
      objectHost.control.disable();
      expect(input.disabled).toBe(true);
      objectHost.control.enable();
      expect(input.disabled).toBe(false);
    });

    it('binds an object with [formField] and follows its validation', async () => {
      const objectHost = await render(SignalObjectHost);
      type('Kiwi');
      input.blur();
      expect(objectHost.fruitForm.fruit().touched()).toBe(true);
      expect(objectHost.model().fruit).toBeNull();
      await vi.waitFor(() => expect(input.classList).toContain('is-invalid'));
      input.focus();
      await pick('pine');
      expect(objectHost.model().fruit).toEqual({ name: 'Pineapple' });
      await vi.waitFor(() => expect(input.classList).not.toContain('is-invalid'));
      objectHost.model.set({ fruit: { name: 'Apple' } });
      await TestBed.inject(ApplicationRef).whenStable();
      expect(input.value).toBe('Apple');
    });

    it('binds an object with ngModel', async () => {
      const objectHost = await render(NgModelObjectHost);
      await vi.waitFor(() => expect(input.value).toBe('Banana'));
      await pick('app', 1);
      expect(objectHost.fruit()).toEqual({ name: 'Pineapple' });
    });
  });
});
