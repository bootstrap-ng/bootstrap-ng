import {
  ApplicationRef,
  booleanAttribute,
  computed,
  Directive,
  DOCUMENT,
  effect,
  ElementRef,
  EmbeddedViewRef,
  HostAttributeToken,
  inject,
  Injector,
  input,
  numberAttribute,
  OnDestroy,
  output,
  signal,
  TemplateRef,
  untracked,
} from '@angular/core';
import {
  adjacentTabbable,
  autoPosition,
  BsPlacement,
  tabbables,
  uniqueId,
  waitForTransition,
} from 'bootstrap-ng/util';

/** Content of a tooltip or popover: plain text, or a template for rich content. */
export type BsTipContent = string | TemplateRef<unknown> | null | undefined;

/**
 * Defaults for the inputs of tooltips or popovers, set with `provideBsTooltipConfig()` or
 * `provideBsPopoverConfig()`. Inputs set on a component win over them.
 */
export interface BsTipConfig {
  /** Where the tip appears. `start` and `end` follow the text direction. */
  placement: BsPlacement;
  /**
   * Space-separated events that show the tip: `hover`, `focus`, `click`, or `manual`
   * to only open it with `show()`.
   */
  trigger: string | null;
  /** Delay in milliseconds before showing and hiding. */
  delay: number;
  /** Fades the tip in and out. */
  animation: boolean;
}

type TriggerKind = 'hover' | 'focus' | 'click';

/** Extra time before a hover-triggered tip hides, so the pointer can move onto it. */
const HOVER_HIDE_GRACE = 100;

/**
 * Shared behavior of `bsTooltip` and `bsPopover`: triggers, delays, positioning with
 * Floating UI, the fade transition and Escape to dismiss.
 */
@Directive({
  host: {
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-expanded]': 'triggers().includes("click") ? isOpen() : null',
    '(mouseenter)': 'onTrigger("hover", true)',
    '(mouseleave)': 'onTrigger("hover", false)',
    '(focusin)': 'onTrigger("focus", true)',
    '(focusout)': 'onFocusout($event)',
    '(click)': 'onClick()',
    '(keydown.tab)': 'onTriggerTab($event)',
  },
})
export abstract class BsFloatingTip implements OnDestroy {
  protected readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(Injector);
  /** The trigger's own `aria-describedby`, kept alongside the tip's id. */
  private readonly ownDescribedBy = inject(new HostAttributeToken('aria-describedby'), {
    optional: true,
  });
  private readonly config = this.injectConfig();

  /** Where the tip appears. `start` and `end` follow the text direction. */
  readonly placement = input<BsPlacement>(this.config.placement ?? 'top');
  /**
   * Space-separated events that show the tip: `hover`, `focus`, `click`, or `manual`
   * to only open it with `show()`.
   */
  readonly trigger = input<string | null>(this.config.trigger ?? null);
  /** Delay in milliseconds before showing and hiding. */
  readonly delay = input(this.config.delay ?? 0, { transform: numberAttribute });
  /** Fades the tip in and out. */
  readonly animation = input(this.config.animation ?? true, { transform: booleanAttribute });

  /** Emits after the tip is shown and its transition has finished. */
  readonly shown = output();
  /** Emits after the tip is hidden and removed from the page. */
  readonly hidden = output();

  private readonly openState = signal(false);
  /** Whether the tip is shown. */
  readonly isOpen = this.openState.asReadonly();

  protected readonly triggers = computed(() =>
    (this.trigger() ?? this.defaultTrigger).split(/\s+/).filter(Boolean),
  );
  private readonly tipDescribedBy = signal<string | null>(null);
  protected readonly describedBy = computed(
    () => [this.ownDescribedBy, this.tipDescribedBy()].filter(Boolean).join(' ') || null,
  );

  /** `tooltip` or `popover`: the prefix of Bootstrap's classes. */
  protected abstract readonly name: 'tooltip' | 'popover';
  protected abstract readonly defaultTrigger: string;
  /** Distance from the trigger, in pixels. */
  protected abstract readonly offset: number;
  /** Reads the content inputs. Called in a reactive context to re-render on change. */
  protected abstract readContent(): unknown;
  /** Whether there is anything to show. */
  protected abstract hasContent(): boolean;
  /** Builds the children of the tip element, arrow included. */
  protected abstract buildContent(): Node[];
  /** Injects the defaults of this kind of tip. Runs before the subclass's own fields exist. */
  protected abstract injectConfig(): Partial<BsTipConfig>;

