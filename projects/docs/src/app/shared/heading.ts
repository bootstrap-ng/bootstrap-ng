import { Component, ElementRef, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * A section heading with an `id` and a "#" link to it that appears on hover and focus, like the
 * anchor links in Bootstrap's docs, e.g. `<h2 docsHeading id="usage">Usage</h2>`.
 */
@Component({
  selector: 'h2[docsHeading], h3[docsHeading]',
  imports: [RouterLink],
  host: { '[id]': 'id()' },
  template: `<ng-content />
    <a
      class="anchor-link fw-normal text-decoration-none px-1"
      [routerLink]="[]"
      [fragment]="id()"
      [attr.aria-label]="label()"></a>`,
  styles: `
    .anchor-link {
      color: color-mix(in srgb, var(--bs-link-color), transparent 50%);
      opacity: 0;
      transition:
        color 0.15s ease-in-out,
        opacity 0.15s ease-in-out;
    }

    .anchor-link::after {
      content: '#';
    }

    .anchor-link:focus,
    .anchor-link:hover,
    :host(:hover) .anchor-link,
    :host(:target) .anchor-link {
      color: var(--bs-link-color);
      opacity: 1;
    }

    @media (prefers-reduced-motion: reduce) {
      .anchor-link {
        transition: none;
      }
    }
  `,
})
export class DocsHeading {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly id = input.required<string>();

  // The projected heading text is in place by the time this view renders, so the label is part
  // of the prerendered HTML.
  protected label(): string {
    return `Link to this section: ${this.host.nativeElement.textContent.trim()}`;
  }
}
