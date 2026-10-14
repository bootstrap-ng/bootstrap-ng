import {
  afterRenderEffect,
  booleanAttribute,
  Directive,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { uniqueId } from '../util/id';
import { waitForTransition } from '../util/transition';

/**
 * Shows and hides content. Bootstrap 6 animates the size in CSS, so the directive
 * only toggles the `.show` class.
 *
 * ```html
 * <button bsButton [bsCollapseToggle]="details">Toggle</button>
 * <div bsCollapse #details="bsCollapse">…</div>
 * ```
 */
@Directive({
  selector: '[bsCollapse]',
  exportAs: 'bsCollapse',
  host: {
    class: 'collapse',
    '[class.show]': 'isOpen()',
    '[class.collapse-horizontal]': 'horizontal()',
    '[id]': 'id()',
  },
})
export class BsCollapse {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** Whether the content is open. Supports two-way binding with `[(open)]`. */
  // eslint-disable-next-line @angular-eslint/no-input-rename -- `open` state pattern, see AGENTS.md
  readonly openInput = input(false, { alias: 'open', transform: booleanAttribute });
  /** Emits the new open state when it changes from inside the collapse. */
  readonly openChange = output<boolean>();
  private readonly openState = linkedSignal(() => this.openInput());
  /** Current open state. */
  readonly isOpen = this.openState.asReadonly();
  /** Animates the width instead of the height. */
  readonly horizontal = input(false, { transform: booleanAttribute });
  /** Element id, used for `aria-controls` on toggles. Generated when not set. */
  readonly id = input(uniqueId('bs-collapse'));

  /** Emits after the content is shown and its transition has finished. */
  readonly shown = output();
  /** Emits after the content is hidden and its transition has finished. */
  readonly hidden = output();

  constructor() {
    let rendered: boolean | undefined;
    afterRenderEffect(() => {
      const open = this.isOpen();
      if (rendered === undefined || rendered === open) {
        rendered = open;
        return;
      }
      rendered = open;
      void waitForTransition(this.element).then(() => {
        if (this.isOpen() === open) {
          (open ? this.shown : this.hidden).emit();
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

  private setOpen(open: boolean): void {
    if (this.openState() !== open) {
      this.openState.set(open);
      this.openChange.emit(open);
    }
  }
}

/**
 * Makes an element toggle a `bsCollapse`, and keeps `aria-expanded` and
 * `aria-controls` in sync.
 */
@Directive({
  selector: '[bsCollapseToggle]',
  host: {
    '[attr.aria-expanded]': 'target().isOpen()',
    '[attr.aria-controls]': 'target().id()',
    '[attr.role]': 'isButton ? null : "button"',
    '(click)': 'onClick($event)',
    '(keydown.space)': 'onSpace($event)',
  },
})
export class BsCollapseToggle {
  protected readonly isButton =
    (inject(ElementRef).nativeElement as HTMLElement).tagName === 'BUTTON';

  /** The collapse to toggle. */
  readonly target = input.required<BsCollapse>({ alias: 'bsCollapseToggle' });

  protected onClick(event: MouseEvent): void {
    if (!this.isButton) {
      event.preventDefault();
    }
    this.target().toggle();
  }

  /** Links don't activate on Space, but `role="button"` promises they do. */
  protected onSpace(event: Event): void {
    if (!this.isButton) {
      event.preventDefault();
      this.target().toggle();
    }
  }
}
