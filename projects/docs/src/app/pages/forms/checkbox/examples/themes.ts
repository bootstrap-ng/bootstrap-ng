import { Component } from '@angular/core';
import { BsCheck, BsFormField, BsLabel } from 'bootstrap-ng';

@Component({
  selector: 'docs-checkbox-themes-example',
  imports: [BsCheck, BsFormField, BsLabel],
  templateUrl: './themes.html',
})
export class CheckboxThemesExample {
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
