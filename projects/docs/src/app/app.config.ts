import { LocationStrategy, TrailingSlashPathLocationStrategy } from '@angular/common';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withNavigationErrorHandler,
} from '@angular/router';
import { routes } from './app.routes';
import { reloadOnChunkLoadError } from './chunk-load-error';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      withNavigationErrorHandler(reloadOnChunkLoadError),
    ),
    // Page URLs end in "/", matching the folders prerendering writes (`alert/index.html`), so
    // Cloudflare Pages serves them without a redirect.
    { provide: LocationStrategy, useClass: TrailingSlashPathLocationStrategy },
  ],
};
