import { Component } from '@angular/core';
import { BsFormField, BsLabel, BsSwitch, BsSwitchInput } from 'bootstrap-ng';

@Component({
  selector: 'docs-switch-themes-example',
  imports: [BsFormField, BsLabel, BsSwitch, BsSwitchInput],
  templateUrl: './themes.html',
})
export class SwitchThemesExample {
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
