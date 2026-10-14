import { Component } from '@angular/core';
import { BsFormField, BsFormText, BsLabel, BsRadio } from 'bootstrap-ng';

@Component({
  selector: 'docs-radio-description-example',
  imports: [BsFormField, BsFormText, BsLabel, BsRadio],
  templateUrl: './description.html',
})
export class RadioDescriptionExample {}
