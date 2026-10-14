import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsAlert, BsTheme } from 'bootstrap-ng';

@Component({
  selector: 'docs-alert-themes-example',
  imports: [BsAlert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './themes.html',
})
export class AlertThemesExample {
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
