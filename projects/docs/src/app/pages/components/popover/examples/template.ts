import { Component, signal } from '@angular/core';
import { BsPopover, BsButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-popover-template-example',
  imports: [BsPopover, BsButton],
  templateUrl: './template.html',
})
export class PopoverTemplateExample {
  protected readonly count = signal(42);
}
