import { Component, signal } from '@angular/core';
import { BsChipInput } from 'bootstrap-ng';

@Component({
  selector: 'docs-chips-input-themes-example',
  imports: [BsChipInput],
  templateUrl: './input-themes.html',
})
export class ChipsInputThemesExample {
  protected readonly statuses = signal(['Approved', 'Verified']);
  protected readonly issues = signal(['Bug', 'Critical']);
}
