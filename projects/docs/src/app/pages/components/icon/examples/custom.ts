import { Component, inject } from '@angular/core';
import { BsIcon, BsIconRegistry } from 'bootstrap-ng';

@Component({
  selector: 'docs-icon-custom-example',
  imports: [BsIcon],
  templateUrl: './custom.html',
})
export class IconCustomExample {
  constructor() {
    // Usually done once, with provideBsIcons() in your app config.
    inject(BsIconRegistry).register('lucide', {
      resolver: (name) => `https://cdn.jsdelivr.net/npm/lucide-static@1.48.0/icons/${name}.svg`,
    });
  }
}
