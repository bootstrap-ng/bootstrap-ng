import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  BsCombobox,
  BsComboboxMenu,
  BsComboboxNoResults,
  BsComboboxOption,
  BsComboboxSearch,
  provideBsComboboxConfig,
} from './combobox';
import { BsFormField, BsFormLabel } from 'bootstrap-ng/forms';

const IMPORTS = [
  ReactiveFormsModule,
  BsCombobox,
  BsComboboxMenu,
  BsComboboxOption,
  BsComboboxSearch,
  BsComboboxNoResults,
  BsFormField,
  BsFormLabel,
];

@Component({
  imports: IMPORTS,
  template: `
    <div bsFormField>
      <label bsFormLabel>Country</label>
      <button
        bsCombobox
        name="country"
        placeholder="Pick one…"
        [menu]="menu"
        [formControl]="country"></button>
      <div bsComboboxMenu #menu="bsComboboxMenu">
        <div class="combobox-search">
          <input bsComboboxSearch aria-label="Search" />
        </div>
        <button bsComboboxOption value="us">United States</button>
        <button bsComboboxOption value="ca">
          <span class="menu-item-content"><span>Canada</span><small>North</small></span>
        </button>
        <button bsComboboxOption value="mx" disabled>México</button>
        <div bsComboboxNoResults>No results</div>
      </div>
    </div>
  `,
})
class Host {
  country = new FormControl<string | null>(null);
}

describe('BsCombobox', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const toggle = root.querySelector<HTMLButtonElement>('[bsCombobox]')!;
    const menu = root.querySelector<HTMLElement>('[bsComboboxMenu]')!;
    const options = Array.from(menu.querySelectorAll<HTMLButtonElement>('[bsComboboxOption]'));
    return { fixture, root, toggle, menu, options, host: fixture.componentInstance };
  }

  it('renders the toggle, placeholder and ARIA attributes', async () => {
    const { root, toggle, menu, options } = await setup();
    expect(toggle.classList).toContain('form-control');
    expect(toggle.classList).toContain('combobox-toggle');
    expect(toggle.type).toBe('button');
    expect(toggle.getAttribute('role')).toBe('combobox');
    expect(toggle.getAttribute('aria-haspopup')).toBe('listbox');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-controls')).toBe(`${menu.id}-listbox`);
    expect(root.querySelector('label')!.htmlFor).toBe(toggle.id);
    const value = toggle.querySelector('.combobox-value')!;
    expect(value.textContent?.trim()).toBe('Pick one…');
    expect(value.classList).toContain('combobox-placeholder');
    const listbox = menu.querySelector('[role="listbox"]')!;
    expect(listbox.id).toBe(`${menu.id}-listbox`);
    expect(listbox.querySelector('input')).toBeNull();
    expect(menu.querySelector('.combobox-search')!.parentElement).toBe(menu);
    expect(listbox.getAttribute('aria-labelledby')).toBe(toggle.id);
    expect(options[0].getAttribute('role')).toBe('option');
    // Options are reached with the arrow keys, so the listbox is a single tab stop.
    expect(options[0].getAttribute('tabindex')).toBe('-1');
    expect(options[0].getAttribute('aria-selected')).toBe('false');
    expect(options[2].disabled).toBe(true);
  });

  it('selects an option and closes', async () => {
    const { fixture, toggle, menu, options, host } = await setup();
    toggle.click();
    await fixture.whenStable();
    expect(menu.classList).toContain('show');
    options[1].click();
    await fixture.whenStable();
    expect(host.country.value).toBe('ca');
    expect(menu.classList).not.toContain('show');
    expect(toggle.querySelector('.combobox-value')!.textContent?.trim()).toBe('Canada');
    expect(options[1].classList).toContain('selected');
    expect(options[1].getAttribute('aria-selected')).toBe('true');
    expect(toggle.querySelector<HTMLInputElement>('input[type=hidden]')!.value).toBe('ca');
  });

  it('shows values written by the form', async () => {
    const { fixture, toggle, host } = await setup();
    host.country.setValue('us');
    await fixture.whenStable();
    expect(toggle.querySelector('.combobox-value')!.textContent?.trim()).toBe('United States');
  });

  it('filters options with the search field', async () => {
    const { fixture, toggle, root, options } = await setup();
    toggle.click();
    await fixture.whenStable();
    const search = root.querySelector<HTMLInputElement>('[bsComboboxSearch]')!;
    search.value = 'mexico';
    search.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(options.map((o) => o.classList.contains('d-none'))).toEqual([true, true, false]);
    search.value = 'zzz';
    search.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(root.querySelector('[bsComboboxNoResults]')!.classList).not.toContain('d-none');
  });

  it('forgets destroyed options', async () => {
    @Component({
      imports: [BsCombobox, BsComboboxMenu, BsComboboxOption],
      template: `
        <button
          bsCombobox
          aria-label="Letter"
          placeholder="Pick one…"
          [menu]="menu"
          [(value)]="letter"></button>
        <div bsComboboxMenu #menu="bsComboboxMenu">
          <button bsComboboxOption value="a">A</button>
          @if (showB()) {
            <button bsComboboxOption value="b">B</button>
          }
        </div>
      `,
    })
    class DynamicHost {
      readonly letter = signal<unknown>('b');
      readonly showB = signal(true);
    }
    const fixture = TestBed.createComponent(DynamicHost);
    await fixture.whenStable();
    const toggle = fixture.nativeElement.querySelector('[bsCombobox]') as HTMLButtonElement;
    const text = () => toggle.querySelector('.combobox-value')!.textContent?.trim();
    expect(text()).toBe('B');
    fixture.componentInstance.showB.set(false);
    await fixture.whenStable();
    expect(text()).toBe('Pick one…');
  });

  it('supports multiple selection', async () => {
    @Component({
      imports: [BsCombobox, BsComboboxMenu, BsComboboxOption],
      template: `
        <button bsCombobox multiple aria-label="Skills" [menu]="menu" [(value)]="skills"></button>
        <div bsComboboxMenu #menu="bsComboboxMenu">
          <button bsComboboxOption value="html">HTML</button>
          <button bsComboboxOption value="css">CSS</button>
        </div>
      `,
    })
    class MultiHost {
      readonly skills = signal<unknown>(['html']);
    }
    const fixture = TestBed.createComponent(MultiHost);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const toggle = root.querySelector<HTMLButtonElement>('[bsCombobox]')!;
    const menu = root.querySelector<HTMLElement>('[bsComboboxMenu]')!;
    expect(menu.querySelector('[role="listbox"]')!.getAttribute('aria-multiselectable')).toBe(
      'true',
    );
    toggle.click();
    await fixture.whenStable();
    const options = menu.querySelectorAll<HTMLButtonElement>('[bsComboboxOption]');
    expect(options[0].querySelector('.menu-item-check')).not.toBeNull();
    options[1].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.skills()).toEqual(['html', 'css']);
    expect(menu.classList).toContain('show');
    expect(toggle.textContent).toContain('2 selected');
    options[0].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.skills()).toEqual(['css']);
  });

  it('marks the control touched only when focus leaves the toggle and the menu', async () => {
    const { fixture, toggle, menu, options, host } = await setup();
    const outside = document.createElement('button');
    document.body.append(outside);
    toggle.focus();
    toggle.click();
    await fixture.whenStable();
    await vi.waitFor(() => expect(menu.contains(document.activeElement)).toBe(true));
    options[0].focus();
    await fixture.whenStable();
    expect(host.country.touched).toBe(false);
    outside.focus();
    await fixture.whenStable();
    expect(host.country.touched).toBe(true);
    outside.remove();
  });
});

