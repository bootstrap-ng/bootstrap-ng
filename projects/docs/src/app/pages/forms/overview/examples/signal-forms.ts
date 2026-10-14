import { Component, signal } from '@angular/core';
import { email, form, FormField, required, submit } from '@angular/forms/signals';
import { BsButton, BsFormControl, BsFormField, BsFormLabel, BsInvalidFeedback } from 'bootstrap-ng';

@Component({
  selector: 'docs-overview-signal-forms-example',
  imports: [FormField, BsButton, BsFormControl, BsFormField, BsFormLabel, BsInvalidFeedback],
  templateUrl: './signal-forms.html',
})
export class OverviewSignalFormsExample {
  private readonly model = signal({ name: '', email: '' });
  protected readonly signup = form(this.model, (path) => {
    required(path.name);
    required(path.email);
    email(path.email);
  });
  protected readonly saved = signal(false);

  protected async save(event: Event): Promise<void> {
    event.preventDefault();
    this.saved.set(await submit(this.signup, () => Promise.resolve(undefined)));
  }
}
