import { Component, signal } from '@angular/core';
import { BsToast, BsToastClose, BsButton, BsCloseButton } from 'bootstrap-ng';

@Component({
  selector: 'docs-toast-stack-example',
  imports: [BsToast, BsToastClose, BsButton, BsCloseButton],
  templateUrl: './stack.html',
})
export class ToastStackExample {
  private nextId = 1;
  protected readonly messages = signal<{ id: number; text: string }[]>([]);

  protected add(): void {
    const id = this.nextId++;
    this.messages.update((list) => [...list, { id, text: `This is toast number ${id}.` }]);
  }

  protected remove(id: number): void {
    this.messages.update((list) => list.filter((message) => message.id !== id));
  }
}
