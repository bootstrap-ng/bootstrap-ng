import { Directive, ElementRef, inject, input, signal } from '@angular/core';

/**
 * Opts a form in to Bootstrap's validation styles and tracks whether it was submitted.
 *
 * - Sets `data-bs-validate`, so Bootstrap's CSS styles `:user-invalid` controls, and
 *   `novalidate`, so the browser doesn't show its own tooltips.
 * - Blocks the native submission while native constraints fail, like Bootstrap's
 *   validation script. Angular's `ngSubmit` still fires, so check the form's validity
 *   in your handler.
 * - Controls with a bootstrap-ng directive show their state after the first submit,
 *   even when the user hasn't touched them.
 *
 * Use `bsValidate="valid"` to also show success styles on valid controls.
 *
 * ```html
 * <form bsValidate [formGroup]="form" (ngSubmit)="save()">…</form>
 * ```
 */
@Directive({
  selector: 'form[bsValidate]',
  exportAs: 'bsValidate',
  host: {
    novalidate: '',
    '[attr.data-bs-validate]': "showValid() ? 'valid' : ''",
    '(submit)': 'onSubmit($event)',
    '(reset)': 'submittedState.set(false)',
  },
})
export class BsValidate {
  private readonly form = inject<ElementRef<HTMLFormElement>>(ElementRef).nativeElement;

  /** `valid` also shows success styles. An empty value only shows errors. */
  readonly mode = input<'' | 'valid'>('', { alias: 'bsValidate' });

  protected readonly submittedState = signal(false);
  /** True after the user tried to submit the form, until it is reset. */
  readonly submitted = this.submittedState.asReadonly();

  /** Whether controls show success styles. */
  readonly showValid = () => this.mode() === 'valid';

  protected onSubmit(event: Event): void {
    this.submittedState.set(true);
    if (!this.form.checkValidity()) {
      event.preventDefault();
      // `novalidate` stops the browser from focusing the first invalid control, so do it here.
      this.form.querySelector<HTMLElement>(':invalid:not(fieldset)')?.focus();
    }
  }
}
