import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  BsFormAdorn,
  BsFormAdornIcon,
  BsFormControl,
  BsFormField,
  BsFormLabel,
  BsFormText,
  BsInvalidFeedback,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-form-adorn-field-example',
  imports: [
    BsFormAdorn,
    BsFormAdornIcon,
    BsFormControl,
    ReactiveFormsModule,
    BsFormField,
    BsFormLabel,
    BsFormText,
    BsInvalidFeedback,
  ],
  templateUrl: './field.html',
})
export class FormAdornFieldExample {
  protected readonly query = new FormControl('', Validators.required);
}
