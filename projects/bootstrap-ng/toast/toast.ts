import {
  afterRenderEffect,
  booleanAttribute,
  Directive,
  ElementRef,
  inject,
  input,
  linkedSignal,
  numberAttribute,
  OnDestroy,
  output,
  Provider,
} from '@angular/core';
import {
  adjacentTabbable,
  BsLiveAnnouncer,
  configToken,
  provideConfig,
  waitForTransition,
} from 'bootstrap-ng/util';

/** Defaults for the inputs of toasts. Inputs set on a component win over them. */
export interface BsToastConfig {
  /** Hides the toast after `delay`. */
  autohide: boolean;
  /** Time in milliseconds before the toast hides. */
  delay: number;
  /** Fades the toast in and out. */
  animation: boolean;
  /**
   * How urgently screen readers announce the toast when it is shown: `'polite'` waits
   * for the screen reader to finish, `'assertive'` interrupts it, for errors. The text
   * is read out through `BsLiveAnnouncer`, because screen readers often miss a live
   * region that appears together with its text.
   */
  live: 'polite' | 'assertive';
  /** Accessible label of the close button of toasts shown with `BsToaster`. */
  closeLabel: string;
}

/** The defaults set with `provideBsToastConfig()`. */
export const BS_TOAST_CONFIG = configToken<BsToastConfig>('BS_TOAST_CONFIG');

/**
 * Sets defaults for the inputs of toasts, for the whole app in `bootstrapApplication()`,
 * or for part of it in a component's `providers`.
 *
 * ```ts
 * providers: [provideBsToastConfig({ delay: 8000 })]
 * ```
 */
export function provideBsToastConfig(config: Partial<BsToastConfig>): Provider {
  return provideConfig(BS_TOAST_CONFIG, config);
}

/**
 * Lightweight notification. Toasts hide on their own after `delay` unless `autohide`
 * is false, and pause while the pointer or focus is inside them.
 *
 * ```html
 * <div bsToast #toast="bsToast">
 *   <div class="toast-header">
 *     <strong class="me-auto">Bootstrap</strong>
 *     <button bsCloseButton bsToastClose></button>
 *   </div>
 *   <div class="toast-body">Hello, world!</div>
 * </div>
 * ```
 */
@Directive({
  selector: '[bsToast]',
  exportAs: 'bsToast',
  host: {
    class: 'toast',
    '[class.show]': 'isOpen()',
    '[class.toast-instant]': '!animation()',
    '(mouseover)': 'setInteracting("mouse", true)',
    '(mouseout)': 'onLeave("mouse", $event)',
    '(focusin)': 'onFocusIn($event)',
    '(focusout)': 'onLeave("focus", $event)',
  },
})
export class BsToast implements OnDestroy {
  private readonly config = inject(BS_TOAST_CONFIG);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly announcer = inject(BsLiveAnnouncer);

  /** Whether the toast is shown. Supports two-way binding with `[(open)]`. */
  // eslint-disable-next-line @angular-eslint/no-input-rename -- `open` state pattern, see AGENTS.md
  readonly openInput = input(false, { alias: 'open', transform: booleanAttribute });
  /** Emits the new open state when it changes from inside the toast. */
  readonly openChange = output<boolean>();
  private readonly openState = linkedSignal(() => this.openInput());
  /** Current open state. */
  readonly isOpen = this.openState.asReadonly();
  /** Hides the toast after `delay`. */
  readonly autohide = input(this.config.autohide ?? true, { transform: booleanAttribute });
  /** Time in milliseconds before the toast hides. */
  readonly delay = input(this.config.delay ?? 5000, { transform: numberAttribute });
  /** Fades the toast in and out. */
  readonly animation = input(this.config.animation ?? true, { transform: booleanAttribute });
  /**
   * How urgently screen readers announce the toast when it is shown: `'polite'` waits
   * for the screen reader to finish, `'assertive'` interrupts it, for errors. The text
   * is read out through `BsLiveAnnouncer`, because screen readers often miss a live
   * region that appears together with its text.
   */
  readonly live = input<'polite' | 'assertive'>(this.config.live ?? 'polite');

  /** Emits after the toast is shown and its transition has finished. */
  readonly shown = output();
  /** Emits after the toast is hidden and its transition has finished. */
  readonly hidden = output();

  private timeout: ReturnType<typeof setTimeout> | undefined;
  private readonly interacting = { mouse: false, focus: false };
  private destroyed = false;
  /** Where focus was before it entered the toast, to return it there on hide. */
  private returnFocus: HTMLElement | null = null;

  constructor() {
    let rendered = false;
    afterRenderEffect(() => {
      const open = this.isOpen();
      if (open === rendered) {
        return;
      }
      rendered = open;
      this.clearTimeout();
      if (!open) {
        // A hidden toast gets no focusout or mouseleave, so the next show would stay paused.
        this.interacting.mouse = false;
        this.interacting.focus = false;
        this.moveFocusOut();
      }
      void waitForTransition(this.element).then(() => {
        if (this.destroyed || this.isOpen() !== open) {
          return;
        }
        if (open) {
          this.announcer.announce(this.element.innerText, this.live());
          this.shown.emit();
          this.scheduleHide();
        } else {
          this.hidden.emit();
        }
      });
    });
  }

  show(): void {
    this.setOpen(true);
  }

  hide(): void {
    this.setOpen(false);
  }

  toggle(): void {
    this.setOpen(!this.isOpen());
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.clearTimeout();
  }

  protected setInteracting(kind: 'mouse' | 'focus', interacting: boolean): void {
    this.interacting[kind] = interacting;
    if (interacting) {
      this.clearTimeout();
    } else {
      this.scheduleHide();
    }
  }

  protected onFocusIn(event: FocusEvent): void {
    const from = event.relatedTarget;
    if (from instanceof HTMLElement && !this.element.contains(from)) {
      this.returnFocus = from;
    }
    this.setInteracting('focus', true);
  }

  /**
   * When focus is inside the toast as it hides, such as on its close button, moves it
   * back to where it came from, or else to the next control, so it isn't lost.
   */
  private moveFocusOut(): void {
    const returnFocus = this.returnFocus;
    this.returnFocus = null;
    if (!this.element.contains(this.element.ownerDocument.activeElement)) {
      return;
    }
    // The origin may have been removed, disabled or made inert meanwhile.
    returnFocus?.focus();
    if (returnFocus && this.element.ownerDocument.activeElement === returnFocus) {
      return;
    }
    (adjacentTabbable(this.element) ?? adjacentTabbable(this.element, true))?.focus();
  }

  protected onLeave(kind: 'mouse' | 'focus', event: MouseEvent | FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && this.element.contains(next)) {
      return;
    }
    this.setInteracting(kind, false);
  }

  private scheduleHide(): void {
    this.clearTimeout();
    if (!this.autohide() || !this.isOpen() || this.interacting.mouse || this.interacting.focus) {
      return;
    }
    this.timeout = setTimeout(() => this.hide(), this.delay());
  }

  private clearTimeout(): void {
    clearTimeout(this.timeout);
    this.timeout = undefined;
  }

  private setOpen(open: boolean): void {
    if (this.openState() !== open) {
      this.openState.set(open);
      this.openChange.emit(open);
    }
  }
}

/** Hides the parent `bsToast` when clicked. */
@Directive({
  selector: '[bsToastClose]',
  host: { '(click)': 'toast.hide()' },
})
export class BsToastClose {
  protected readonly toast = inject(BsToast);
}

/** The toast directives, to add to `imports` together. */
export const BS_TOAST = [BsToast, BsToastClose] as const;
