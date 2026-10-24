import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  Provider,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BsLiveAnnouncer } from '../util/announcer';
import { BsTheme, themeClass } from '../util/theme';
import { BsControl } from './control';
import { BS_CONTROL_HOST, BsValueControl } from './value-control';
import { configToken, provideConfig } from '../util/config';

/**
 * A standalone chip: a small interactive element for a person, place, tag or value.
 * Put a `bsChipDismiss` button inside to make it removable.
 *
 * ```html
 * <span bsChip theme="primary" [active]="selected()">Design</span>
 * ```
 */
@Component({
  selector: '[bsChip]',
  exportAs: 'bsChip',
  template: '<ng-content />',
  host: {
    class: 'chip',
    '[class]': 'themeClass()',
    '[class.active]': 'active()',
  },
})
export class BsChip {
  /** Theme color of the chip. */
  readonly theme = input<BsTheme | null>(null);
  /** Solid appearance, for example for a selected chip. */
  readonly active = input(false, { transform: booleanAttribute });

  protected readonly themeClass = computed(() => themeClass(this.theme()));
}

/**
 * The remove button of a `bsChip`, with Bootstrap's close icon. Handle `(click)` to
 * remove the chip. Its accessible name defaults to “Remove”; name the chip in it, such
 * as `aria-label="Remove Design"`.
 */
@Component({
  selector: 'button[bsChipDismiss]',
  template: `
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      aria-hidden="true">
      <line x1="4" y1="4" x2="12" y2="12" />
      <line x1="12" y1="4" x2="4" y2="12" />
    </svg>
  `,
  host: {
    class: 'chip-dismiss',
    type: 'button',
    '[attr.aria-label]': 'ariaLabel()',
  },
})
export class BsChipDismiss {
  /** Accessible name of the button. */
  readonly ariaLabel = input('Remove', { alias: 'aria-label' });
}

/** Defaults for the inputs of chip inputs. Inputs set on a component win over them. */
export interface BsChipInputConfig {
  /** Character that adds a chip when typed, or `null`. Enter always adds one. */
  separator: string | null;
  /** Allows the same value more than once. */
  allowDuplicates: boolean;
  /** Adds the typed text as a chip when focus leaves the input. */
  createOnBlur: boolean;
  /** Shows a remove button on each chip. */
  dismissible: boolean;
  /** Start of the remove buttons’ accessible names, followed by the chip’s value. */
  removeLabel: string;
}

/** The defaults set with `provideBsChipInputConfig()`. */
export const BS_CHIP_INPUT_CONFIG = configToken<BsChipInputConfig>('BS_CHIP_INPUT_CONFIG');

/**
 * Sets defaults for the inputs of chip inputs, for the whole app in `bootstrapApplication()`,
 * or for part of it in a component's `providers`.
 *
 * ```ts
 * providers: [provideBsChipInputConfig({ removeLabel: 'Retirer' })]
 * ```
 */
export function provideBsChipInputConfig(config: Partial<BsChipInputConfig>): Provider {
  return provideConfig(BS_CHIP_INPUT_CONFIG, config);
}

/**
 * A field of chips with a ghost input for adding more, like tags or email recipients.
 * The value is a `string[]`: bind it with `[formControl]`, `[(ngModel)]`,
 * `[formField]` or `[(value)]`.
 *
 * Type and press Enter or the separator to add a chip. Backspace in the empty input
 * selects the last chip, and pressing it again removes it. Arrow keys, Home and End move
 * between chips; Ctrl/Cmd+A selects them all. Additions and removals are announced to
 * screen readers.
 *
 * ```html
 * <div bsFormField>
 *   <label bsFormLabel>Skills</label>
 *   <div bsChipInput theme="primary" [formControl]="skills" placeholder="Add skill…"></div>
 * </div>
 * ```
 */
