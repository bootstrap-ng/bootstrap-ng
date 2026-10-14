import { Component } from '@angular/core';
import { BsTabs, BsTab, BsTabContent, BsTabPane } from 'bootstrap-ng';

@Component({
  selector: 'docs-tabs-pills-example',
  imports: [BsTabs, BsTab, BsTabContent, BsTabPane],
  templateUrl: './pills.html',
})
export class TabsPillsExample {}
