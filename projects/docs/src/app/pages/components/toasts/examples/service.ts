import { Component, inject, TemplateRef, viewChild } from '@angular/core';
import { BsButton, BsToastContext, BsToaster } from 'bootstrap-ng';

@Component({
  selector: 'docs-toast-service-example',
  imports: [BsButton],
  templateUrl: './service.html',
})
export class ToastServiceExample {
  protected readonly toaster = inject(BsToaster);
  private readonly undo = viewChild.required<TemplateRef<BsToastContext>>('undo');

  protected save(): void {
    this.toaster.show({ title: 'Saved', subtitle: 'just now', body: 'Your changes were saved.' });
  }

  protected fail(): void {
    this.toaster.show({
      body: 'Could not reach the server.',
      theme: 'danger',
      live: 'assertive',
      autohide: false,
    });
  }

  protected archive(): void {
    this.toaster.show({ body: this.undo(), delay: 8000 });
  }
}
