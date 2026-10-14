import {
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { BsDialogBase } from '../dialog/dialog-base';
import { uniqueId } from '../util/id';

/** Bootstrap breakpoints for responsive drawers. */
export type BsBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Panel that slides in from an edge of the screen, built on the native `<dialog>`
 * element. Bootstrap 6's replacement for offcanvas, and the collapsing part of a
 * responsive navbar.
 *
 * ```html
 * <button bsButton [bsDrawerToggle]="drawer">Open</button>
 * <dialog bsDrawer #drawer="bsDrawer" aria-labelledby="drawer-title">
 *   <div class="drawer-header">
 *     <h5 class="drawer-title" id="drawer-title">Drawer</h5>
 *     <button bsCloseButton bsDrawerClose></button>
 *   </div>
 *   <div class="drawer-body">…</div>
 * </dialog>
 * ```
 */
@Directive({
  selector: 'dialog[bsDrawer]',
  exportAs: 'bsDrawer',
  providers: [{ provide: BsDialogBase, useExisting: BsDrawer }],
  host: {
    tabindex: '-1',
    '[class]': 'classes()',
    '[class.drawer-instant]': '!animation()',
    '[id]': 'id()',
  },
})
export class BsDrawer extends BsDialogBase {
  /** Edge the drawer slides in from. `start` and `end` follow the text direction. */
  readonly placement = input<'start' | 'end' | 'top' | 'bottom' | 'fullscreen'>('start');
  /**
   * Makes the drawer responsive: it is a drawer below this breakpoint and shows its
   * content inline from this breakpoint up. Uses Bootstrap's `.{breakpoint}:drawer` class.
   */
  readonly responsive = input<BsBreakpoint | null>(null);
  /**
   * Keeps the page scrollable while the drawer is open. Combine with
   * `[backdrop]="false"` to open it inline so the rest of the page stays interactive.
   */
  readonly scroll = input(false, { transform: booleanAttribute });
  /** Element id, used for `aria-controls` on toggles. Generated when not set. */
  readonly id = input(uniqueId('bs-drawer'));

  protected readonly prefix = 'drawer';
  protected readonly deferClose = false;

  protected readonly classes = computed(() => {
    const breakpoint = this.responsive();
    return `${breakpoint ? `${breakpoint}:drawer` : 'drawer'} drawer-${this.placement()}`;
  });

  constructor() {
    super();
    // A responsive drawer that turns inline at a wider viewport (for example in a
    // navbar) should not stay open in the top layer.
    const view = this.document.defaultView;
    const onResize = () => {
      if (this.element.open && getComputedStyle(this.element).position !== 'fixed') {
        this.hide();
      }
    };
    view?.addEventListener('resize', onResize);
    inject(DestroyRef).onDestroy(() => view?.removeEventListener('resize', onResize));
  }

  protected isModal(): boolean {
    return this.backdrop() !== false || !this.scroll();
  }

  protected locksScroll(): boolean {
    return !this.scroll();
  }
}

/**
 * Makes an element open and close a `bsDrawer`, and keeps `aria-expanded` and
 * `aria-controls` in sync.
 */
@Directive({
  selector: '[bsDrawerToggle]',
  host: {
    '[attr.aria-expanded]': 'drawer().isOpen()',
    '[attr.aria-controls]': 'drawer().id()',
    '[attr.role]': 'isButton ? null : "button"',
    '(click)': 'onClick($event)',
    '(keydown.space)': 'onSpace($event)',
  },
})
export class BsDrawerToggle {
  protected readonly isButton =
    (inject(ElementRef).nativeElement as HTMLElement).tagName === 'BUTTON';

  /** The drawer to toggle. */
  readonly drawer = input.required<BsDrawer>({ alias: 'bsDrawerToggle' });

  protected onClick(event: MouseEvent): void {
    if (!this.isButton) {
      event.preventDefault();
    }
    this.drawer().toggle();
  }

  /** Links don't activate on Space, but `role="button"` promises they do. */
  protected onSpace(event: Event): void {
    if (!this.isButton) {
      event.preventDefault();
      this.drawer().toggle();
    }
  }
}
