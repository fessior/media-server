/**
 * Common utitlies for object manipulation.
 */

export function hasUndefinedField(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some(
    value => value === undefined || value === null,
  );
}
