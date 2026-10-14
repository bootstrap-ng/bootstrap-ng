import { Component, signal } from '@angular/core';
import { BsPlaceholder, BsButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-placeholder-basic-example',
  imports: [BsPlaceholder, BsButton],
  templateUrl: './basic.html',
})
export class PlaceholderBasicExample {
  protected readonly loading = signal(true);
}
