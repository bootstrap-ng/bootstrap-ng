import { Component, signal } from '@angular/core';
import { BsCheck, BsCollapse, BsFormField, BsLabel } from 'bootstrap-ng';

@Component({
  selector: 'docs-collapse-model-example',
  imports: [BsCheck, BsCollapse, BsFormField, BsLabel],
  templateUrl: './model.html',
})
export class CollapseModelExample {
  protected readonly open = signal(false);
  protected readonly events = signal<string[]>([]);

  protected log(event: string): void {
    this.events.update((events) => [...events, event]);
  }
}
