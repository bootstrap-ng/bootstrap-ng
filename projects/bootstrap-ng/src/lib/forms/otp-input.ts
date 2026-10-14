import {
  afterEveryRender,
  booleanAttribute,
  Component,
  computed,
  contentChild,
  DestroyRef,
  Directive,
  DOCUMENT,
  ElementRef,
  forwardRef,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { BsControl } from './control';

/** Characters an OTP input accepts. */
export type BsOtpType = 'numeric' | 'alphanumeric' | 'alpha';

const TYPES: Record<BsOtpType, { inputmode: string; pattern: string; filter: RegExp }> = {
  numeric: { inputmode: 'numeric', pattern: '[0-9]*', filter: /[^0-9]/g },
  alphanumeric: { inputmode: 'text', pattern: '[A-Za-z0-9]*', filter: /[^A-Za-z0-9]/g },
  alpha: { inputmode: 'text', pattern: '[A-Za-z]*', filter: /[^A-Za-z]/g },
};

const MASK_CHARACTER = '•';

interface OtpSlot {
  char: string;
  active: boolean;
  /** Separator shown after the slot, if any. */
  separator: string | null;
}

/**
 * A one-time password or PIN field: a single `bsOtpInput` drawn as one slot per
 * character. Screen readers, password managers and SMS autofill see one ordinary text
 * input, so bind that input to a form like any other.
 *
 * ```html
 * <div bsOtp connected [groups]="[3, 3]">
 *   <input bsOtpInput maxlength="6" aria-label="Verification code" [formControl]="code" />
 * </div>
 * ```
 */
@Component({
  selector: 'div[bsOtp]',
  exportAs: 'bsOtp',
  template: `
    <ng-content />
    <div class="otp-slots" aria-hidden="true">
      @for (slot of slots(); track $index) {
        <div
          class="otp-slot"
          [class.otp-slot-filled]="slot.char"
          [class.otp-slot-active]="slot.active">
          {{ slot.char }}
        </div>
        @if (slot.separator) {
          <div class="otp-separator">{{ slot.separator }}</div>
        }
      }
    </div>
  `,
  host: {
    class: 'otp otp-rendered',
    '[class.otp-connected]': 'connected()',
    '[class.otp-sm]': 'size() === "sm"',
    '[class.otp-lg]': 'size() === "lg"',
    '[class.is-valid]': 'control()?.control.state() === "valid"',
    '[class.is-invalid]': 'control()?.control.state() === "invalid"',
  },
})
export class BsOtp {
  /** Characters the input accepts. Also sets its `inputmode` and `pattern`. */
  readonly type = input<BsOtpType>('numeric');
  /** Shows a dot instead of each entered character. */
  readonly mask = input(false, { transform: booleanAttribute });
  /** Group sizes, such as `[3, 3]`, with a separator between groups. */
  readonly groups = input<number[] | null>(null);
  /** Character shown between groups. */
  readonly separator = input('·');
  /** Merges the slots into one field with shared borders. */
  readonly connected = input(false, { transform: booleanAttribute });
  /** Size of the slots. */
  readonly size = input<'sm' | 'lg' | null>(null);

  /** Emits the code when every slot is filled. */
  readonly complete = output<string>();

  protected readonly control = contentChild.required<BsOtpInput>(forwardRef(() => BsOtpInput));

  protected readonly slots = computed<OtpSlot[]>(() => {
    const control = this.control();
    const length = control.maxlength();
    const value = control.value();
    const caret = Math.min(control.caret(), length - 1);
    const groups = this.groups();
    const ends = new Set<number>();
    if (groups?.length) {
      let end = 0;
      for (let i = 0; end < length; i++) {
        end += Math.max(1, groups[Math.min(i, groups.length - 1)] ?? length);
        ends.add(end - 1);
      }
    }
    return Array.from({ length }, (_, i) => {
      const char = value[i] ?? '';
      return {
        char: char && this.mask() ? MASK_CHARACTER : char,
        active: control.focused() && i === caret,
        separator: ends.has(i) && i < length - 1 ? this.separator() : null,
      };
    });
  });
}

/**
 * The input of a `bsOtp` field. Its `maxlength` sets the number of slots. Typing
 * overwrites the character at the caret, clicking a slot moves to it, and a pasted code
 * such as `123-456` loses its extra characters.
 */
@Directive({
  selector: 'input[bsOtpInput]',
  exportAs: 'bsOtpInput',
  hostDirectives: [{ directive: BsControl, inputs: ['id', 'validation'] }],
  host: {
    class: 'otp-input',
    type: 'text',
    '[attr.maxlength]': 'maxlength()',
    '[attr.inputmode]': 'type().inputmode',
    '[attr.pattern]': 'type().pattern',
    '[attr.autocomplete]': 'autocomplete()',
    '(input)': 'onInput()',
    '(beforeinput)': 'onBeforeInput($event)',
    '(paste)': 'onPaste($event)',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
    '(pointerdown)': 'onPointerDown($event)',
    '(keyup)': 'sync()',
    '(select)': 'sync()',
  },
})
export class BsOtpInput {
  private readonly otp = inject(BsOtp);
  private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  /** @internal */
  readonly control = inject(BsControl, { self: true });

  /** Number of characters, and of slots. */
  readonly maxlength = input(6, { transform: numberAttribute });
  /** The input's `autocomplete`. `one-time-code` lets browsers fill in texted codes. */
  readonly autocomplete = input('one-time-code');

  /** @internal */
  readonly value = signal('');
  /** @internal */
  readonly caret = signal(0);
  /** @internal */
  readonly focused = signal(false);
  protected readonly type = computed(() => TYPES[this.otp.type()]);

  private pointerIndex: number | null = null;
  /** Syncs the caret while focused. Only attached then, rather than for every selection on the page. */
  private readonly onSelectionChange = () => {
    if (this.document.activeElement === this.element) {
      this.sync();
    }
  };
  private dispatching = false;

  constructor() {
    inject(DestroyRef).onDestroy(() =>
      this.document.removeEventListener('selectionchange', this.onSelectionChange),
    );
    // Forms write the value straight to the element, so pick it up after each render.
    afterEveryRender({ read: () => this.sync() });
  }

  /** Focuses the input with the caret on the first empty slot. */
  focus(): void {
    this.element.focus();
    this.selectSlot(this.firstEmptyIndex());
  }

  /** Clears the value and focuses the input. */
  clear(): void {
    this.setValue('');
    this.focus();
  }

  protected onInput(): void {
    if (this.dispatching) {
      return;
    }
    // Autofill or IME input: filter the whole value.
    const sanitized = this.sanitize(this.element.value);
    if (sanitized !== this.element.value) {
      this.setValue(sanitized);
    }
    if (this.document.activeElement === this.element) {
      this.selectSlot(this.firstEmptyIndex());
    }
    this.afterChange();
  }

  protected onPaste(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text');
    if (!pasted || this.element.readOnly) {
      return;
    }
    // Filter before applying the length limit. The browser cuts clipboard text to
    // `maxlength` first, which would drop characters that follow a dash or space.
    const sanitized = this.sanitize(pasted);
    let start = this.element.selectionStart ?? this.element.value.length;
    let end = this.element.selectionEnd ?? start;
    if (sanitized.length === this.maxlength()) {
      // A full code replaces the whole value.
      start = 0;
      end = this.element.value.length;
    }
    const inserted = sanitized.slice(0, this.maxlength() - this.element.value.length + end - start);
    event.preventDefault();
    if (!inserted) {
      return;
    }
    this.element.setRangeText(inserted, start, end, 'end');
    this.setValue(this.element.value);
    this.afterChange();
  }

  protected onBeforeInput(event: InputEvent): void {
    const { inputType, data } = event;
    const value = this.element.value;
    if (inputType === 'insertText' && data?.length === 1) {
      // Overwrite the character at the caret instead of inserting one.
      event.preventDefault();
      const char = this.sanitize(data);
      if (!char) {
        return;
      }
      const start = this.element.selectionStart ?? 0;
      const end = this.element.selectionEnd ?? start;
      const index = Math.min(start, this.maxlength() - 1);
      const chars = Array.from(value);
      if (end > start) {
        // Replace the whole selection, like a native input.
        chars.splice(start, end - start, char);
      } else {
        chars[index] = char;
      }
      this.setValue(chars.join(''));
      this.selectSlot(index + 1);
      this.afterChange();
    } else if (inputType === 'deleteContentBackward') {
      event.preventDefault();
      const start = this.element.selectionStart ?? 0;
      const end = this.element.selectionEnd ?? start;
      const chars = Array.from(value);
      if (end > start) {
        chars.splice(start, end - start);
        this.setValue(chars.join(''));
        this.selectSlot(start);
      } else if (start > 0) {
        chars.splice(start - 1, 1);
        this.setValue(chars.join(''));
        this.selectSlot(start - 1);
      }
      this.afterChange();
    }
  }

  protected onFocus(): void {
    this.focused.set(true);
    this.document.addEventListener('selectionchange', this.onSelectionChange);
    this.selectSlot(this.pointerIndex ?? this.firstEmptyIndex());
    this.pointerIndex = null;
  }

  protected onBlur(): void {
    this.focused.set(false);
    this.document.removeEventListener('selectionchange', this.onSelectionChange);
  }

  protected onPointerDown(event: PointerEvent): void {
    const slots = [...(this.element.parentElement?.querySelectorAll('.otp-slot') ?? [])];
    const index = slots.findIndex(
      (slot, i) => event.clientX <= slot.getBoundingClientRect().right || i === slots.length - 1,
    );
    if (index === -1) {
      return;
    }
    // Don't let the caret land past the first empty slot.
    const target = Math.min(index, this.firstEmptyIndex());
    if (this.document.activeElement === this.element) {
      event.preventDefault();
      this.selectSlot(target);
    } else {
      this.pointerIndex = target;
    }
  }

  /** @internal */
  sync(): void {
    this.value.set(this.element.value);
    this.caret.set(this.element.selectionStart ?? this.element.value.length);
    this.focused.set(this.document.activeElement === this.element);
  }

  private setValue(value: string): void {
    this.element.value = value;
    // Tell the form, which listens for `input` events.
    this.dispatching = true;
    this.element.dispatchEvent(new Event('input', { bubbles: true }));
    this.dispatching = false;
  }

  private afterChange(): void {
    this.sync();
    const value = this.element.value;
    if (value.length === this.maxlength()) {
      this.otp.complete.emit(value);
    }
  }

  private firstEmptyIndex(): number {
    return Math.min(this.element.value.length, this.maxlength() - 1);
  }

  /** A filled slot is selected so the next key overwrites it; an empty one gets a caret. */
  private selectSlot(index: number): void {
    const clamped = Math.max(0, Math.min(index, this.maxlength() - 1));
    const end = clamped < this.element.value.length ? clamped + 1 : clamped;
    this.element.setSelectionRange(clamped, end);
    this.sync();
  }

  private sanitize(value: string): string {
    return value.replace(this.type().filter, '').slice(0, this.maxlength());
  }
}
