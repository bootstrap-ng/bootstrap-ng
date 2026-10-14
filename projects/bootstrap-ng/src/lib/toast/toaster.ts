import {
  afterNextRender,
  ApplicationRef,
  Component,
  ComponentRef,
  createComponent,
  DOCUMENT,
  EnvironmentInjector,
  inject,
  Service,
  signal,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { BsCloseButton } from '../close-button/close-button';
import { BsTheme, themeClass } from '../util/theme';
import { BsToast, BsToastClose } from './toast';

/** Where `BsToaster` stacks its toasts on the screen, such as `'bottom-end'`. */
export type BsToastPlacement = `${'top' | 'bottom'}-${'start' | 'center' | 'end'}`;

/** Context of a template passed as a toast's `body`. */
export interface BsToastContext {
  /** The toast being shown. */
  $implicit: BsToastRef;
}

/** Options for `BsToaster.show()`. */
export interface BsToastOptions {
  /** Text or template for the toast body. */
  body: string | TemplateRef<BsToastContext>;
  /** Title in the toast header. Without it the toast has no header. */
  title?: string;
  /** Small text next to the title, such as "just now". */
  subtitle?: string;
  /** Theme color of the toast. */
  theme?: BsTheme;
  /** Hides the toast after `delay`. Defaults to `true`. */
  autohide?: boolean;
  /** Time in milliseconds before the toast hides. Defaults to 5000. */
  delay?: number;
  /** How urgently screen readers announce the toast. Defaults to `'polite'`. */
  live?: 'polite' | 'assertive';
  /** Accessible label of the close button. Defaults to "Close". */
  closeLabel?: string;
}

/** A toast shown by `BsToaster`. */
export interface BsToastRef {
  /** Hides the toast. It is removed once its transition finishes. */
  hide(): void;
  /** Resolves once the toast is hidden and removed. */
  readonly afterHidden: Promise<void>;
}

interface ToastEntry {
  readonly options: BsToastOptions;
  readonly ref: BsToastRef;
  readonly open: ReturnType<typeof signal<boolean>>;
  readonly removed: () => void;
}

const PLACEMENT_CLASSES: Record<BsToastPlacement, string> = {
  'top-start': 'top-0 start-0',
  'top-center': 'top-0 start-50 translate-middle-x',
  'top-end': 'top-0 end-0',
  'bottom-start': 'bottom-0 start-0',
  'bottom-center': 'bottom-0 start-50 translate-middle-x',
  'bottom-end': 'bottom-0 end-0',
};

/** @internal Fixed `.toast-container` that renders the toasts of `BsToaster`. */
@Component({
  selector: 'bs-toaster',
  imports: [BsToast, BsToastClose, BsCloseButton, NgTemplateOutlet],
  host: {
    '[class]': '"toast-container position-fixed p-3 " + placementClass()',
  },
  template: `
    @for (toast of toasts(); track toast) {
      <div
        bsToast
        [class]="themeClass(toast.options.theme)"
        [open]="toast.open()"
        (openChange)="toast.open.set($event)"
        [autohide]="toast.options.autohide ?? true"
        [delay]="toast.options.delay ?? 5000"
        [live]="toast.options.live ?? 'polite'"
        (hidden)="remove(toast)">
        @if (toast.options.title) {
          <div class="toast-header">
            <strong class="me-auto">{{ toast.options.title }}</strong>
            @if (toast.options.subtitle) {
              <small>{{ toast.options.subtitle }}</small>
            }
            <button
              bsCloseButton
              bsToastClose
              [attr.aria-label]="toast.options.closeLabel ?? 'Close'"></button>
          </div>
          <div class="toast-body">
            <ng-container
              [ngTemplateOutlet]="asTemplate(toast.options.body)"
              [ngTemplateOutletContext]="{ $implicit: toast.ref }" />{{
              asText(toast.options.body)
            }}
          </div>
        } @else {
          <div class="d-flex">
            <div class="toast-body">
              <ng-container
                [ngTemplateOutlet]="asTemplate(toast.options.body)"
                [ngTemplateOutletContext]="{ $implicit: toast.ref }" />{{
                asText(toast.options.body)
              }}
            </div>
            <button
              bsCloseButton
              bsToastClose
              class="me-2 m-auto"
              [attr.aria-label]="toast.options.closeLabel ?? 'Close'"></button>
          </div>
        }
      </div>
    }
  `,
})
export class BsToasterContainer {
  readonly placement = signal<BsToastPlacement>('bottom-end');
  readonly toasts = signal<readonly ToastEntry[]>([]);

  protected readonly placementClass = () => PLACEMENT_CLASSES[this.placement()];
  protected readonly themeClass = themeClass;

  protected asTemplate(body: BsToastOptions['body']): TemplateRef<BsToastContext> | null {
    return body instanceof TemplateRef ? body : null;
  }

  protected asText(body: BsToastOptions['body']): string {
    return body instanceof TemplateRef ? '' : body;
  }

  protected remove(toast: ToastEntry): void {
    this.toasts.update((toasts) => toasts.filter((t) => t !== toast));
    toast.removed();
  }
}

/**
 * Shows toasts from code. The toasts stack in a fixed `.toast-container` that is
 * added to the page the first time a toast is shown.
 *
 * ```ts
 * private readonly toaster = inject(BsToaster);
 *
 * save() {
 *   this.toaster.show({ title: 'Saved', body: 'Your changes were saved.' });
 * }
 * ```
 */
@Service()
export class BsToaster {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);
  private readonly document = inject(DOCUMENT);
  private container: ComponentRef<BsToasterContainer> | null = null;

  /** Where the toasts stack on the screen. Defaults to `'bottom-end'`. */
  setPlacement(placement: BsToastPlacement): void {
    this.getContainer().instance.placement.set(placement);
  }

  /** Shows a toast and returns a reference to hide it. */
  show(options: BsToastOptions): BsToastRef {
    const open = signal(false);
    let dismissed = false;
    // Whether the toast has rendered open. Until then it emits no `hidden` event.
    let rendered = false;
    let removed!: () => void;
    const afterHidden = new Promise<void>((resolve) => (removed = resolve));
    const container = this.getContainer().instance;
    const ref: BsToastRef = {
      hide: () => {
        dismissed = true;
        open.set(false);
        if (!rendered) {
          drop();
        }
      },
      afterHidden,
    };
    const entry: ToastEntry = { options, ref, open, removed };
    const drop = () => {
      container.toasts.update((toasts) => toasts.filter((t) => t !== entry));
      removed();
    };
    container.toasts.update((toasts) => [...toasts, entry]);
    // Render the toast closed first so it fades in.
    setTimeout(() => {
      if (dismissed) {
        return;
      }
      open.set(true);
      afterNextRender(() => (rendered = true), { injector: this.injector });
    });
    return ref;
  }

  /** Hides every toast. */
  clear(): void {
    this.container?.instance.toasts().forEach((toast) => toast.ref.hide());
  }

  private getContainer(): ComponentRef<BsToasterContainer> {
    if (!this.container) {
      const container = createComponent(BsToasterContainer, {
        environmentInjector: this.injector,
      });
      this.appRef.attachView(container.hostView);
      this.document.body.appendChild(container.location.nativeElement);
      this.container = container;
      this.appRef.onDestroy(() => {
        container.destroy();
        this.container = null;
      });
    }
    return this.container;
  }
}
