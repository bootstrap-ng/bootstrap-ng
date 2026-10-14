import { Routes } from '@angular/router';

export default [
  {
    path: 'accordion',
    title: 'Accordion · bootstrap-ng',
    loadComponent: () => import('./accordion/accordion'),
  },
  {
    path: 'alert',
    title: 'Alert · bootstrap-ng',
    loadComponent: () => import('./alert/alert'),
  },
  {
    path: 'avatar',
    title: 'Avatar · bootstrap-ng',
    loadComponent: () => import('./avatar/avatar'),
  },
  {
    path: 'badge',
    title: 'Badge · bootstrap-ng',
    loadComponent: () => import('./badge/badge'),
  },
  {
    path: 'breadcrumb',
    title: 'Breadcrumb · bootstrap-ng',
    loadComponent: () => import('./breadcrumb/breadcrumb'),
  },
  {
    path: 'button',
    title: 'Button · bootstrap-ng',
    loadComponent: () => import('./button/button'),
  },
  {
    path: 'button-group',
    title: 'Button group · bootstrap-ng',
    loadComponent: () => import('./button-group/button-group'),
  },
  {
    path: 'card',
    title: 'Card · bootstrap-ng',
    loadComponent: () => import('./card/card'),
  },
  {
    path: 'carousel',
    title: 'Carousel · bootstrap-ng',
    loadComponent: () => import('./carousel/carousel'),
  },
  {
    path: 'close-button',
    title: 'Close button · bootstrap-ng',
    loadComponent: () => import('./close-button/close-button'),
  },
  {
    path: 'collapse',
    title: 'Collapse · bootstrap-ng',
    loadComponent: () => import('./collapse/collapse'),
  },
  {
    path: 'dialog',
    title: 'Dialog · bootstrap-ng',
    loadComponent: () => import('./dialog/dialog'),
  },
  {
    path: 'drawer',
    title: 'Drawer · bootstrap-ng',
    loadComponent: () => import('./drawer/drawer'),
  },
  {
    path: 'icon',
    title: 'Icon · bootstrap-ng',
    loadComponent: () => import('./icon/icon'),
  },
  {
    path: 'list-group',
    title: 'List group · bootstrap-ng',
    loadComponent: () => import('./list-group/list-group'),
  },
  {
    path: 'menu',
    title: 'Menu · bootstrap-ng',
    loadComponent: () => import('./menu/menu'),
  },
  {
    path: 'nav',
    title: 'Nav · bootstrap-ng',
    loadComponent: () => import('./nav/nav'),
  },
  {
    path: 'nav-overflow',
    title: 'Nav overflow · bootstrap-ng',
    loadComponent: () => import('./nav-overflow/nav-overflow'),
  },
  {
    path: 'navbar',
    title: 'Navbar · bootstrap-ng',
    loadComponent: () => import('./navbar/navbar'),
  },
  {
    path: 'pagination',
    title: 'Pagination · bootstrap-ng',
    loadComponent: () => import('./pagination/pagination'),
  },
  {
    path: 'placeholder',
    title: 'Placeholder · bootstrap-ng',
    loadComponent: () => import('./placeholder/placeholder'),
  },
  {
    path: 'popover',
    title: 'Popover · bootstrap-ng',
    loadComponent: () => import('./popover/popover'),
  },
  {
    path: 'progress',
    title: 'Progress · bootstrap-ng',
    loadComponent: () => import('./progress/progress'),
  },
  {
    path: 'scrollspy',
    title: 'Scrollspy · bootstrap-ng',
    loadComponent: () => import('./scrollspy/scrollspy'),
  },
  {
    path: 'spinner',
    title: 'Spinner · bootstrap-ng',
    loadComponent: () => import('./spinner/spinner'),
  },
  {
    path: 'stepper',
    title: 'Stepper · bootstrap-ng',
    loadComponent: () => import('./stepper/stepper'),
  },
  {
    path: 'tab',
    title: 'Tab · bootstrap-ng',
    loadComponent: () => import('./tab/tab'),
  },
  {
    path: 'table',
    title: 'Table · bootstrap-ng',
    loadComponent: () => import('./table/table'),
  },
  {
    path: 'toasts',
    title: 'Toasts · bootstrap-ng',
    loadComponent: () => import('./toasts/toasts'),
  },
  {
    path: 'toggler',
    title: 'Toggler · bootstrap-ng',
    loadComponent: () => import('./toggler/toggler'),
  },
  {
    path: 'tooltip',
    title: 'Tooltip · bootstrap-ng',
    loadComponent: () => import('./tooltip/tooltip'),
  },
  { path: '', pathMatch: 'full', redirectTo: 'accordion' },
  // Old page names, kept so existing links still work.
  { path: 'tabs', redirectTo: 'tab' },
  { path: 'toast', redirectTo: 'toasts' },
] satisfies Routes;
