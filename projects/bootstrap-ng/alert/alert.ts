import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  Provider,
  signal,
} from '@angular/core';
import {
  adjacentTabbable,
  BsTheme,
  configToken,
  provideConfig,
  themeClass,
  waitForTransition,
} from 'bootstrap-ng/util';

/** Defaults for the inputs of alerts. Inputs set on a component win over them. */
export interface BsAlertConfig {
  /** Shows a close button that dismisses the alert. */
  dismissible: boolean;
  /** Accessible label of the close button. */
  closeLabel: string;
  /** Fades the alert out when it closes. */
  animation: boolean;
}

/** The defaults set with `provideBsAlertConfig()`. */
export const BS_ALERT_CONFIG = configToken<BsAlertConfig>('BS_ALERT_CONFIG');

/**
 * Sets defaults for the inputs of alerts, for the whole app in `bootstrapApplication()`,
 * or for part of it in a component's `providers`.
 *
 * ```ts
 * providers: [provideBsAlertConfig({ closeLabel: 'Fermer' })]
 * ```
 */
export function provideBsAlertConfig(config: Partial<BsAlertConfig>): Provider {
  return provideConfig(BS_ALERT_CONFIG, config);
}

/**
 * Contextual feedback message. It has `role="alert"`, so screen readers read it out when
 * it appears; set `role="status"` for a less urgent message.
 *
 * ```html
 * <div bsAlert theme="success" dismissible (closed)="onClosed()">
 *   <p>Saved!</p>
 * </div>
 * ```
 */
@Component({
  selector: '[bsAlert]',
  exportAs: 'bsAlert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content />
    @if (dismissible()) {
      <button
        type="button"
        class="btn-close ms-auto"
        [attr.aria-label]="closeLabel()"
        (click)="close()"></button>
    }
  `,
  host: {
    class: 'alert',
    role: 'alert',
    '[class]': 'themeClass()',
    '[class.alert-instant]': '!animation()',
    '[class.hiding]': 'hiding()',
    '[hidden]': 'isClosed()',
  },
})
export class BsAlert {
  private readonly config = inject(BS_ALERT_CONFIG);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** Theme color of the alert. */
  readonly theme = input<BsTheme | null>(null);
  /** Shows a close button that dismisses the alert. */
  readonly dismissible = input(this.config.dismissible ?? false, { transform: booleanAttribute });
  /** Accessible label of the close button. */
  readonly closeLabel = input(this.config.closeLabel ?? 'Close');
  /** Fades the alert out when it closes. */
  readonly animation = input(this.config.animation ?? true, { transform: booleanAttribute });

  /** Emits when the alert starts to close. */
  readonly closing = output();
  /** Emits after the alert is closed and its transition has finished. */
  readonly closed = output();

  protected readonly hiding = signal(false);
  /** True after the alert has been closed. */
  readonly isClosed = signal(false);

  protected readonly themeClass = computed(() => themeClass(this.theme()));

  /**
   * Closes the alert. The element stays in the DOM with the `hidden` attribute. When
   * focus is inside the alert, such as on its close button, it moves to the next control
   * on the page (or the previous one at the end), so keyboard users keep their place.
   */
  async close(): Promise<void> {
    if (this.hiding() || this.isClosed()) {
      return;
    }
    if (this.element.contains(this.element.ownerDocument.activeElement)) {
      (adjacentTabbable(this.element) ?? adjacentTabbable(this.element, true))?.focus();
    }

    this.closing.emit();
    this.hiding.set(true);
    // Let the `.hiding` class apply before the transition duration is read.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await waitForTransition(this.element);
    this.hiding.set(false);
    this.isClosed.set(true);
    this.closed.emit();
  }
}
