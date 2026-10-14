import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BsBadge, BsButton } from 'bootstrap-ng';
import { DocsCopyButton } from '../../shared/copy-button';

@Component({
  selector: 'docs-home',
  imports: [RouterLink, BsButton, BsBadge, DocsCopyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'd-block mx-auto px-5 py-12' },
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export default class Home {
  protected readonly install = 'npm install bootstrap-ng bootstrap @floating-ui/dom';
}
