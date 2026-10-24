import {
  Component,
  contentChild,
  Directive,
  inject,
  input,
  Provider,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { configToken, provideConfig } from 'bootstrap-ng/util';

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

/** Defaults for the inputs of breadcrumbs. Inputs set on a component win over them. */
export interface BsBreadcrumbConfig {
  /** Divider text. Empty uses Bootstrap's chevron icon. */
  divider: string;
  /** Accessible name of the navigation landmark. */
  label: string;
}

/** The defaults set with `provideBsBreadcrumbConfig()`. */
export const BS_BREADCRUMB_CONFIG = configToken<BsBreadcrumbConfig>('BS_BREADCRUMB_CONFIG');

/**
 * Sets defaults for the inputs of breadcrumbs, for the whole app in `bootstrapApplication()`,
 * or for part of it in a component's `providers`.
 *
 * ```ts
 * providers: [provideBsBreadcrumbConfig({ label: 'Fil d’Ariane' })]
 * ```
 */
export function provideBsBreadcrumbConfig(config: Partial<BsBreadcrumbConfig>): Provider {
  return provideConfig(BS_BREADCRUMB_CONFIG, config);
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
  private readonly config = inject(BS_BREADCRUMB_CONFIG);
  /** Pages from the top level down to the current page. */
  readonly items = input.required<readonly BsBreadcrumbItem[]>();
  /** Divider text. Empty uses Bootstrap's chevron icon. */
  readonly divider = input(this.config.divider ?? '');
  /** Accessible name of the navigation landmark. */
  readonly label = input(this.config.label ?? 'Breadcrumb');

  protected readonly link = contentChild(BsBreadcrumbLink, { read: TemplateRef });
}

/** The breadcrumb directives, to add to `imports` together. */
export const BS_BREADCRUMB = [BsBreadcrumb, BsBreadcrumbLink] as const;
