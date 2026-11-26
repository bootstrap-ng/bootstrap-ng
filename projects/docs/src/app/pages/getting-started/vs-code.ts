import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsCode } from '../../shared/code';
import { DocsHeading } from '../../shared/heading';

@Component({
  selector: 'docs-vs-code',
  imports: [DocsCode, DocsHeading],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vs-code.html',
})
export default class VsCode {
  protected readonly install = `code --install-extension coliff.bootstrap-ng`;

  protected readonly fixAllOnSave = `{
  "editor.codeActionsOnSave": {
    "source.fixAll.bootstrap-ng": "explicit"
  }
}`;
}
