import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsFormControl, BsFormField, BsFormLabel, BsInvalidFeedback } from 'bootstrap-ng';

@Component({
  selector: 'docs-form-control-reactive-example',
  imports: [ReactiveFormsModule, BsFormControl, BsFormField, BsFormLabel, BsInvalidFeedback],
  templateUrl: './reactive.html',
})
export class FormControlReactiveExample {
  protected readonly username = new FormControl('', [Validators.required, Validators.minLength(3)]);
}
