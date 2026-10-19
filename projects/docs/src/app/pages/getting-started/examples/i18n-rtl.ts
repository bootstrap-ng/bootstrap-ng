import { Component, signal } from '@angular/core';
import { BsPagination, BsRating, BsTab, BsTabContent, BsTabPane, BsTabs } from 'bootstrap-ng';

@Component({
  selector: 'docs-i18n-rtl-example',
  imports: [BsPagination, BsRating, BsTab, BsTabContent, BsTabPane, BsTabs],
  templateUrl: './i18n-rtl.html',
})
export class I18nRtlExample {
  protected readonly rating = signal(3);

  private readonly number = new Intl.NumberFormat('ar-EG');

  protected readonly valueText = (value: number, max: number) =>
    `${this.number.format(value)} من ${this.number.format(max)}`;
}
