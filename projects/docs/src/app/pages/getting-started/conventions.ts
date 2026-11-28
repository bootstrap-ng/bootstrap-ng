import { DocsHeading } from '../../shared/heading';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsCode } from '../../shared/code';

@Component({
  selector: 'docs-conventions',
  imports: [DocsCode, DocsHeading, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './conventions.html',
})
export default class Conventions {
  protected readonly selectors = `<div bsAlert theme="info">…</div>
<button type="button" bsButton="outline" theme="primary">…</button>
<details bsAccordionItem>…</details>`;

  protected readonly twoWay = `<div bsCollapse [(open)]="filtersOpen">…</div>
<dialog bsDialog [(open)]="editing">…</dialog>`;

  protected readonly exportAs = `<button type="button" bsButton (click)="confirm.show()">Delete</button>
<dialog bsDialog #confirm="bsDialog">…</dialog>`;

  protected readonly all = `import { BOOTSTRAP_NG } from 'bootstrap-ng';

@Component({
  imports: [BOOTSTRAP_NG],
  …
})`;

  protected readonly entryPoints = `import { BsButton } from 'bootstrap-ng/button';
import { BsDatepicker } from 'bootstrap-ng/datepicker';`;

  protected readonly grouped = `import { BS_TABS } from 'bootstrap-ng/tabs';

@Component({
  // Same as [BsTabs, BsTab, BsTabContent, BsTabPane]
  imports: [BS_TABS],
  …
})`;

  protected readonly groups = [
    {
      name: 'BS_ACCORDION',
      entryPoint: 'bootstrap-ng/accordion',
      path: '/components/accordion',
      contains: 'BsAccordion, BsAccordionItem, BsAccordionHeader, BsAccordionBody',
    },
    {
      name: 'BS_BREADCRUMB',
      entryPoint: 'bootstrap-ng/breadcrumb',
      path: '/components/breadcrumb',
      contains: 'BsBreadcrumb, BsBreadcrumbLink',
    },
    {
      name: 'BS_BUTTON_GROUP',
      entryPoint: 'bootstrap-ng/button-group',
      path: '/components/button-group',
      contains: 'BsButtonGroup, BsButtonToolbar',
    },
    {
      name: 'BS_CAROUSEL',
      entryPoint: 'bootstrap-ng/carousel',
      path: '/components/carousel',
      contains:
        'BsCarousel, BsCarouselItem, BsCarouselPrev, BsCarouselNext, BsCarouselIndicator, BsCarouselPlayPause',
    },
    {
      name: 'BS_COLLAPSE',
      entryPoint: 'bootstrap-ng/collapse',
      path: '/components/collapse',
      contains: 'BsCollapse, BsCollapseToggle',
    },
    {
      name: 'BS_DIALOG',
      entryPoint: 'bootstrap-ng/dialog',
      path: '/components/dialog',
      contains: 'BsDialog, BsDialogClose',
    },
    {
      name: 'BS_DRAWER',
      entryPoint: 'bootstrap-ng/dialog',
      path: '/components/drawer',
      contains: 'BsDrawer, BsDrawerToggle, BsDialogClose',
    },
    {
      name: 'BS_FORMS',
      entryPoint: 'bootstrap-ng',
      path: '/forms/overview',
      contains: 'Form controls, field layout and validation directives, except BsTypeahead',
    },
    {
      name: 'BS_LIST_GROUP',
      entryPoint: 'bootstrap-ng/list-group',
      path: '/components/list-group',
      contains: 'BsListGroup, BsListGroupItem',
    },
    {
      name: 'BS_MENU',
      entryPoint: 'bootstrap-ng/menu',
      path: '/components/menu',
      contains: 'BsMenu, BsMenuToggle, BsSubmenu',
    },
    {
      name: 'BS_NAV',
      entryPoint: 'bootstrap-ng/nav',
      path: '/components/nav',
      contains: 'BsNav, BsNavLink, BsNavOverflow',
    },
    {
      name: 'BS_PROGRESS',
      entryPoint: 'bootstrap-ng/progress',
      path: '/components/progress',
      contains: 'BsProgress, BsProgressStacked',
    },
    {
      name: 'BS_STEPPER',
      entryPoint: 'bootstrap-ng/stepper',
      path: '/components/stepper',
      contains: 'BsStepper, BsStepperItem',
    },
    {
      name: 'BS_TABS',
      entryPoint: 'bootstrap-ng/tabs',
      path: '/components/tab',
      contains: 'BsTabs, BsTab, BsTabContent, BsTabPane',
    },
    {
      name: 'BS_TOAST',
      entryPoint: 'bootstrap-ng/toast',
      path: '/components/toasts',
      contains: 'BsToast, BsToastClose',
    },
  ];
}
