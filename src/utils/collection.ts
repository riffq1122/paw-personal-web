// Generic collection filter using a type-safe predicate callback.
export function filterItems<T>(items: readonly T[], predicate: (item: T) => boolean): T[] {
  return items.filter(predicate);
}
