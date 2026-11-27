import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsCloseButton, provideBsCloseButtonConfig } from 'bootstrap-ng';

@Component({
  selector: 'docs-close-button-config-example',
  imports: [BsCloseButton],
  providers: [provideBsCloseButtonConfig({ label: 'Dismiss' })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './config.html',
})
export class CloseButtonConfigExample {}
