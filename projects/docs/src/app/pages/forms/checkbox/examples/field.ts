import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BsCheck, BsFormField, BsLabel } from 'bootstrap-ng';

@Component({
  selector: 'docs-checkbox-field-example',
  imports: [ReactiveFormsModule, BsCheck, BsFormField, BsLabel],
  templateUrl: './field.html',
})
export class CheckboxFieldExample {
  protected readonly newsletter = new FormControl(true);
}
