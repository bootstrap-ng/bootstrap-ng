import { Component } from '@angular/core';
import { BsBreadcrumb, BsBreadcrumbLink } from 'bootstrap-ng';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'docs-breadcrumb-router-example',
  imports: [BsBreadcrumb, BsBreadcrumbLink, RouterLink],
  templateUrl: './router.html',
})
export class BreadcrumbRouterExample {
  protected readonly items = [
    { label: 'Docs', href: '/' },
    { label: 'Components', href: '/components/accordion' },
    { label: 'Breadcrumb', href: '/components/breadcrumb' },
  ];
}