@Component({
  selector: 'div[bsChipInput]',
  exportAs: 'bsChipInput',
  imports: [BsControl, BsChipDismiss],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BsChipInput), multi: true },
  ],
  viewProviders: [{ provide: BS_CONTROL_HOST, useExisting: forwardRef(() => BsChipInput) }],
  template: `
    <ng-content />
    @for (chip of value(); track $index) {
      <span
        #chip
        class="chip"
        tabindex="-1"
        [class.active]="selected().has($index)"
        (click)="onChipClick($event, $index)"
        (keydown)="onChipKeydown($event, $index)">
        {{ chip }}
        @if (dismissible()) {
          <button
            bsChipDismiss
            tabindex="-1"
            [aria-label]="removeLabel() + ' ' + chip"
            [disabled]="isDisabled()"
            (click)="$event.stopPropagation(); removeAt([$index])"></button>
        }
      </span>
    }
    <input
      #input
      type="text"
      bsControl
      class="form-ghost"
      [validation]="validation()"
      [attr.aria-label]="ariaLabel()"
      [placeholder]="placeholder()"
      [disabled]="isDisabled()"
      [readOnly]="full()"
      (input)="onInput()"
      (keydown)="onInputKeydown($event)"
      (focus)="selected.set(emptySet)"
      (blur)="onBlur()"
      (paste)="onPaste($event)" />
  `,
  host: {
    class: 'chip-input',
    '[class]': 'themeClass()',
    '[class.disabled]': 'isDisabled()',
    '[attr.aria-label]': 'null',
    '(click)': 'onHostClick($event)',
  },
})
export class BsChipInput extends BsValueControl<string[]> {
  private readonly config = inject(BS_CHIP_INPUT_CONFIG);
  // A shared live region clears between messages, so repeated messages are read again.
  private readonly announcer = inject(BsLiveAnnouncer);

  /** The chips. Supports two-way binding with `[(value)]`. */
  readonly value = model<string[]>([]);
  protected readonly emptyValue: string[] = [];

  /** Theme color of the chips. */
  readonly theme = input<BsTheme | null>(null);
  /** Character that adds a chip when typed, or `null`. Enter always adds one. */
  readonly separator = input<string | null>(this.config.separator ?? ',');
  /** Allows the same value more than once. */
  readonly allowDuplicates = input(this.config.allowDuplicates ?? false, {
    transform: booleanAttribute,
  });
  /** Maximum number of chips, or `null` for no limit. */
  readonly maxChips = input<number | null, unknown>(null, {
    transform: (value) => (value === null || value === '' ? null : numberAttribute(value)),
  });
  /** Placeholder of the input. */
  readonly placeholder = input('');
  /** Shows a remove button on each chip. */
  readonly dismissible = input(this.config.dismissible ?? true, { transform: booleanAttribute });
  /** Adds the typed text as a chip when focus leaves the input. */
  readonly createOnBlur = input(this.config.createOnBlur ?? true, { transform: booleanAttribute });
  /** Start of the remove buttons’ accessible names, followed by the chip’s value. */
  readonly removeLabel = input(this.config.removeLabel ?? 'Remove');
  /** Accessible name of the input, when it has no visible label. */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  /** Validation styles of the input. See `BsControl`. */
  readonly validation = input<'auto' | 'valid' | 'invalid' | 'none'>('auto');

  protected readonly emptySet = new Set<number>();
  /** Indexes of the selected chips. */
  readonly selected = signal<ReadonlySet<number>>(this.emptySet);
  protected readonly full = computed(() => {
    const max = this.maxChips();
    return max !== null && this.value().length >= max;
  });
  protected readonly themeClass = computed(() => themeClass(this.theme()));

  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');
  private readonly chips = viewChildren<ElementRef<HTMLElement>>('chip');
  private anchor: number | null = null;

  /** Adds a chip. Returns false when the value is empty, a duplicate or over the limit. */
  add(raw: string): boolean {
    const chip = raw.trim();
    const value = this.value();
    if (
      !chip ||
      this.full() ||
      (!this.allowDuplicates() && value.includes(chip)) ||
      this.isDisabled()
    ) {
      return false;
    }
    this.updateValue([...value, chip]);
    this.announcer.announce(`Added ${chip}`);
    return true;
  }

  /** Removes the first chip with the given value. */
  remove(chip: string): boolean {
    const index = this.value().indexOf(chip);
    if (index === -1) {
      return false;
    }
    this.removeAt([index]);
    return true;
  }

  /** Removes every chip. */
  clear(): void {
    this.updateValue([]);
    this.selected.set(this.emptySet);
  }

  /** Focuses the input. */
  focus(): void {
    this.input().nativeElement.focus();
  }

