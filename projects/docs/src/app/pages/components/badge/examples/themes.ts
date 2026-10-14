import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsBadge, BsTheme, BsBadgeVariant } from 'bootstrap-ng';

@Component({
  selector: 'docs-badge-themes-example',
  imports: [BsBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './themes.html',
})
export class BadgeThemesExample {
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
  protected readonly variants: BsBadgeVariant[] = ['solid', 'subtle', 'outline'];
}
