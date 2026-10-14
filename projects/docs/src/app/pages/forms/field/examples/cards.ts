import { Component } from '@angular/core';
import { BsFormField, BsFormText, BsLabel, BsRadio } from 'bootstrap-ng';

@Component({
  selector: 'docs-field-cards-example',
  imports: [BsFormField, BsFormText, BsLabel, BsRadio],
  templateUrl: './cards.html',
})
export class FieldCardsExample {}
