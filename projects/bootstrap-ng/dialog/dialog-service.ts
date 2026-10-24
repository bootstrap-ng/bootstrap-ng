import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  createComponent,
  DOCUMENT,
  EnvironmentInjector,
  inject,
  Injector,
  Service,
  signal,
  TemplateRef,
  Type,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { BS_DRAWER_CONFIG, BsDrawer } from './drawer';
import { uniqueId } from 'bootstrap-ng/util';
import { BS_DIALOG_CONFIG, BsDialog } from './dialog';
import { BsDialogBase } from './dialog-base';

/** Width of a dialog opened by `BsDialogService`. */
export type BsDialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';

/** Options shared by `BsDialogService.open()` and `BsDialogService.openDrawer()`. */
export interface BsOverlayOptions {
  /**
   * Inputs to set on a component with `setInput()`, keyed by input name.
   * Ignored for templates.
   */
  inputs?: Record<string, unknown>;
  /**
   * Id of the element that labels the dialog. Defaults to the first `.dialog-title`
   * or `.drawer-title` in the content, which gets an id if it has none.
   */
  ariaLabelledBy?: string;
  /** Accessible label, for content without a visible title. */
  ariaLabel?: string;
  /**
   * `true` closes on a backdrop click, `'static'` keeps it open and bounces,
   * `false` ignores the click. Defaults to `true`.
   */
  backdrop?: boolean | 'static';
  /** Closes on Escape. Defaults to `true`. */
  keyboard?: boolean;
  /** Animates opening and closing. Defaults to `true`. */
  animation?: boolean;
  /** Extra classes for the `<dialog>` element. */
  class?: string;
  /** Parent injector of the content. Defaults to the application's injector. */
  injector?: Injector;
}

/** Options for `BsDialogService.open()`. */
export interface BsDialogOptions extends BsOverlayOptions {
  /** Width of the dialog. Defaults to `'md'`. */
  size?: BsDialogSize;
  /** Scrolls the body while the header and footer stay put. */
  scrollable?: boolean;
}

/** Options for `BsDialogService.openDrawer()`. */
export interface BsDrawerOptions extends BsOverlayOptions {
  /** Edge the drawer slides in from. Defaults to `'start'`. */
  placement?: 'start' | 'end' | 'top' | 'bottom' | 'fullscreen';
  /** Keeps the page scrollable while the drawer is open. */
  scroll?: boolean;
}

/** Context of a template opened by `BsDialogService`. */
export interface BsDialogContext<R = unknown> {
  /** The open dialog, to close it with a result. */
  $implicit: BsDialogRef<R>;
}

/**
 * A dialog or drawer opened by `BsDialogService`. Components opened by the service
 * can inject it to close themselves.
 */
export abstract class BsDialogRef<R = unknown> {
  /** Closes the dialog. `result` resolves with `value`. */
  abstract close(value?: R): void;
  /** Closes the dialog without a value. `result` resolves with `undefined`. */
  abstract dismiss(): void;
  /**
   * Resolves once the dialog is hidden and removed, with the value passed to
   * `close()`, or `undefined` when it was dismissed.
   */
  abstract readonly result: Promise<R | undefined>;
}

/** A `BsDialogRef` for a component, with access to its instance. */
export interface BsComponentDialogRef<C, R = unknown> extends BsDialogRef<R> {
  /** The component rendered in the dialog. */
  readonly componentInstance: C;
}

type Content = Type<unknown> | TemplateRef<BsDialogContext>;

