import { Component, signal } from '@angular/core';
import { BsTabs, BsTab, BsTabContent, BsTabPane, BsButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-tabs-model-example',
  imports: [BsTabs, BsTab, BsTabContent, BsTabPane, BsButton],
  templateUrl: './model.html',
})
export class TabsModelExample {
  protected readonly active = signal('one');
}
