interface LongLike {
  low: number;
  high: number;
  unsigned: boolean;
}

type Decoded<T> = T extends Uint8Array
  ? string
  : T extends string | null | undefined
    ? T
    : T extends LongLike
      ? number
      : T extends Array<infer U>
        ? Decoded<U>[]
        : T extends object
          ? { [K in keyof T]: Decoded<T[K]> }
          : T;

/**
 * Determine if a value is a Long-like object
 * @param value The value to check
 * @returns Whether the value is a Long-like object
 */
function isLongLike(value: unknown): value is LongLike {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return (
    typeof (value as LongLike).low === 'number' &&
    typeof (value as LongLike).high === 'number' &&
    typeof (value as LongLike).unsigned === 'boolean'
  );
}

/**
 * Converts a Long to a number.
 * @param long The Long-like object to convert to a number
 * @returns The number representation of the Long.
 */
function longToNumber(long: LongLike): number {
  const { low, high, unsigned } = long;
  if (unsigned) {
    return high * 0x100000000 + (low >>> 0);
  }
  return high * 0x100000000 + (low >>> 0);
}

/**
 * Decode a value. This function is used to convert values from the Temporal API to a more usable format.
 * @param value The value to decode
 * @returns The decoded value
 */
export function decode<T>(value: T): Decoded<T> {
  if (value instanceof Uint8Array) {
    return new TextDecoder().decode(value) as Decoded<T>;
  } else if (
    typeof value === 'string' ||
    value === null ||
    value === undefined
  ) {
    return value as Decoded<T>;
  } else if (isLongLike(value)) {
    return longToNumber(value) as Decoded<T>;
  } else if (Array.isArray(value)) {
    return value.map((v) => decode(v)) as Decoded<T>;
  } else if (typeof value === 'object' && value !== null) {
    const decodedObject: any = {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        decodedObject[key] = decode(value[key]);
      }
    }
    return decodedObject as Decoded<T>;
  } else {
    return value as Decoded<T>;
  }
}
