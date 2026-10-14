import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsChipInput, BsFormField, BsFormLabel, BsInvalidFeedback } from 'bootstrap-ng';

@Component({
  selector: 'docs-chips-validation-example',
  imports: [ReactiveFormsModule, BsChipInput, BsFormField, BsFormLabel, BsInvalidFeedback],
  templateUrl: './validation.html',
})
export class ChipsValidationExample {
  protected readonly topics = new FormControl<string[]>([], {
    nonNullable: true,
    validators: Validators.minLength(2),
  });

  constructor() {
    this.topics.markAsTouched();
  }
}
