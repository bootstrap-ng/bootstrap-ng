import { RenderMode, ServerRoute } from '@angular/ssr';

/** Every docs page is prerendered to static HTML, which Pagefind then indexes for search. */
export const serverRoutes: ServerRoute[] = [{ path: '**', renderMode: RenderMode.Prerender }];
