import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsProgress } from 'bootstrap-ng';

@Component({
  selector: 'docs-progress-themes-example',
  imports: [BsProgress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './themes.html',
})
export class ProgressThemesExample {}
