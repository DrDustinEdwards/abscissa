/** Helpers for reading caller data by key, with errors that name the chart, row and field. */

/** The keys of `T` whose values are assignable to `V`. */
export type KeysOfType<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T] &
  string;

/** Formats a number for tooltips and tables when the caller gives no formatter. */
export function defaultFormat(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

/** Reads a finite number, or throws naming where it was expected. */
export function readNumber(kind: string, row: object, key: string, index: number): number {
  const value: unknown = (row as Record<string, unknown>)[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(
      `${kind}: row ${index + 1} field "${key}" is ${String(value)}, not a finite number`,
    );
  }
  return value;
}

/** Reads a number or null (a gap), or throws. */
export function readNumberOrNull(
  kind: string,
  row: object,
  key: string,
  index: number,
): number | null {
  const value: unknown = (row as Record<string, unknown>)[key];
  if (value === null || value === undefined) return null;
  return readNumber(kind, row, key, index);
}

/** Reads a category: a non-empty string or a finite number (a year, a dose), or throws. */
export function readCategory(
  kind: string,
  row: object,
  key: string,
  index: number,
): string | number {
  const value: unknown = (row as Record<string, unknown>)[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value !== "") return value;
  throw new Error(
    `${kind}: row ${index + 1} field "${key}" is ${JSON.stringify(value)}, not a label`,
  );
}

/** Reads a category as text. */
export function readLabel(kind: string, row: object, key: string, index: number): string {
  return String(readCategory(kind, row, key, index));
}

/** Reads a Date, an ISO 8601 string or a timestamp as a Date, or throws. */
export function readDate(kind: string, row: object, key: string, index: number): Date {
  const value: unknown = (row as Record<string, unknown>)[key];
  const date =
    value instanceof Date
      ? value
      : typeof value === "string" || typeof value === "number"
        ? new Date(value)
        : undefined;
  if (!date || Number.isNaN(date.getTime())) {
    throw new Error(
      `${kind}: row ${index + 1} field "${key}" is ${JSON.stringify(value)}, not a date`,
    );
  }
  return date;
}

/**
 * The distinct values of a label field in first-seen order, or ascending when every value is a
 * number (years, doses), or `explicit` when the caller fixed the order. Throws if data holds a
 * value `explicit` leaves out.
 */
export function domainOf(
  kind: string,
  field: string,
  values: readonly (string | number)[],
  explicit: readonly (string | number)[] | undefined,
): string[] {
  if (explicit) {
    const allowed = new Set(explicit.map(String));
    for (const v of values) {
      if (!allowed.has(String(v))) {
        throw new Error(`${kind}: ${field} value "${v}" is missing from the ${field} domain given`);
      }
    }
    return explicit.map(String);
  }
  const distinct = [...new Set(values)];
  if (distinct.every((v) => typeof v === "number")) {
    return (distinct as number[]).sort((a, b) => a - b).map(String);
  }
  return distinct.map(String);
}
