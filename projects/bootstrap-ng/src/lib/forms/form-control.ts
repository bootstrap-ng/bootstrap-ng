import {
  afterEveryRender,
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  HostAttributeToken,
  inject,
  Injector,
  input,
  output,
  Provider,
  signal,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { BsControl } from './control';
import { configToken, provideConfig } from '../util/config';

/** Style of a text control: a bordered `.form-control`, plain text, or a borderless ghost. */
export type BsFormControlVariant = 'control' | 'plaintext' | 'ghost';
export type BsFormControlSize = 'sm' | 'md' | 'lg';

/** Defaults for the inputs of form controls. Inputs set on a component win over them. */
export interface BsFormControlConfig {
  /** Accessible label of the clear button. */
  clearLabel: string;
}

/** The defaults set with `provideBsFormControlConfig()`. */
export const BS_FORM_CONTROL_CONFIG = configToken<BsFormControlConfig>('BS_FORM_CONTROL_CONFIG');

/**
 * Sets defaults for the inputs of form controls, for the whole app in `bootstrapApplication()`,
 * or for part of it in a component's `providers`.
 *
 * ```ts
 * providers: [provideBsFormControlConfig({ clearLabel: 'Effacer' })]
 * ```
 */
export function provideBsFormControlConfig(config: Partial<BsFormControlConfig>): Provider {
  return provideConfig(BS_FORM_CONTROL_CONFIG, config);
}

/**
 * Styles a textual `<input>`, `<textarea>` or `<select>` as a Bootstrap form control.
 * Works with Reactive Forms, `ngModel` and Signal Forms, whose state sets the
 * validation styles. See {@link BsControl} for the shared id, label and validation
 * behavior.
 *
 * ```html
 * <input type="email" bsFormControl [formControl]="email" />
 * <input bsFormControl="plaintext" readonly value="email@example.com" />
 * <input type="search" bsFormControl clearable />
 * <select bsFormControl size="sm">…</select>
 * ```
 */
@Directive({
  selector: 'input[bsFormControl], textarea[bsFormControl], select[bsFormControl]',
  exportAs: 'bsFormControl',
  hostDirectives: [{ directive: BsControl, inputs: ['id', 'validation'] }],
  host: {
    '[class]': 'classes()',
    '[style.padding-inline-end]':
      "canClear() ? 'calc(var(--control-padding-x, .25rem) * 2 + 1.25rem)' : null",
    '(input)': 'syncValue()',
  },
})
export class BsFormControl {
  private readonly config = inject(BS_FORM_CONTROL_CONFIG);
  private readonly type = inject(new HostAttributeToken('type'), { optional: true });
  /** The host element. */
  readonly element =
    inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(ElementRef).nativeElement;
  /** The control's id, used by the clear button. */
  readonly control = inject(BsControl);

  /** Style of the control. An empty value means `control`. */
  readonly variant = input<BsFormControlVariant, BsFormControlVariant | ''>('control', {
    alias: 'bsFormControl',
    transform: (value) => value || 'control',
  });
  /** Size of the control. Named `controlSize` because `size` is a native `<select>` attribute. */
  readonly controlSize = input<BsFormControlSize>('md');
  /** Shows a caret, for example on an `<input>` with a `<datalist>`. */
  readonly caret = input(false, { transform: booleanAttribute });
  /**
   * Shows a button at the end of an `<input>` or `<textarea>` that clears its value. The
   * button appears only while the control has a value and is enabled and editable.
   */
  readonly clearable = input(false, { transform: booleanAttribute });
  /** Accessible label of the clear button. */
  readonly clearLabel = input(this.config.clearLabel ?? 'Clear');
  /** Emits after the clear button cleared the value. */
  readonly cleared = output();

  private readonly filled = signal(false);
  /** Whether the clear button is shown: the control is clearable, has a value and is editable. */
  readonly hasClearableValue = this.filled.asReadonly();

  protected readonly canClear = computed(
    () => this.clearable() && this.element.localName !== 'select',
  );

  protected readonly classes = computed(() => {
    const variant = this.variant();
    if (variant === 'ghost') {
      return 'form-ghost';
    }
    if (variant === 'plaintext') {
      return 'form-control-plaintext';
    }
    const size = this.controlSize();
    return [
      'form-control',
      size === 'md' ? '' : `form-control-${size}`,
      this.type === 'color' ? 'form-control-color' : '',
      this.caret() ? 'form-control-caret' : '',
    ]
      .filter(Boolean)
      .join(' ');
  });

  constructor() {
    const injector = inject(Injector);
    // Values set by Angular forms or a `value` binding fire no input event, so check
    // after each render. The button is created in the browser only, and only when needed,
    // so other controls get no extra container in the DOM.
    afterEveryRender({ read: () => this.syncValue() });
    afterNextRender(() => {
      let button: ComponentRef<BsFormControlClear> | null = null;
      effect(
        () => {
          if (this.canClear() && !button) {
            button = injector
              .get(ViewContainerRef)
              .createComponent(BsFormControlClear, { injector });
          } else if (!this.canClear() && button) {
            button.destroy();
            button = null;
          }
        },
        { injector },
      );
    });
  }

  /** Clears the value, notifies Angular forms through an `input` event and focuses the control. */
  clear(): void {
    const element = this.element;
    element.value = '';
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.focus();
    this.cleared.emit();
  }

  protected syncValue(): void {
    const element = this.element;
    this.filled.set(
      this.canClear() && !!element.value && !element.readOnly && !element.matches(':disabled'),
    );
  }
}

/**
 * The clear button of a `clearable` {@link BsFormControl}, rendered after the control and
 * placed over its end. Bootstrap's `.btn-close` draws the icon.
 */
@Component({
  selector: 'button[bsFormControlClear]',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The style targets the control before the button, so it can't be scoped to this component.
  // eslint-disable-next-line @angular-eslint/use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
  // Hide the browser's own clear button of search inputs.
  styles: `
    :has(+ [bsformcontrolclear])::-webkit-search-cancel-button {
      display: none;
    }
  `,
  host: {
    type: 'button',
    class: 'btn-close',
    // A 24px target (WCAG 2.5.8) around Bootstrap's 20px icon.
    style:
      'position: absolute; top: 0; left: 0; z-index: 6; min-width: 1.5rem; min-height: 1.5rem; mask-size: 1.25rem',
    '[hidden]': '!formControl.hasClearableValue()',
    '[attr.aria-label]': 'formControl.clearLabel()',
    '[attr.aria-controls]': 'formControl.control.id()',
    '(click)': 'formControl.clear()',
  },
})
export class BsFormControlClear {
  protected readonly formControl = inject(BsFormControl);
  private readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef).nativeElement;

  constructor() {
    afterEveryRender({ write: () => this.place() });
    const observer = new ResizeObserver(() => this.place());
    observer.observe(this.formControl.element);
    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }

  /** Moves the button to the end of the control, centered on its first line. */
  private place(): void {
    const button = this.element;
    if (button.hidden) {
      return;
    }
    const control = this.formControl.element;
    const style = getComputedStyle(control);
    const box = control.getBoundingClientRect();
    const rect = button.getBoundingClientRect();
    const inset = parseFloat(style.paddingInlineStart) || 0;
    const x = style.direction === 'rtl' ? box.left + inset : box.right - inset - rect.width;
    const lineHeight = parseFloat(style.lineHeight) || rect.height;
    const y =
      control.localName === 'textarea'
        ? box.top + (parseFloat(style.paddingTop) || 0) + (lineHeight - rect.height) / 2
        : box.top + (box.height - rect.height) / 2;
    button.style.left = `${parseFloat(button.style.left) + x - rect.left}px`;
    button.style.top = `${parseFloat(button.style.top) + y - rect.top}px`;
  }
}
