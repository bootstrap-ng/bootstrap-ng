import {
  afterRenderEffect,
  booleanAttribute,
  Directive,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  linkedSignal,
  OnDestroy,
  output,
} from '@angular/core';
import { waitForTransition } from '../util/transition';

const CLASS_NAME_OPEN = 'dialog-open';
const CLASS_NAME_HIDING = 'hiding';

/** Open elements that lock page scrolling, per document. */
const scrollLocks = new WeakMap<Document, Set<BsDialogBase>>();

/**
 * Behavior shared by `bsDialog` and `bsDrawer`, which both build on the native
 * `<dialog>` element: opening modally or inline, Escape and backdrop handling, the
 * static backdrop bounce, page scroll locking and the exit transition.
 */
@Directive({
  host: {
    '(cancel)': 'onCancel($event)',
    '(close)': 'onNativeClose()',
    '(click)': 'onClick($event)',
    '(pointerdown)': 'onPointerDown($event)',
    '(keydown.escape)': 'onEscape($event)',
  },
})
export abstract class BsDialogBase implements OnDestroy {
  protected readonly element = inject<ElementRef<HTMLDialogElement>>(ElementRef).nativeElement;
  protected readonly document = inject(DOCUMENT);

  /** Whether the element is open. Supports two-way binding with `[(open)]`. */
  // eslint-disable-next-line @angular-eslint/no-input-rename -- `open` state pattern, see AGENTS.md
  readonly openInput = input(false, { alias: 'open', transform: booleanAttribute });
  /** Emits the new open state when it changes from inside the element. */
  readonly openChange = output<boolean>();
  private readonly openState = linkedSignal(() => this.openInput());
  /** Current open state. */
  readonly isOpen = this.openState.asReadonly();
  /**
   * `true` closes on a backdrop click. `'static'` keeps it open and plays a short
   * bounce. `false` ignores backdrop clicks.
   */
  readonly backdrop = input<boolean | 'static'>(true);
  /** Closes on Escape. */
  readonly keyboard = input(true, { transform: booleanAttribute });
  /** Animates opening and closing. */
  readonly animation = input(true, { transform: booleanAttribute });

  /** Emits after the element is shown and its transition has finished. */
  readonly shown = output();
  /** Emits after the element is hidden and its transition has finished. */
  readonly hidden = output();
  /** Emits when the user dismisses it with Escape or the backdrop. */
  readonly dismissed = output<'escape' | 'backdrop'>();

  /** `dialog` or `drawer`: the prefix of Bootstrap's state classes. */
  protected abstract readonly prefix: 'dialog' | 'drawer';
  /** Whether to open in the top layer with a backdrop and a focus trap. */
  protected abstract isModal(): boolean;
  /** Whether to lock page scrolling while open. */
  protected abstract locksScroll(): boolean;
  /** Keeps a modal element in the top layer until its exit transition ends. */
  protected abstract readonly deferClose: boolean;
  /** Class added while open inline, if any. */
  protected readonly nonmodalClass: string | null = null;

  private openedAsModal = false;
  private hiding = false;
  /** Bumped on every show and hide, so a stale transition knows it was superseded. */
  private run = 0;
  private pointerDownTarget: EventTarget | null = null;
  private destroyed = false;

