import { Component } from '@angular/core';
import {
  BsFormAdorn,
  BsFormAdornText,
  BsFormControl,
  BsFormField,
  BsFormLabel,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-form-adorn-text-example',
  imports: [BsFormAdorn, BsFormAdornText, BsFormControl, BsFormField, BsFormLabel],
  templateUrl: './text.html',
})
export class FormAdornTextExample {}
