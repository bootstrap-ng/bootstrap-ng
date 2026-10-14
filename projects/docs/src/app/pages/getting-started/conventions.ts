import { DocsHeading } from '../../shared/heading';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsCode } from '../../shared/code';

@Component({
  selector: 'docs-conventions',
  imports: [DocsCode, DocsHeading, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './conventions.html',
})
export default class Conventions {
  protected readonly selectors = `<div bsAlert theme="info">…</div>
<button type="button" bsButton="outline" theme="primary">…</button>
<details bsAccordionItem>…</details>`;

  protected readonly twoWay = `<div bsCollapse [(open)]="filtersOpen">…</div>
<dialog bsDialog [(open)]="editing">…</dialog>`;

  protected readonly exportAs = `<button type="button" bsButton (click)="confirm.show()">Delete</button>
<dialog bsDialog #confirm="bsDialog">…</dialog>`;

  protected readonly all = `import { BOOTSTRAP_NG } from 'bootstrap-ng';

@Component({
  imports: [BOOTSTRAP_NG],
  …
})`;
}