  constructor() {
    afterRenderEffect(() => {
      const open = this.isOpen();
      if (open && (!this.element.open || this.hiding)) {
        void this.showElement();
      } else if (!open && this.element.open && !this.hiding) {
        void this.hideElement();
      }
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
    if (this.element.open) {
      this.closeAndCleanup();
    }
    this.unlockScroll();
  }

  protected setOpen(open: boolean): void {
    if (this.openState() !== open) {
      this.openState.set(open);
      this.openChange.emit(open);
    }
  }

  private async showElement(): Promise<void> {
    const run = ++this.run;
    this.hiding = false;
    this.element.classList.remove(CLASS_NAME_HIDING);

    // A modal reopened during its deferred exit transition is still open in the top layer.
    if (!this.element.open) {
      this.openedAsModal = this.isModal();
      if (this.openedAsModal) {
        this.element.showModal();
      } else {
        if (this.nonmodalClass) {
          this.element.classList.add(this.nonmodalClass);
        }
        this.element.show();
      }
    }
    if (this.locksScroll()) {
      this.lockScroll();
    }

    await waitForTransition(this.element);
    if (run === this.run && this.element.open && !this.destroyed) {
      this.shown.emit();
    }
  }

  private async hideElement(): Promise<void> {
    const run = ++this.run;
    this.hiding = true;
    // `.hiding` plays the exit transition. A centered modal dialog stays in the top
    // layer until it ends, so its position and `::backdrop` do not vanish mid-animation.
    this.element.classList.add(CLASS_NAME_HIDING);
    const defer = this.deferClose && this.openedAsModal;
    if (!defer) {
      this.closeAndCleanup();
    }
    await waitForTransition(this.element);
    if (run !== this.run || this.destroyed) {
      // Reopened before the exit transition ended, or destroyed and cleaned up already.
      return;
    }
    if (defer) {
      this.closeAndCleanup();
    }
    this.element.classList.remove(CLASS_NAME_HIDING);
    if (this.nonmodalClass) {
      this.element.classList.remove(this.nonmodalClass);
    }
    this.hiding = false;
    this.hidden.emit();
  }

  private closeAndCleanup(): void {
    this.element.close();
    this.openedAsModal = false;
    this.unlockScroll();
  }

  private lockScroll(): void {
    let locks = scrollLocks.get(this.document);
    if (!locks) {
      locks = new Set();
      scrollLocks.set(this.document, locks);
    }
    locks.add(this);
    this.document.documentElement.classList.add(CLASS_NAME_OPEN);
  }

  /** Unlocks page scrolling once no other open element locks it. */
  private unlockScroll(): void {
    const locks = scrollLocks.get(this.document);
    if (!locks?.delete(this)) {
      return;
    }
    if (locks.size === 0) {
      this.document.documentElement.classList.remove(CLASS_NAME_OPEN);
    }
  }

  private async bounce(): Promise<void> {
    const staticClass = `${this.prefix}-static`;
    this.element.classList.add(staticClass);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await waitForTransition(this.element);
    this.element.classList.remove(staticClass);
  }

  protected onCancel(event: Event): void {
    // Take over Escape handling so the exit transition can play.
    event.preventDefault();
    this.dismiss('escape');
  }

  protected onEscape(event: Event): void {
    // Leave an Escape that content already handled, such as an open menu, or that
    // belongs to a nested dialog, to that content.
    if (
      !this.element.open ||
      event.defaultPrevented ||
      (event.target as Element | null)?.closest('dialog') !== this.element
    ) {
      return;
    }
    if (!this.openedAsModal) {
      // Elements opened inline do not get a native `cancel` event.
      event.preventDefault();
      this.dismiss('escape');
    } else if (!this.keyboard()) {
      // Browsers skip `cancel` and close outright on a repeated Escape without user
      // activation in between, so stop the close request before it starts.
      event.preventDefault();
      this.dismiss('escape');
    }
  }

  protected onPointerDown(event: PointerEvent): void {
    this.pointerDownTarget = event.target;
  }

  protected onClick(event: MouseEvent): void {
    const downTarget = this.pointerDownTarget;
    this.pointerDownTarget = null;
    // A click on the <dialog> element itself, not its content, is a click on the backdrop.
    // A drag that starts inside the content and ends on the backdrop is not.
    if (event.target !== this.element || !this.openedAsModal) {
      return;
    }
    if (downTarget && downTarget !== this.element) {
      return;
    }
    if (this.backdrop() === false) {
      return;
    }
    if (this.backdrop() === 'static') {
      void this.bounce();
      return;
    }
    this.dismiss('backdrop');
  }

  protected onNativeClose(): void {
    // Closed outside the directive, for example by `<form method="dialog">`.
    if (!this.hiding && this.isOpen() && !this.element.open) {
      this.closeAndCleanup();
      if (this.nonmodalClass) {
        this.element.classList.remove(this.nonmodalClass);
      }
      this.setOpen(false);
      this.hidden.emit();
    }
  }

  private dismiss(reason: 'escape' | 'backdrop'): void {
    if (reason === 'escape' && !this.keyboard()) {
      if (this.openedAsModal) {
        void this.bounce();
      }
      return;
    }
    this.dismissed.emit(reason);
    this.hide();
  }
}

/** Closes the parent `bsDialog` or `bsDrawer` when clicked. */
@Directive({
  selector: '[bsDialogClose], [bsDrawerClose]',
  host: { '(click)': 'dialog.hide()' },
})
export class BsDialogClose {
  protected readonly dialog = inject(BsDialogBase);
}
