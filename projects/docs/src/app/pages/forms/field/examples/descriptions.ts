import { Component } from '@angular/core';
import {
  BsCheck,
  BsFormControl,
  BsFormField,
  BsFormLabel,
  BsFormText,
  BsLabel,
  BsRadio,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-field-descriptions-example',
  imports: [BsCheck, BsFormControl, BsFormField, BsFormLabel, BsFormText, BsLabel, BsRadio],
  templateUrl: './descriptions.html',
})
export class FieldDescriptionsExample {}