  private tip: HTMLElement | null = null;
  private tipIdValue?: string;
  private views: EmbeddedViewRef<unknown>[] = [];
  private stopPositioning: (() => void) | undefined;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private readonly activeTriggers = new Set<TriggerKind>();
  /** Whether a pointer press inside the tip is in progress, which moves focus away. */
  private tipPointerDown = false;
  private readonly onDocumentPointerup = () => {
    this.tipPointerDown = false;
  };
  /**
   * After a press inside a focus-triggered tip, focus has left the trigger but the tip
   * stays open, so a press anywhere else is what dismisses it.
   */
  private readonly onDocumentPointerdown = (event: PointerEvent) => {
    const target = event.target instanceof Node ? event.target : null;
    if (!this.element.contains(target) && !this.tip?.contains(target)) {
      this.onTrigger('focus', false);
    }
  };
  private readonly onDocumentKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.isOpen()) {
      // Escape always dismisses the tip (WCAG 1.4.13). It is consumed, so a dialog the
      // tip sits in stays open, only when pressed in the trigger, in the tip, or in the
      // dialog around them: an Escape meant for another dialog is left to it.
      const target = event.target instanceof Element ? event.target : null;
      const scope = target?.closest('dialog[open]');
      if (
        !target ||
        this.element.contains(target) ||
        this.tip?.contains(target) ||
        !scope ||
        scope.contains(this.element)
      ) {
        event.preventDefault();
      }
      if (this.tip?.contains(this.document.activeElement)) {
        this.element.focus();
      }
      void this.hide();
    }
  };
  /**
   * The tip sits at the end of the page, so Tab would skip it. Tab and Shift+Tab at
   * its edges continue from the trigger instead, as if the tip followed it.
   */
  private readonly onTipKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !this.tip) {
      return;
    }
    const items = tabbables(this.tip);
    if (event.shiftKey && event.target === items.at(0)) {
      event.preventDefault();
      this.element.focus();
    } else if (!event.shiftKey && event.target === items.at(-1)) {
      event.preventDefault();
      adjacentTabbable(this.element, false, [this.tip])?.focus();
    }
  };

  constructor() {
    effect(() => {
      this.readContent();
      untracked(() => {
        if (!this.tip) {
          return;
        }
        if (this.hasContent()) {
          this.fillTip(this.tip);
        } else {
          void this.hide();
        }
      });
    });
  }

  /** Id of the tip element, referenced by `aria-describedby` on the trigger. */
  get tipId(): string {
    this.tipIdValue ??= uniqueId(`bs-${this.name}`);
    return this.tipIdValue;
  }

  /** Shows the tip. */
  async show(): Promise<void> {
    this.clearTimer();
    if (this.isOpen() || !this.hasContent()) {
      return;
    }
    this.openState.set(true);

    const tip = this.tip ?? this.createTip();
    this.tipDescribedBy.set(this.tipId);
    this.document.addEventListener('keydown', this.onDocumentKeydown);
    if (this.triggers().includes('focus')) {
      this.document.addEventListener('pointerdown', this.onDocumentPointerdown, true);
      this.document.addEventListener('pointerup', this.onDocumentPointerup, true);
    }

    // Let Floating UI place the tip before it fades in.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    if (!this.isOpen() || this.tip !== tip) {
      return;
    }
    tip.classList.add('show');
    await waitForTransition(tip);
    if (this.isOpen() && this.tip === tip) {
      this.shown.emit();
    }
  }

  /** Hides the tip. */
  async hide(): Promise<void> {
    this.clearTimer();
    this.activeTriggers.clear();
    if (!this.isOpen()) {
      return;
    }
    this.openState.set(false);
    this.removeDocumentListeners();

    const tip = this.tip;
    if (!tip) {
      return;
    }
    tip.classList.remove('show');
    await waitForTransition(tip);
    if (!this.isOpen() && this.tip === tip) {
      this.destroyTip();
      this.hidden.emit();
    }
  }

  /** Shows the tip when it is hidden, and hides it when it is shown. */
  toggle(): Promise<void> {
    return this.isOpen() ? this.hide() : this.show();
  }

  ngOnDestroy(): void {
    this.clearTimer();
    this.removeDocumentListeners();
    this.destroyTip();
  }

  /** Renders plain text as a text node and a template as an embedded view. */
  protected renderContent(content: BsTipContent): Node[] {
    if (!content) {
      return [];
    }
    if (typeof content === 'string') {
      return [this.document.createTextNode(content)];
    }
    const view = content.createEmbeddedView({}, this.injector);
    this.appRef.attachView(view);
    view.detectChanges();
    this.views.push(view);
    return view.rootNodes as Node[];
  }

  protected onTrigger(kind: TriggerKind, entering: boolean): void {
    if (!this.triggers().includes(kind)) {
      return;
    }
    if (entering) {
      this.activeTriggers.add(kind);
      this.enter();
    } else {
      this.activeTriggers.delete(kind);
      if (this.activeTriggers.size === 0) {
        this.leave(kind === 'hover');
      }
    }
  }

  protected onFocusout(event: FocusEvent): void {
    // Moving into an interactive tip, or pressing on its text, keeps it open.
    if (this.tipPointerDown || this.tip?.contains(event.relatedTarget as Node | null)) {
      return;
    }
    this.onTrigger('focus', false);
  }

  /** Tab from the trigger moves into an open tip that has controls, such as links. */
  protected onTriggerTab(event: Event): void {
    const first = this.tip && this.isOpen() ? tabbables(this.tip).at(0) : undefined;
    if (first && !(event as KeyboardEvent).shiftKey) {
      event.preventDefault();
      first.focus();
    }
  }

  protected onClick(): void {
    if (!this.triggers().includes('click')) {
      return;
    }
    if (this.isOpen() && this.activeTriggers.has('click')) {
      this.activeTriggers.delete('click');
      if (this.activeTriggers.size === 0) {
        this.leave(false);
      }
    } else {
      this.activeTriggers.add('click');
      this.enter();
    }
  }

  private enter(): void {
    this.clearTimer();
    if (this.delay()) {
      this.timer = setTimeout(() => this.show(), this.delay());
    } else {
      void this.show();
    }
  }

  private leave(hover: boolean): void {
    this.clearTimer();
    const delay = hover ? Math.max(this.delay(), HOVER_HIDE_GRACE) : this.delay();
    if (delay) {
      this.timer = setTimeout(() => this.hide(), delay);
    } else {
      void this.hide();
    }
  }

  private removeDocumentListeners(): void {
    this.document.removeEventListener('keydown', this.onDocumentKeydown);
    this.document.removeEventListener('pointerdown', this.onDocumentPointerdown, true);
    this.document.removeEventListener('pointerup', this.onDocumentPointerup, true);
    this.tipPointerDown = false;
  }

  private clearTimer(): void {
    clearTimeout(this.timer);
    this.timer = undefined;
  }

  private createTip(): HTMLElement {
    const tip = this.document.createElement('div');
    tip.className = `${this.name} bs-${this.name}-auto`;
    if (!this.animation()) {
      tip.classList.add(`${this.name}-instant`);
    }
    tip.id = this.tipId;
    tip.setAttribute('role', 'tooltip');
    // Keep a hover-triggered tip open while the pointer is over it (WCAG 1.4.13).
    tip.addEventListener('mouseenter', () => this.onTrigger('hover', true));
    tip.addEventListener('mouseleave', () => this.onTrigger('hover', false));
    tip.addEventListener('keydown', this.onTipKeydown);
    tip.addEventListener('pointerdown', () => {
      this.tipPointerDown = true;
    });
    // Leaving the tip for anywhere but the trigger ends a focus trigger.
    tip.addEventListener('focusout', (event) => {
      const next = event.relatedTarget as Node | null;
      if (!this.tipPointerDown && !tip.contains(next) && !this.element.contains(next)) {
        this.onTrigger('focus', false);
      }
    });
    this.fillTip(tip);

    const container = this.element.closest('dialog[open]') ?? this.document.body;
    container.append(tip);
    this.tip = tip;

    this.stopPositioning = autoPosition(this.element, tip, () => ({
      placement: this.placement(),
      offset: this.offset,
      fallbackPlacements: ['top', 'right', 'bottom', 'left'],
      arrow: tip.querySelector<HTMLElement>(`.${this.name}-arrow`),
    }));
    return tip;
  }

  private fillTip(tip: HTMLElement): void {
    this.destroyViews();
    tip.replaceChildren(...this.buildContent());
  }

  private destroyViews(): void {
    for (const view of this.views) {
      view.destroy();
    }
    this.views = [];
  }

  private destroyTip(): void {
    this.stopPositioning?.();
    this.stopPositioning = undefined;
    this.destroyViews();
    this.tip?.remove();
    this.tip = null;
    this.tipDescribedBy.set(null);
  }
}
