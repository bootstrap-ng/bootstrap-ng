import { DOCUMENT, Location } from '@angular/common';
import { inject } from '@angular/core';
import { NavigationError } from '@angular/router';

/** Messages browsers use when a dynamic `import()` can't load its module. */
const CHUNK_LOAD_ERROR =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i;

/**
 * Router navigation error handler for pages whose code chunk no longer exists.
 *
 * Every deploy gives the lazy-loaded page chunks new hashed file names and removes the old ones,
 * so a tab opened before the deploy fails to load the next page it navigates to. When that
 * happens, load the page in full instead: the fresh HTML references the current chunks.
 *
 * The first navigation already happens on a fresh page load, so it is left alone to avoid a
 * reload loop if a chunk is genuinely missing.
 */
export function reloadOnChunkLoadError(event: NavigationError): void {
  const { location } = inject(DOCUMENT);
  const href = inject(Location).prepareExternalUrl(event.url);
  const isChunkError = event.error instanceof Error && CHUNK_LOAD_ERROR.test(event.error.message);
  if (isChunkError && href !== location.pathname + location.search + location.hash) {
    location.assign(href);
  }
}
