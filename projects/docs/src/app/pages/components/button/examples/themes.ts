import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsButton, BsTheme } from 'bootstrap-ng';

@Component({
  selector: 'docs-button-themes-example',
  imports: [BsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './themes.html',
})
export class ButtonThemesExample {
  protected readonly themes: BsTheme[] = [
    'primary',
    'accent',
    'success',
    'danger',
    'warning',
    'info',
    'inverse',
    'secondary',
  ];
}
