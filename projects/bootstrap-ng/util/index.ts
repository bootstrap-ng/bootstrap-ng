export * from './theme';
export { getTransitionDuration, waitForTransition } from './transition';
export { uniqueId } from './id';
export type { BsPlacement } from './floating';
export { BsLiveAnnouncer } from './announcer';

// Shared by the other entry points. Not re-exported from `bootstrap-ng` and not part of the public API.
export { configToken, provideConfig } from './config';
export { autoPosition } from './floating';
export { adjacentTabbable, tabbables } from './focus';
