import {
  booleanAttribute,
  computed,
  Directive,
  inject,
  InjectionToken,
  Injector,
  input,
  ModelSignal,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { FORM_FIELD, FormField } from '@angular/forms/signals';

/**
 * Lets the `bsControl` inside a composite control, such as the ghost input of a chip
 * input, follow the Angular form control bound to the composite's host element.
 */
export interface BsControlHost {
  hostNgControl(): NgControl | null;
  hostFormField(): FormField<unknown> | null;
}

export const BS_CONTROL_HOST = new InjectionToken<BsControlHost>('BsControlHost');

/**
 * Base class of bootstrap-ng's composite form controls. Implements
 * `ControlValueAccessor`, so the control works with Reactive Forms, `ngModel` and
 * Signal Forms' `[formField]`, and exposes the value as a `model()` for `[(value)]`.
 */
@Directive()
export abstract class BsValueControl<T> implements ControlValueAccessor, BsControlHost {
  protected readonly injector = inject(Injector);

  /** The control's value. Supports two-way binding with `[(value)]`. */
  abstract readonly value: ModelSignal<T>;
  /** Value used when a form writes `null` or `undefined`. */
  protected abstract readonly emptyValue: T;

  /** Disables the control. Forms set this through `disable()`. */
  // eslint-disable-next-line @angular-eslint/no-input-rename -- mirrors the native disabled attribute
  readonly disabledInput = input(false, { alias: 'disabled', transform: booleanAttribute });
  private readonly formDisabled = signal(false);
  /** Whether the control is disabled by its input or its form. */
  readonly isDisabled = computed(() => this.disabledInput() || this.formDisabled());

  private onChange: (value: T) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  /** Sets the value from inside the control and tells the form. */
  protected updateValue(value: T): void {
    this.value.set(value);
    this.onChange(value);
  }

  /** Marks the form control as touched. Call it when focus leaves the control. */
  protected markTouched(): void {
    this.onTouched();
  }

  writeValue(value: T | null | undefined): void {
    this.value.set(value ?? this.emptyValue);
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  hostNgControl(): NgControl | null {
    return this.injector.get(NgControl, null, { self: true, optional: true });
  }

  hostFormField(): FormField<unknown> | null {
    return this.injector.get(FORM_FIELD, null, { self: true, optional: true });
  }
}
