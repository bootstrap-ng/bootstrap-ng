import {
  afterNextRender,
  computed,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  HostAttributeToken,
  inject,
  Injector,
  input,
  signal,
  untracked,
} from '@angular/core';
import { FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { FORM_FIELD, FormField } from '@angular/forms/signals';
import { uniqueId } from 'bootstrap-ng/util';
import { BsFormFloating } from './floating';
import { BsFormField } from './form-field';
import { BsValidate } from './validate';
import { BS_CONTROL_HOST } from './value-control';

/**
 * Validation styles of a control.
 *
 * - `auto` follows the bound Angular form control (Reactive Forms, `ngModel` or Signal
 *   Forms): invalid controls show as invalid once touched or after the form was
 *   submitted. Valid ones show as valid only in a `bsValidate="valid"` form. Without an
 *   Angular form control, native constraint validation is used inside a `bsValidate` form.
 * - `valid` and `invalid` force a state, for example for server-side validation.
 * - `none` never shows a state.
 */
export type BsValidation = 'auto' | 'valid' | 'invalid' | 'none';

interface ControlStatus {
  valid: boolean;
  invalid: boolean;
  touched: boolean;
}

/**
 * Shared behavior of bootstrap-ng form controls, applied as a host directive by
 * `bsFormControl`, `bsCheck`, `bsRadio`, the `bsSwitch` input and the `bsRange` input:
 *
 * - Sets an id (generated when not set) and registers it with the surrounding
 *   `bsFormField`, so labels point to the control.
 * - Sets `aria-describedby` to the field's help text and matching feedback.
 * - Sets `.is-valid` / `.is-invalid` and `aria-invalid` from the validation state.
 */
@Directive({
  selector: '[bsControl]',
  exportAs: 'bsControl',
  host: {
    '[id]': 'id()',
    '[class.is-valid]': "state() === 'valid'",
    '[class.is-invalid]': "state() === 'invalid'",
    '[attr.aria-invalid]': "state() === 'invalid' ? 'true' : null",
    '[attr.aria-describedby]': 'describedBy()',
    '(focusout)': 'nativeTouched.set(true); syncNative()',
    '(input)': 'syncNative()',
    '(change)': 'syncNative()',
  },
})
export class BsControl {
  private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly field = inject(BsFormField, { optional: true });
  private readonly floating = inject(BsFormFloating, { optional: true });
  private readonly validate = inject(BsValidate, { optional: true });
  private readonly controlHost = inject(BS_CONTROL_HOST, { optional: true });
  private readonly ngForm =
    inject(FormGroupDirective, { optional: true }) ?? inject(NgForm, { optional: true });
  private readonly staticDescribedBy = inject(new HostAttributeToken('aria-describedby'), {
    optional: true,
  });

  /** Element id. Generated when not set. */
  readonly id = input(
    inject(new HostAttributeToken('id'), { optional: true }) ?? uniqueId('bs-control'),
  );
  /** Validation styles of the control. */
  readonly validation = input<BsValidation>('auto');

  /** The bound Angular form control, resolved after the first render. */
  private readonly binding = signal<
    | { kind: 'signal'; field: FormField<unknown> }
    | { kind: 'reactive'; control: NgControl }
    | { kind: 'native' }
    | null
  >(null);
  private readonly formStatus = signal<ControlStatus | null>(null);
  private readonly formSubmitted = signal(false);
  protected readonly nativeTouched = signal(false);
  private readonly nativeStatus = signal<ControlStatus | null>(null);

  /** The validation state the control shows. */
  readonly state = computed<'valid' | 'invalid' | null>(() => {
    const validation = this.validation();
    if (validation !== 'auto') {
      return validation === 'none' ? null : validation;
    }

    const status = this.status();
    const submitted = this.formSubmitted() || !!this.validate?.submitted();
    if (!status || !(status.touched || submitted)) {
      return null;
    }
    if (status.invalid) {
      return 'invalid';
    }
    return status.valid && this.validate?.showValid() ? 'valid' : null;
  });

  protected readonly describedBy = computed(() => {
    const ids = [this.staticDescribedBy, ...(this.field?.describedBy(this.state()) ?? [])];
    return ids.filter(Boolean).join(' ') || null;
  });

  private readonly status = computed<ControlStatus | null>(() => {
    const binding = this.binding();
    switch (binding?.kind) {
      case 'signal': {
        const state = binding.field.state();
        return { valid: state.valid(), invalid: state.invalid(), touched: state.touched() };
      }
      case 'reactive':
        return this.formStatus();
      case 'native':
        return this.validate ? this.nativeStatus() : null;
      default:
        return null;
    }
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    if (this.field) {
      destroyRef.onDestroy(this.field.registerControl(this.id));
    }
    if (this.floating) {
      destroyRef.onDestroy(this.floating.registerControl(this));
    }

    if (this.ngForm) {
      const subscription = this.ngForm.ngSubmit.subscribe(() => this.formSubmitted.set(true));
      destroyRef.onDestroy(() => subscription.unsubscribe());
    }

    // Read native validity when the form is submitted before the control was touched.
    effect(() => {
      if (this.validate?.submitted() && this.binding()?.kind === 'native') {
        untracked(() => this.syncNative());
      }
    });

    // Angular's form directives resolve their control during their first change detection,
    // and a composite control's value accessor may still be under construction now, so
    // look the form control up once the view has rendered.
    afterNextRender(() => {
      const options = { self: true, optional: true } as const;
      const field =
        this.injector.get(FORM_FIELD, null, options) ?? this.controlHost?.hostFormField();
      if (field) {
        this.binding.set({ kind: 'signal', field });
        return;
      }
      const ngControl =
        this.injector.get(NgControl, null, options) ?? this.controlHost?.hostNgControl();
      const control = ngControl?.control;
      if (!ngControl || !control) {
        this.binding.set({ kind: 'native' });
        return;
      }
      this.binding.set({ kind: 'reactive', control: ngControl });
      const sync = () => {
        this.formStatus.set({
          valid: control.valid,
          invalid: control.invalid,
          touched: control.touched,
        });
        this.formSubmitted.set(!!this.ngForm?.submitted);
      };
      sync();
      const subscription = control.events.subscribe(sync);
      destroyRef.onDestroy(() => subscription.unsubscribe());
    });
  }

  protected syncNative(): void {
    if (!this.validate || this.binding()?.kind !== 'native') {
      return;
    }
    // Not every host element is a form control, whatever the element's type says.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const valid = this.element.checkValidity?.() ?? true;
    this.nativeStatus.set({ valid, invalid: !valid, touched: this.nativeTouched() });
  }
}
