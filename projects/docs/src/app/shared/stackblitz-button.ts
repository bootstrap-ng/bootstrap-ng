import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  reflectComponentType,
  Type,
} from '@angular/core';
import { BsButton, BsTooltip } from 'bootstrap-ng';

/** A project that scripts/stackblitz.mjs writes for each example. */
interface StackBlitzProject {
  title: string;
  description: string;
  openFile: string;
  files: Record<string, string>;
}

/**
 * An icon button that opens an example in a new StackBlitz project. The project's files come
 * from `stackblitz/<example selector>.json`, which scripts/stackblitz.mjs writes at build time,
 * and are posted to StackBlitz in a form, like the StackBlitz SDK does.
 */
@Component({
  selector: 'docs-stackblitz-button',
  imports: [BsButton, BsTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      bsButton="text"
      size="sm"
      icon
      bsTooltip="Open in StackBlitz"
      aria-label="Open in StackBlitz"
      (click)="open()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M10.797 14.182H3.635L16.728 0l-3.525 9.818h7.162L7.272 24l3.524-9.818Z" />
      </svg>
    </button>
  `,
})
export class DocsStackBlitzButton {
  private readonly document = inject(DOCUMENT);

  readonly component = input.required<Type<unknown>>();

  private readonly selector = computed(() => reflectComponentType(this.component())?.selector);

  protected async open(): Promise<void> {
    // Open the tab while the click still counts as a user action, so popup blockers allow it,
    // then post the project into it once it has loaded.
    const target = `stackblitz-${this.selector() ?? ''}`;
    const tab = this.document.defaultView?.open('', target);
    const response = await fetch(`stackblitz/${this.selector() ?? ''}.json`);
    if (!response.ok) {
      tab?.close();
      return;
    }
    const project = (await response.json()) as StackBlitzProject;
    const form = this.document.createElement('form');
    form.method = 'post';
    form.action = `https://stackblitz.com/run?file=${encodeURIComponent(project.openFile)}`;
    form.target = target;
    form.hidden = true;
    const fields: Record<string, string> = {
      'project[title]': project.title,
      'project[description]': project.description,
      'project[template]': 'node',
    };
    for (const [path, content] of Object.entries(project.files)) {
      fields[`project[files][${path}]`] = content;
    }
    for (const [name, value] of Object.entries(fields)) {
      const field = this.document.createElement('input');
      field.type = 'hidden';
      field.name = name;
      field.value = value;
      form.append(field);
    }
    this.document.body.append(form);
    form.submit();
    form.remove();
  }
}
