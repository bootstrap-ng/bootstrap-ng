export interface DocsNavItem {
  title: string;
  path: string;
}

export interface DocsNavSection {
  title: string;
  items: DocsNavItem[];
}

export const COMPONENT_PAGES: DocsNavItem[] = [
  { title: 'Accordion', path: 'components/accordion' },
  { title: 'Alert', path: 'components/alert' },
  { title: 'Avatar', path: 'components/avatar' },
  { title: 'Badge', path: 'components/badge' },
  { title: 'Breadcrumb', path: 'components/breadcrumb' },
  { title: 'Button', path: 'components/button' },
  { title: 'Button group', path: 'components/button-group' },
  { title: 'Card', path: 'components/card' },
  { title: 'Carousel', path: 'components/carousel' },
  { title: 'Close button', path: 'components/close-button' },
  { title: 'Collapse', path: 'components/collapse' },
  { title: 'Dialog', path: 'components/dialog' },
  { title: 'Drawer', path: 'components/drawer' },
  { title: 'Icon', path: 'components/icon' },
  { title: 'List group', path: 'components/list-group' },
  { title: 'Menu', path: 'components/menu' },
  { title: 'Nav', path: 'components/nav' },
  { title: 'Nav overflow', path: 'components/nav-overflow' },
  { title: 'Navbar', path: 'components/navbar' },
  { title: 'Pagination', path: 'components/pagination' },
  { title: 'Placeholder', path: 'components/placeholder' },
  { title: 'Popover', path: 'components/popover' },
  { title: 'Progress', path: 'components/progress' },
  { title: 'Scrollspy', path: 'components/scrollspy' },
  { title: 'Spinner', path: 'components/spinner' },
  { title: 'Stepper', path: 'components/stepper' },
  { title: 'Tab', path: 'components/tab' },
  { title: 'Toasts', path: 'components/toasts' },
  { title: 'Toggler', path: 'components/toggler' },
  { title: 'Tooltip', path: 'components/tooltip' },
];

export const FORM_PAGES: DocsNavItem[] = [
  { title: 'Overview', path: 'forms/overview' },
  { title: 'Field', path: 'forms/field' },
  { title: 'Form control', path: 'forms/form-control' },
  { title: 'Checkbox', path: 'forms/checkbox' },
  { title: 'Radio', path: 'forms/radio' },
  { title: 'Switch', path: 'forms/switch' },
  { title: 'Range', path: 'forms/range' },
  { title: 'Input group', path: 'forms/input-group' },
  { title: 'Floating labels', path: 'forms/floating-labels' },
  { title: 'Form adorn', path: 'forms/form-adorn' },
  { title: 'Chips', path: 'forms/chips' },
  { title: 'Combobox', path: 'forms/combobox' },
  { title: 'Typeahead', path: 'forms/typeahead' },
  { title: 'Datepicker', path: 'forms/datepicker' },
  { title: 'OTP input', path: 'forms/otp-input' },
  { title: 'Password strength', path: 'forms/password-strength' },
  { title: 'Rating', path: 'forms/rating' },
  { title: 'Layout', path: 'forms/layout' },
  { title: 'Validation', path: 'forms/validation' },
];

export const NAV: DocsNavSection[] = [
  {
    title: 'Getting started',
    items: [
      { title: 'Introduction', path: 'getting-started' },
      { title: 'Quickstart', path: 'getting-started/quickstart' },
      { title: 'Conventions', path: 'getting-started/conventions' },
      { title: 'Theming', path: 'getting-started/theming' },
      { title: 'Services and helpers', path: 'getting-started/services' },
      { title: 'Server-side rendering', path: 'getting-started/server-rendering' },
      { title: 'Accessibility', path: 'getting-started/accessibility' },
    ],
  },
  { title: 'Components', items: COMPONENT_PAGES },
  { title: 'Forms', items: FORM_PAGES },
];
