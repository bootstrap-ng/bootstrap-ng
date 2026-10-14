import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  BsCombobox,
  BsComboboxMenu,
  BsComboboxOption,
  BsFormField,
  BsFormLabel,
  BsFormText,
  BsInvalidFeedback,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-combobox-field-example',
  imports: [
    ReactiveFormsModule,
    BsCombobox,
    BsComboboxMenu,
    BsComboboxOption,
    BsFormField,
    BsFormLabel,
    BsFormText,
    BsInvalidFeedback,
  ],
  templateUrl: './field.html',
})
export class ComboboxFieldExample {
  protected readonly plan = new FormControl<string | null>(null, Validators.required);

  constructor() {
    this.plan.markAsTouched();
  }
}
