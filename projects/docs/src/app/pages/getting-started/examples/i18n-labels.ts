import { Component } from '@angular/core';
import { BsAlert, BsPagination, BsRating } from 'bootstrap-ng';

@Component({
  selector: 'docs-i18n-labels-example',
  imports: [BsAlert, BsPagination, BsRating],
  templateUrl: './i18n-labels.html',
})
export class I18nLabelsExample {
  protected readonly valueText = (value: number, max: number) => `${value} von ${max} Sternen`;
}
