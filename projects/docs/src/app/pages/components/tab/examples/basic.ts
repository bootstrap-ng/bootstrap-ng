import { Component } from '@angular/core';
import { BsTabs, BsTab, BsTabContent, BsTabPane } from 'bootstrap-ng';

@Component({
  selector: 'docs-tabs-basic-example',
  imports: [BsTabs, BsTab, BsTabContent, BsTabPane],
  templateUrl: './basic.html',
})
export class TabsBasicExample {}
