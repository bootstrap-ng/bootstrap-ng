import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsFormControl, BsFormField, BsFormLabel, BsInvalidFeedback } from 'bootstrap-ng';

@Component({
  selector: 'docs-validation-tooltips-example',
  imports: [ReactiveFormsModule, BsFormControl, BsFormField, BsFormLabel, BsInvalidFeedback],
  templateUrl: './tooltips.html',
})
export class ValidationTooltipsExample {
  protected readonly city = new FormControl('', Validators.required);
}
