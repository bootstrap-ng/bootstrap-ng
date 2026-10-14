import { Routes } from '@angular/router';

export default [
  {
    path: 'overview',
    title: 'Forms · bootstrap-ng',
    loadComponent: () => import('./overview/overview'),
  },
  {
    path: 'field',
    title: 'Field · bootstrap-ng',
    loadComponent: () => import('./field/field'),
  },
  {
    path: 'form-control',
    title: 'Form control · bootstrap-ng',
    loadComponent: () => import('./form-control/form-control'),
  },
  {
    path: 'checkbox',
    title: 'Checkbox · bootstrap-ng',
    loadComponent: () => import('./checkbox/checkbox'),
  },
  {
    path: 'radio',
    title: 'Radio · bootstrap-ng',
    loadComponent: () => import('./radio/radio'),
  },
  {
    path: 'switch',
    title: 'Switch · bootstrap-ng',
    loadComponent: () => import('./switch/switch'),
  },
  {
    path: 'range',
    title: 'Range · bootstrap-ng',
    loadComponent: () => import('./range/range'),
  },
  {
    path: 'input-group',
    title: 'Input group · bootstrap-ng',
    loadComponent: () => import('./input-group/input-group'),
  },
  {
    path: 'floating-labels',
    title: 'Floating labels · bootstrap-ng',
    loadComponent: () => import('./floating-labels/floating-labels'),
  },
  {
    path: 'form-adorn',
    title: 'Form adorn · bootstrap-ng',
    loadComponent: () => import('./form-adorn/form-adorn'),
  },
  {
    path: 'chips',
    title: 'Chips · bootstrap-ng',
    loadComponent: () => import('./chips/chips'),
  },
  {
    path: 'combobox',
    title: 'Combobox · bootstrap-ng',
    loadComponent: () => import('./combobox/combobox'),
  },
  {
    path: 'typeahead',
    title: 'Typeahead · bootstrap-ng',
    loadComponent: () => import('./typeahead/typeahead'),
  },
  {
    path: 'datepicker',
    title: 'Datepicker · bootstrap-ng',
    loadComponent: () => import('./datepicker/datepicker'),
  },
  {
    path: 'otp-input',
    title: 'OTP input · bootstrap-ng',
    loadComponent: () => import('./otp-input/otp-input'),
  },
  {
    path: 'password-strength',
    title: 'Password strength · bootstrap-ng',
    loadComponent: () => import('./password-strength/password-strength'),
  },
  {
    path: 'rating',
    title: 'Rating · bootstrap-ng',
    loadComponent: () => import('./rating/rating'),
  },
  {
    path: 'file-dropzone',
    title: 'File dropzone · bootstrap-ng',
    loadComponent: () => import('./file-dropzone/file-dropzone'),
  },
  {
    path: 'layout',
    title: 'Layout · bootstrap-ng',
    loadComponent: () => import('./layout/layout'),
  },
  {
    path: 'validation',
    title: 'Validation · bootstrap-ng',
    loadComponent: () => import('./validation/validation'),
  },
  { path: '', pathMatch: 'full', redirectTo: 'overview' },
] satisfies Routes;
