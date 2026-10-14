import { Component, contentChild, Directive, input, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

/** One page in a `bsBreadcrumb` trail. */
export interface BsBreadcrumbItem {
  label: string;
  /** Link to the page. Leave it out for a page without a link. */
  href?: string;
}

/** Context of a `bsBreadcrumbLink` template. */
export interface BsBreadcrumbLinkContext<T extends BsBreadcrumbItem = BsBreadcrumbItem> {
  $implicit: T;
  /** Whether this item is the current page. */
  current: boolean;
}

/**
 * Custom content for each item of a `bsBreadcrumb`, for example to use `routerLink`.
 *
 * ```html
 * <ng-template bsBreadcrumbLink let-item let-current="current">
 *   <a class="breadcrumb-link" [class.active]="current" [routerLink]="item.link">{{ item.label }}</a>
 * </ng-template>
 * ```
 */
@Directive({ selector: 'ng-template[bsBreadcrumbLink]' })
export class BsBreadcrumbLink {
  static ngTemplateContextGuard(
    _dir: BsBreadcrumbLink,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- only the type predicate uses it
    context: unknown,
  ): context is BsBreadcrumbLinkContext {
    return true;
  }
}

/**
 * Breadcrumb trail rendered inside the `<nav>` it is applied to, with dividers
 * between the items. The last item is the current page and gets `aria-current`.
 *
 * ```html
 * <nav bsBreadcrumb [items]="[{ label: 'Home', href: '/' }, { label: 'Library' }]"></nav>
 * ```
 */
@Component({
  selector: 'nav[bsBreadcrumb]',
  exportAs: 'bsBreadcrumb',
  imports: [NgTemplateOutlet],
  host: { '[attr.aria-label]': 'label()' },
  template: `
    <ol class="breadcrumb">
      @for (item of items(); track $index) {
        <li class="breadcrumb-item" [attr.aria-current]="$last ? 'page' : null">
          @if (link(); as template) {
            <ng-container
              [ngTemplateOutlet]="template"
              [ngTemplateOutletContext]="{ $implicit: item, current: $last }" />
          } @else if (item.href && !$last) {
            <a class="breadcrumb-link" [href]="item.href">{{ item.label }}</a>
          } @else {
            <span class="breadcrumb-link" [class.active]="$last">{{ item.label }}</span>
          }
        </li>
        @if (!$last) {
          <li class="breadcrumb-divider" aria-hidden="true">{{ divider() }}</li>
        }
      }
    </ol>
  `,
})
export class BsBreadcrumb {
  /** Pages from the top level down to the current page. */
  readonly items = input.required<readonly BsBreadcrumbItem[]>();
  /** Divider text. Empty uses Bootstrap's chevron icon. */
  readonly divider = input('');
  /** Accessible name of the navigation landmark. */
  readonly label = input('Breadcrumb');

  protected readonly link = contentChild(BsBreadcrumbLink, { read: TemplateRef });
}
