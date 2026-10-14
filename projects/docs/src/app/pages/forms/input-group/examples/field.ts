import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  BsFormControl,
  BsFormField,
  BsFormLabel,
  BsFormText,
  BsInputGroup,
  BsInputGroupText,
  BsInvalidFeedback,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-input-group-field-example',
  imports: [
    ReactiveFormsModule,
    BsFormControl,
    BsInputGroup,
    BsInputGroupText,
    BsFormField,
    BsFormLabel,
    BsFormText,
    BsInvalidFeedback,
  ],
  templateUrl: './field.html',
})
export class InputGroupFieldExample {
  protected readonly username = new FormControl('', Validators.required);
}
