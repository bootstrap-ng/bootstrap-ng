import { Component } from '@angular/core';
import { BsFormField, BsLabel, BsRadio } from 'bootstrap-ng';

@Component({
  selector: 'docs-radio-themes-example',
  imports: [BsFormField, BsLabel, BsRadio],
  templateUrl: './themes.html',
})
export class RadioThemesExample {
  protected readonly themes = [
    'primary',
    'accent',
    'success',
    'danger',
    'warning',
    'info',
    'inverse',
    'secondary',
  ] as const;
}
