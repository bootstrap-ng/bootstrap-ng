import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BsFormControl, BsFormField, BsFormLabel } from 'bootstrap-ng';

@Component({
  selector: 'docs-form-control-clearable-example',
  imports: [ReactiveFormsModule, BsFormControl, BsFormField, BsFormLabel],
  templateUrl: './clearable.html',
})
export class FormControlClearableExample {
  protected readonly query = new FormControl('Bootstrap', { nonNullable: true });
}