/** @internal Renders a `<dialog>` for `BsDialogService` and hosts its content. */
@Component({
  selector: 'bs-dialog-container',
  imports: [BsDialog, BsDrawer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (kind() === 'drawer') {
      <dialog
        bsDrawer
        [class]="classes()"
        [placement]="options().placement ?? 'start'"
        [scroll]="options().scroll ?? false"
        [open]="open()"
        (openChange)="open.set($event)"
        [backdrop]="options().backdrop ?? true"
        [keyboard]="options().keyboard ?? true"
        [animation]="options().animation ?? true"
        [attr.aria-labelledby]="labelledBy()"
        [attr.aria-label]="options().ariaLabel ?? null"
        (hidden)="hidden()">
        <ng-container #outlet />
      </dialog>
    } @else {
      <dialog
        bsDialog
        [class]="classes()"
        [open]="open()"
        (openChange)="open.set($event)"
        [backdrop]="options().backdrop ?? true"
        [keyboard]="options().keyboard ?? true"
        [animation]="options().animation ?? true"
        [attr.aria-labelledby]="labelledBy()"
        [attr.aria-label]="options().ariaLabel ?? null"
        (hidden)="hidden()">
        <ng-container #outlet />
      </dialog>
    }
  `,
})
export class BsDialogContainer {
  readonly kind = signal<'dialog' | 'drawer'>('dialog');
  readonly options = signal<BsDialogOptions & BsDrawerOptions>({});
  readonly open = signal(false);
  readonly labelledBy = signal<string | null>(null);
  /** Called once the dialog is hidden after closing. */
  hidden: () => void = () => undefined;

  readonly outlet = viewChild.required('outlet', { read: ViewContainerRef });
  readonly dialog = viewChild.required(BsDialogBase);

  protected readonly classes = computed(() => {
    const { size, scrollable, class: extra } = this.options();
    return [
      size && size !== 'md' ? `dialog-${size}` : '',
      scrollable ? 'dialog-scrollable' : '',
      extra ?? '',
    ]
      .filter(Boolean)
      .join(' ');
  });
}

/**
 * Opens dialogs and drawers from code. Pass a component or a template; the service
 * renders it in a `<dialog>` with Bootstrap's markup and removes it after it closes.
 *
 * ```ts
 * private readonly dialogs = inject(BsDialogService);
 *
 * async remove() {
 *   const ref = this.dialogs.open(ConfirmDialog, { inputs: { name: 'report.pdf' } });
 *   if (await ref.result) { … }
 * }
 * ```
 *
 * The opened component provides the header, body and footer, and can inject
 * `BsDialogRef` to close with a result. `bsDialogClose` and `bsDrawerClose` inside it
 * dismiss the dialog.
 */
@Service()
export class BsDialogService {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);
  private readonly document = inject(DOCUMENT);
  private readonly dialogConfig = inject(BS_DIALOG_CONFIG);
  private readonly drawerConfig = inject(BS_DRAWER_CONFIG);
  private readonly openRefs = new Set<BsDialogRef>();

  /** Opens a modal dialog with a component or template as its content. */
  open<C, R = unknown>(content: Type<C>, options?: BsDialogOptions): BsComponentDialogRef<C, R>;
  open<R = unknown>(
    content: TemplateRef<BsDialogContext<R>>,
    options?: BsDialogOptions,
  ): BsDialogRef<R>;
  open(content: Content, options: BsDialogOptions = {}): BsDialogRef {
    return this.create('dialog', content, options);
  }

  /** Opens a drawer with a component or template as its content. */
  openDrawer<C, R = unknown>(
    content: Type<C>,
    options?: BsDrawerOptions,
  ): BsComponentDialogRef<C, R>;
  openDrawer<R = unknown>(
    content: TemplateRef<BsDialogContext<R>>,
    options?: BsDrawerOptions,
  ): BsDialogRef<R>;
  openDrawer(content: Content, options: BsDrawerOptions = {}): BsDialogRef {
    return this.create('drawer', content, options);
  }

  /** Dismisses every open dialog and drawer. */
  dismissAll(): void {
    this.openRefs.forEach((ref) => {
      ref.dismiss();
    });
  }

  private create(
    kind: 'dialog' | 'drawer',
    content: Content,
    options: BsDialogOptions & BsDrawerOptions,
  ): BsComponentDialogRef<unknown> {
    const container = createComponent(BsDialogContainer, { environmentInjector: this.injector });
    const instance = container.instance;
    instance.kind.set(kind);
    // Options win over the app's defaults, which the dialog's own inputs would otherwise apply.
    const defaults = kind === 'drawer' ? this.drawerConfig : this.dialogConfig;
    instance.options.set({ ...defaults, ...options });
    this.appRef.attachView(container.hostView);
    this.document.body.appendChild(container.location.nativeElement);
    container.changeDetectorRef.detectChanges();

    let value: unknown;
    let settle!: (value: unknown) => void;
    let closing = false;
    let removed = false;
    const result = new Promise<unknown>((resolve) => (settle = resolve));
    const remove = () => {
      if (removed) {
        return;
      }
      removed = true;
      this.openRefs.delete(ref);
      unregister();
      container.destroy();
      settle(value);
    };
    const dialogElement = (container.location.nativeElement as HTMLElement).querySelector('dialog');
    const hide = (closeValue: unknown) => {
      if (closing) {
        return;
      }
      closing = true;
      value = closeValue;
      if (dialogElement?.open) {
        instance.open.set(false);
      } else {
        // Not rendered open yet, so there is no exit transition to wait for.
        remove();
      }
    };
    const ref: BsComponentDialogRef<unknown> = {
      componentInstance: null,
      result,
      close: (closeValue?: unknown) => {
        hide(closeValue);
      },
      dismiss: () => {
        hide(undefined);
      },
    };
    this.openRefs.add(ref);
    instance.hidden = remove;
    const unregister = this.appRef.onDestroy(remove);
    // Dismissed from inside (Escape, the backdrop or `bsDialogClose`): `result` resolves
    // with `undefined`, and a later `close()` must not cut the exit transition short.
    instance.dialog().openChange.subscribe((open) => {
      if (!open) {
        closing = true;
      }
    });

    const outlet = instance.outlet();
    const injector = Injector.create({
      providers: [
        { provide: BsDialogRef, useValue: ref },
        { provide: BsDialogBase, useValue: instance.dialog() },
      ],
      parent: options.injector ?? outlet.injector,
    });
    if (content instanceof TemplateRef) {
      outlet.createEmbeddedView(content, { $implicit: ref }, { injector });
    } else {
      const component = outlet.createComponent(content, { injector });
      // The content's header, body and footer must lay out as children of the flex `<dialog>`.
      (component.location.nativeElement as HTMLElement).style.display = 'contents';
      for (const [name, inputValue] of Object.entries(options.inputs ?? {})) {
        component.setInput(name, inputValue);
      }
      (ref as { componentInstance: unknown }).componentInstance = component.instance;
    }
    container.changeDetectorRef.detectChanges();
    instance.labelledBy.set(
      options.ariaLabel ? null : (options.ariaLabelledBy ?? this.titleId(container, kind)),
    );

    // Render closed first so the dialog animates in.
    setTimeout(() => {
      if (!closing) {
        instance.open.set(true);
      }
    });
    return ref;
  }

  /** Id of the first title in the content, which gets an id if it has none. */
  private titleId(
    container: ComponentRef<BsDialogContainer>,
    kind: 'dialog' | 'drawer',
  ): string | null {
    const title = (container.location.nativeElement as HTMLElement).querySelector(`.${kind}-title`);
    if (!title) {
      return null;
    }
    title.id ||= uniqueId(`bs-${kind}-title`);
    return title.id;
  }
}
