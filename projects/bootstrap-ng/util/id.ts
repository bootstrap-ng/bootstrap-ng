let nextId = 0;

/** Returns an id that is unique for this page, such as `bs-collapse-3`. */
export function uniqueId(prefix: string): string {
  return `${prefix}-${nextId++}`;
}
