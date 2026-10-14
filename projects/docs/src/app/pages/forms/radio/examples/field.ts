import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BsFormField, BsLabel, BsRadio } from 'bootstrap-ng';

@Component({
  selector: 'docs-radio-field-example',
  imports: [ReactiveFormsModule, BsFormField, BsLabel, BsRadio],
  templateUrl: './field.html',
})
export class RadioFieldExample {
  protected readonly size = new FormControl('medium');
}
