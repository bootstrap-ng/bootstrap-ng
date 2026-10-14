import { DocsHeading } from '../../shared/heading';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsCode } from '../../shared/code';

@Component({
  selector: 'docs-quickstart',
  imports: [DocsCode, DocsHeading, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quickstart.html',
})
export default class Quickstart {
  protected readonly create = `npx @angular/cli@latest new my-app --style=scss
cd my-app`;

  protected readonly install = `npm install bootstrap-ng bootstrap@next @floating-ui/dom`;

  protected readonly styles = `@use 'bootstrap/scss/bootstrap';`;

  protected readonly app = `import { Component, inject, signal } from '@angular/core';
import {
  BsButton,
  BsCloseButton,
  BsDialog,
  BsDialogClose,
  BsFormControl,
  BsFormField,
  BsFormLabel,
  BsToaster,
} from 'bootstrap-ng';

@Component({
  selector: 'app-root',
  imports: [
    BsButton,
    BsCloseButton,
    BsDialog,
    BsDialogClose,
    BsFormControl,
    BsFormField,
    BsFormLabel,
  ],
  templateUrl: './app.html',
})
export class App {
  private readonly toaster = inject(BsToaster);
  protected readonly name = signal('');

  protected save(): void {
    this.toaster.show({ title: 'Saved', body: \`Hello, \${this.name() || 'friend'}!\` });
  }
}`;

  protected readonly html = `<main class="container py-5">
  <h1>Hello, bootstrap-ng</h1>
  <button type="button" bsButton theme="primary" (click)="dialog.show()">Edit name</button>
</main>

<dialog bsDialog #dialog="bsDialog" aria-labelledby="name-dialog-title">
  <div class="dialog-header">
    <h2 class="dialog-title" id="name-dialog-title">Your name</h2>
    <button bsCloseButton bsDialogClose></button>
  </div>
  <div class="dialog-body">
    <div bsFormField>
      <label bsFormLabel>Name</label>
      <input #input type="text" bsFormControl [value]="name()" (input)="name.set(input.value)" />
    </div>
  </div>
  <div class="dialog-footer">
    <button type="button" bsButton theme="secondary" bsDialogClose>Cancel</button>
    <button type="button" bsButton theme="primary" bsDialogClose (click)="save()">Save</button>
  </div>
</dialog>`;

  protected readonly serve = `ng serve`;
}
