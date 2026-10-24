import { Component, inject } from '@angular/core';
import { BsIcon, BsIconRegistry } from 'bootstrap-ng';

@Component({
  selector: 'docs-icon-bundled-example',
  imports: [BsIcon],
  templateUrl: './bundled.html',
})
export class IconBundledExample {
  constructor() {
    // Usually done once, with provideBsIcons() in your app config.
    inject(BsIconRegistry).addIcons('shapes', {
      circle: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="7"/></svg>',
      square: '<svg viewBox="0 0 16 16"><rect x="1" y="1" width="14" height="14" rx="2"/></svg>',
      triangle: '<svg viewBox="0 0 16 16"><path d="M8 1 15 15H1z"/></svg>',
    });
  }
}
