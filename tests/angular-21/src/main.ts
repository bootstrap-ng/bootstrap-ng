/*
 * Smoke test: builds the published library (dist/bootstrap-ng, compiled with the repo's Angular
 * version) inside an app on the oldest Angular version the library supports. CI installs that
 * Angular version first. See the `angular-21` job in .github/workflows/ci.yml.
 */
import { Component, inject, signal, VERSION } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
// Pull in every entry point so the Angular linker processes all of them.
import * as bootstrapNg from 'bootstrap-ng';
import {
  BsAccordion,
  BsAccordionBody,
  BsAccordionHeader,
  BsAccordionItem,
} from 'bootstrap-ng/accordion';
import { BsAlert } from 'bootstrap-ng/alert';
import { BsButton } from 'bootstrap-ng/button';
import { BsDialogService } from 'bootstrap-ng/dialog';
import { BsTable, BsTableColumn } from 'bootstrap-ng/table';
import { BsTooltip } from 'bootstrap-ng/tooltip';

@Component({
  selector: 'app-hello',
  template: '<div class="dialog-body">Hello from a dialog.</div>',
})
class Hello {}

interface Row {
  name: string;
  role: string;
}

@Component({
  selector: 'app-root',
  imports: [
    BsAccordion,
    BsAccordionBody,
    BsAccordionHeader,
    BsAccordionItem,
    BsAlert,
    BsButton,
    BsTable,
    BsTooltip,
  ],
  template: `
    <h1>Angular {{ version }}, {{ exports }} exports</h1>
    <div bsAlert theme="success">It works.</div>
    <button type="button" bsButton bsTooltip="Hello" (click)="open()">Open dialog</button>
    <div bsAccordion>
      <details bsAccordionItem open>
        <summary bsAccordionHeader>Item</summary>
        <div bsAccordionBody>Body</div>
      </details>
    </div>
    <table bsTable [data]="rows" [(columns)]="columns"></table>
  `,
})
class App {
  private readonly dialogs = inject(BsDialogService);
  protected readonly version = VERSION.full;
  protected readonly exports = Object.keys(bootstrapNg).length;
  protected readonly rows: Row[] = [
    { name: 'Ada', role: 'Engineer' },
    { name: 'Grace', role: 'Admiral' },
  ];
  protected readonly columns = signal<BsTableColumn<Row>[]>([
    { key: 'name', header: 'Name' },
    { key: 'role', header: 'Role' },
  ]);

  protected open(): void {
    this.dialogs.open(Hello);
  }
}

bootstrapApplication(App).catch((error: unknown) => console.error(error));
