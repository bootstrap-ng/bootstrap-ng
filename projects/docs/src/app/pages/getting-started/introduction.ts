import { DocsHeading } from '../../shared/heading';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BsAlert } from 'bootstrap-ng';
import { DocsCode } from '../../shared/code';

@Component({
  selector: 'docs-introduction',
  imports: [RouterLink, BsAlert, DocsCode, DocsHeading],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './introduction.html',
})
export default class Introduction {
  protected readonly angularJson = `"styles": [
  "node_modules/bootstrap/dist/css/bootstrap.min.css",
  "src/styles.scss"
]`;

  protected readonly sassImport = `@use 'bootstrap/scss/bootstrap';`;

  protected readonly cdnLink = `<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@6.0.0-alpha.1/dist/css/bootstrap.min.css"
  rel="stylesheet"
  integrity="sha384-B/GM4XqrwHnWXNOWMbloTmrYXZg10cakYGmpfsR/bbzQ6JAJI4ihuyADKLnBgrCe"
  crossorigin="anonymous" />`;

  protected readonly usage = `import { Component } from '@angular/core';
import { BsAlert, BsButton } from 'bootstrap-ng';

@Component({
  selector: 'app-root',
  imports: [BsAlert, BsButton],
  template: \`
    <div bsAlert theme="success" dismissible>
      <p>bootstrap-ng is ready.</p>
    </div>
    <button type="button" bsButton theme="primary">Save</button>
  \`,
})
export class App {}`;
}
