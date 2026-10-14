import { Component } from '@angular/core';
import { BsFormField, BsLabel, BsRadio } from 'bootstrap-ng';

@Component({
  selector: 'docs-field-grouped-example',
  imports: [BsFormField, BsLabel, BsRadio],
  templateUrl: './grouped.html',
})
export class FieldGroupedExample {}