describe('BsCombobox keyboard and options', () => {
  @Component({
    imports: [BsCombobox, BsComboboxMenu, BsComboboxOption, BsComboboxSearch],
    template: `
      <button
        bsCombobox
        aria-label="Fruit"
        placeholder="Pick fruit"
        [size]="size()"
        [multiple]="multiple()"
        [compareWith]="byId"
        [menu]="menu"
        [(value)]="value"></button>
      <div bsComboboxMenu #menu="bsComboboxMenu" check>
        @if (search()) {
          <div class="combobox-search">
            <input bsComboboxSearch aria-label="Search" />
          </div>
        }
        <button bsComboboxOption disabled [value]="{ id: 0 }">Apple</button>
        <button bsComboboxOption [value]="{ id: 1 }">Banana</button>
        <button bsComboboxOption label="Cherry!" [value]="{ id: 2 }">Cherry</button>
      </div>
    `,
  })
  class KeyboardHost {
    readonly size = signal<'sm' | 'md' | 'lg'>('md');
    readonly multiple = signal(false);
    readonly search = signal(false);
    readonly value = signal<unknown>(null);
    readonly byId = (a: unknown, b: unknown) =>
      (a as { id: number }).id === (b as { id: number }).id;
  }

  async function setup() {
    const fixture = TestBed.createComponent(KeyboardHost);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const toggle = root.querySelector<HTMLButtonElement>('[bsCombobox]')!;
    const menu = root.querySelector<HTMLElement>('[bsComboboxMenu]')!;
    const options = () =>
      Array.from(menu.querySelectorAll<HTMLButtonElement>('[bsComboboxOption]'));
    const text = () => toggle.querySelector('.combobox-value')!.textContent.trim();
    const key = async (target: HTMLElement, key: string) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      target.dispatchEvent(event);
      await fixture.whenStable();
      return event;
    };
    const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));
    return {
      fixture,
      host: fixture.componentInstance,
      root,
      toggle,
      menu,
      options,
      text,
      key,
      nextFrame,
    };
  }

  it('opens with the arrow keys, focuses the first enabled option and closes on Escape', async () => {
    const { toggle, menu, options, key, nextFrame } = await setup();
    toggle.focus();
    expect((await key(toggle, 'ArrowDown')).defaultPrevented).toBe(true);
    expect(menu.classList).toContain('show');
    await nextFrame();
    // Apple is disabled.
    expect(document.activeElement).toBe(options()[1]);

    expect((await key(toggle, 'Escape')).defaultPrevented).toBe(true);
    expect(menu.classList).not.toContain('show');
    // Escape on a closed combobox is left alone, for example to close a dialog.
    expect((await key(toggle, 'Escape')).defaultPrevented).toBe(false);

    await key(toggle, 'ArrowUp');
    expect(menu.classList).toContain('show');
  });

  it('focuses the selected option on open, matching values with compareWith', async () => {
    const { fixture, host, toggle, options, text, key, nextFrame } = await setup();
    host.value.set({ id: 2 });
    await fixture.whenStable();
    expect(text()).toBe('Cherry!');
    expect(options()[2].getAttribute('aria-selected')).toBe('true');
    expect(options()[2].querySelector('.menu-item-check')).not.toBeNull();
    await key(toggle, 'ArrowDown');
    await nextFrame();
    expect(document.activeElement).toBe(options()[2]);
  });

  it('focuses the first enabled option on open when the selected one is disabled', async () => {
    const { fixture, host, toggle, options, key, nextFrame } = await setup();
    host.value.set({ id: 0 });
    await fixture.whenStable();
    await key(toggle, 'ArrowDown');
    await nextFrame();
    expect(document.activeElement).toBe(options()[1]);
  });

  it('moves from the search field to the first visible option with Arrow Down', async () => {
    const { fixture, host, root, toggle, options, key, nextFrame } = await setup();
    host.search.set(true);
    await fixture.whenStable();
    toggle.click();
    await fixture.whenStable();
    await nextFrame();
    const search = root.querySelector<HTMLInputElement>('[bsComboboxSearch]')!;
    // Focus stays in the search field rather than moving to an option.
    expect(document.activeElement).toBe(search);
    search.value = 'cher';
    search.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect((await key(search, 'ArrowDown')).defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(options()[2]);
    expect((await key(search, 'Enter')).defaultPrevented).toBe(false);
  });

  it('toggles values in multiple mode and keeps the menu open', async () => {
    const { fixture, host, toggle, menu, options, text } = await setup();
    host.multiple.set(true);
    await fixture.whenStable();
    expect(menu.querySelector('[role="listbox"]')!.getAttribute('aria-multiselectable')).toBe(
      'true',
    );
    toggle.click();
    await fixture.whenStable();
    options()[1].click();
    options()[2].click();
    await fixture.whenStable();
    expect(host.value()).toEqual([{ id: 1 }, { id: 2 }]);
    expect(text()).toBe('2 selected');
    expect(menu.classList).toContain('show');
    options()[1].click();
    await fixture.whenStable();
    expect(host.value()).toEqual([{ id: 2 }]);
    expect(text()).toBe('Cherry!');
  });

  it('applies the size class', async () => {
    const { fixture, host, toggle } = await setup();
    expect([...toggle.classList].sort()).toEqual(['combobox-toggle', 'form-control']);
    host.size.set('lg');
    await fixture.whenStable();
    expect(toggle.classList).toContain('form-control-lg');
  });

  it('takes defaults from provideBsComboboxConfig, with inputs winning', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideBsComboboxConfig({ size: 'sm', countText: (count) => `${count} choisis` }),
      ],
    });
    const { fixture, host, toggle, text } = await setup();
    host.multiple.set(true);
    host.value.set([{ id: 1 }, { id: 2 }]);
    await fixture.whenStable();
    expect(text()).toBe('2 choisis');
    // The size bound on the combobox wins over the config.
    expect(toggle.classList).not.toContain('form-control-sm');
  });
});
