import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'bootstrap-ng',
    loadComponent: () => import('./pages/home/home'),
  },
  {
    path: 'getting-started',
    title: 'Introduction · bootstrap-ng',
    loadComponent: () => import('./pages/getting-started/introduction'),
  },
  {
    path: 'getting-started/quickstart',
    title: 'Quickstart · bootstrap-ng',
    loadComponent: () => import('./pages/getting-started/quickstart'),
  },
  {
    path: 'getting-started/conventions',
    title: 'Conventions · bootstrap-ng',
    loadComponent: () => import('./pages/getting-started/conventions'),
  },
  {
    path: 'getting-started/theming',
    title: 'Theming · bootstrap-ng',
    loadComponent: () => import('./pages/getting-started/theming'),
  },
  {
    path: 'getting-started/configuration',
    title: 'Global configuration · bootstrap-ng',
    loadComponent: () => import('./pages/getting-started/configuration'),
  },
  {
    path: 'getting-started/services',
    title: 'Services and helpers · bootstrap-ng',
    loadComponent: () => import('./pages/getting-started/services'),
  },
  {
    path: 'getting-started/server-rendering',
    title: 'Server-side rendering · bootstrap-ng',
    loadComponent: () => import('./pages/getting-started/server-rendering'),
  },
  {
    path: 'getting-started/accessibility',
    title: 'Accessibility · bootstrap-ng',
    loadComponent: () => import('./pages/getting-started/accessibility'),
  },
  {
    path: 'getting-started/internationalization',
    title: 'Internationalization · bootstrap-ng',
    loadComponent: () => import('./pages/getting-started/internationalization'),
  },
  {
    path: 'getting-started/content-security-policy',
    title: 'Content Security Policy · bootstrap-ng',
    loadComponent: () => import('./pages/getting-started/content-security-policy'),
  },
  {
    path: 'getting-started/vs-code',
    title: 'VS Code extension · bootstrap-ng',
    loadComponent: () => import('./pages/getting-started/vs-code'),
  },
  {
    path: 'getting-started/browsers',
    title: 'Browsers and devices · bootstrap-ng',
    loadComponent: () => import('./pages/getting-started/browsers'),
  },
  {
    path: 'getting-started/testing',
    title: 'Testing · bootstrap-ng',
    loadComponent: () => import('./pages/getting-started/testing'),
  },
  {
    path: 'getting-started/ai',
    title: 'AI · bootstrap-ng',
    loadComponent: () => import('./pages/getting-started/ai'),
  },
  {
    path: 'getting-started/changelog',
    title: 'Changelog · bootstrap-ng',
    loadComponent: () => import('./pages/getting-started/changelog'),
  },
  {
    path: 'components',
    loadChildren: () => import('./pages/components/components.routes'),
  },
  {
    path: 'forms',
    loadChildren: () => import('./pages/forms/forms.routes'),
  },
  { path: '**', redirectTo: '' },
];
