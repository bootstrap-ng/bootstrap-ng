import { Component, signal } from '@angular/core';
import { BsListGroup, BsListGroupItem } from 'bootstrap-ng';

@Component({
  selector: 'docs-list-group-actions-example',
  imports: [BsListGroup, BsListGroupItem],
  templateUrl: './actions.html',
})
export class ListGroupActionsExample {
  protected readonly selected = signal('Inbox');
  protected readonly folders = ['Inbox', 'Sent', 'Drafts'];
}
