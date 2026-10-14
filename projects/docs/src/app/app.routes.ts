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
    path: 'components',
    loadChildren: () => import('./pages/components/components.routes'),
  },
  {
    path: 'forms',
    loadChildren: () => import('./pages/forms/forms.routes'),
  },
  { path: '**', redirectTo: '' },
];
