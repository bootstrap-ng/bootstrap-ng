import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsCode } from '../../shared/code';
import { DocsHeading } from '../../shared/heading';

@Component({
  selector: 'docs-browsers',
  imports: [DocsCode, DocsHeading, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './browsers.html',
})
export default class Browsers {
  protected readonly browserslist = `baseline widely available
not Chrome < 138
not Edge < 138
not Firefox < 147
not iOS < 18
not Safari < 18`;
}