  protected removeAt(indexes: number[]): void {
    if (this.isDisabled() || !indexes.length) {
      return;
    }
    const value = this.value();
    const removed = value.filter((_, i) => indexes.includes(i));
    this.updateValue(value.filter((_, i) => !indexes.includes(i)));
    this.selected.set(this.emptySet);
    this.announcer.announce(`Removed ${removed.join(', ')}`);

    // Focus the chip that took the place of the first removed one, or the input.
    const next = Math.min(...indexes);
    const remaining = this.value().length;
    queueMicrotask(() => {
      if (remaining && next < remaining) {
        this.focusChip(next);
      } else {
        this.focus();
      }
    });
  }

  protected onInput(): void {
    const separator = this.separator();
    const input = this.input().nativeElement;
    if (separator && input.value.includes(separator)) {
      this.addText(input.value);
    }
  }

  protected onPaste(event: ClipboardEvent): void {
    const text = event.clipboardData?.getData('text') ?? '';
    const separator = this.separator();
    // A full input is read-only, so the browser ignores the paste.
    if (separator && text.includes(separator) && !this.full()) {
      event.preventDefault();
      const { value, selectionStart, selectionEnd } = this.input().nativeElement;
      const start = selectionStart ?? value.length;
      const end = selectionEnd ?? start;
      this.addText(value.slice(0, start) + text + value.slice(end));
    }
  }

  protected onBlur(): void {
    if (this.createOnBlur()) {
      this.addText(this.input().nativeElement.value);
    }
    this.markTouched();
  }

  protected onInputKeydown(event: KeyboardEvent): void {
    const input = this.input().nativeElement;
    const atStart = input.selectionStart === 0 && input.selectionEnd === 0;
    const last = this.value().length - 1;

    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        this.addText(input.value);
        break;
      case 'Backspace':
      case 'Delete':
        if (!input.value && last >= 0) {
          event.preventDefault();
          this.select(last);
          this.focusChip(last);
        }
        break;
      case 'ArrowLeft':
        if (atStart && last >= 0) {
          event.preventDefault();
          this.select(last, event.shiftKey);
          this.focusChip(last);
        }
        break;
      case 'Escape':
        input.value = '';
        this.selected.set(this.emptySet);
        break;
    }
  }

  protected onChipKeydown(event: KeyboardEvent, index: number): void {
    const last = this.value().length - 1;
    const move = (to: number) => {
      event.preventDefault();
      if (to > last) {
        this.selected.set(this.emptySet);
        this.focus();
        return;
      }
      this.select(to, event.shiftKey);
      this.focusChip(to);
    };

    switch (event.key) {
      case 'Backspace':
      case 'Delete': {
        event.preventDefault();
        const selected = [...this.selected()];
        this.removeAt(selected.length ? selected : [index]);
        break;
      }
      case 'ArrowLeft':
        move(Math.max(index - 1, 0));
        break;
      case 'ArrowRight':
        move(index + 1);
        break;
      case 'Home':
        move(0);
        break;
      case 'End':
        move(last + 1);
        break;
      case 'Escape':
        move(last + 1);
        break;
      case 'a':
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          this.selected.set(new Set(this.value().map((_, i) => i)));
        }
        break;
    }
  }

  protected onChipClick(event: MouseEvent, index: number): void {
    if (this.isDisabled()) {
      return;
    }
    if (event.metaKey || event.ctrlKey) {
      const selected = new Set(this.selected());
      if (selected.has(index)) {
        selected.delete(index);
      } else {
        selected.add(index);
      }
      this.selected.set(selected);
      this.anchor = index;
    } else {
      this.select(index, event.shiftKey);
    }
    this.focusChip(index);
  }

  protected onHostClick(event: MouseEvent): void {
    // Clicks on the padding focus the input, like a native text field.
    if (event.target === event.currentTarget) {
      this.focus();
    }
  }

  private addText(text: string): void {
    const separator = this.separator();
    const parts = separator ? text.split(separator) : [text];
    // Keep the parts that weren't added, such as duplicates, so they can be edited.
    const rejected = parts.filter((part) => !this.add(part) && part.trim());
    this.input().nativeElement.value = rejected.map((part) => part.trim()).join(separator ?? '');
  }

  private select(index: number, extend = false): void {
    if (extend && this.anchor !== null) {
      const [from, to] = [Math.min(this.anchor, index), Math.max(this.anchor, index)];
      this.selected.set(new Set(Array.from({ length: to - from + 1 }, (_, i) => from + i)));
      return;
    }
    this.anchor = index;
    this.selected.set(new Set([index]));
  }

  private focusChip(index: number): void {
    this.chips()[index]?.nativeElement.focus();
  }
}
