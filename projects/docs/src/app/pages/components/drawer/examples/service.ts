import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import {
  BsButton,
  BsCloseButton,
  BsDialogContext,
  BsDialogService,
  BsDialogClose,
  BsListGroup,
  BsListGroupItem,
} from 'bootstrap-ng';

@Component({
  selector: 'docs-drawer-service-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BsButton, BsCloseButton, BsDialogClose, BsListGroup, BsListGroupItem],
  templateUrl: './service.html',
})
export class DrawerServiceExample {
  private readonly dialogs = inject(BsDialogService);
  private readonly picker = viewChild.required<TemplateRef<BsDialogContext<string>>>('picker');
  protected readonly sizes = ['Small', 'Medium', 'Large'];
  protected readonly size = signal('Medium');

  protected async choose(): Promise<void> {
    const ref = this.dialogs.openDrawer(this.picker(), { placement: 'end' });
    const size = await ref.result;
    if (size) {
      this.size.set(size);
    }
  }
}
