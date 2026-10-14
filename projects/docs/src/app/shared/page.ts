import { DocsHeading } from './heading';
import { LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, Type } from '@angular/core';
import { DocsApi, DocsApiDirective } from './api';
import { DocsExample } from './example';

export interface DocsPageSection {
  id: string;
  title: string;
  /** Trusted HTML written in this repository. */
  description: string;
  example: Type<unknown>;
  html: string;
  ts?: string;
}

export interface DocsPageData {
  title: string;
  lead: string;
  /** Link to the matching Bootstrap documentation page, when Bootstrap has one. */
  bootstrapDocs?: string;
  sections: DocsPageSection[];
  api: DocsApiDirective[];
}

/** Layout of a component page: title, examples and API reference. */
@Component({
  selector: 'docs-page',
  imports: [DocsExample, DocsApi, DocsHeading, LowerCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>{{ page().title }}</h1>
    <p class="fs-lg fg-2">{{ page().lead }}</p>
    @if (page().bootstrapDocs; as docs) {
      <p class="fs-sm">
        <a [href]="docs">Bootstrap’s {{ page().title | lowercase }} docs</a>
        describe the markup and CSS.
      </p>
    }

    @for (section of page().sections; track section.id) {
      <h2 class="mt-11" [id]="section.id" docsHeading>
        {{ section.title }}
      </h2>
      <p [innerHTML]="section.description"></p>
      <docs-example [component]="section.example" [html]="section.html" [ts]="section.ts ?? null" />
    }

    <docs-api [directives]="page().api" />
  `,
})
export class DocsPage {
  readonly page = input.required<DocsPageData>();
}
