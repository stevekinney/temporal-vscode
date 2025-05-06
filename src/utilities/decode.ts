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
  const lowUnsigned = low >>> 0;

  if (!unsigned && high === -1) {
    return -((~low + 1) >>> 0);
  } else if (!unsigned && high < 0) {
    return -(
      (~high + (lowUnsigned === 0 ? 1 : 0)) * 0x100000000 +
      (~lowUnsigned + 1)
    );
  }

  return high * 0x100000000 + lowUnsigned;
}

/**
 * Decode a value. This function is used to convert values from the Temporal API to a more usable format.
 * The function handles Uint8Array, string, null, undefined, Long-like objects, arrays, and objects.
 * It's primarily used for `CountWorkflow`.
 * @param value The value to decode
 * @returns The decoded value
 */
export function decode<T>(value: T): Decoded<T> {
  if (value instanceof Uint8Array) {
    return new TextDecoder().decode(value) as Decoded<T>;
  } else if (
    typeof value === 'string' ||
    value === null ||
    value === undefined ||
    typeof value === 'boolean' ||
    typeof value === 'number'
  ) {
    return value as Decoded<T>;
  } else if (isLongLike(value)) {
    return longToNumber(value) as Decoded<T>;
  } else if (Array.isArray(value)) {
    return value.map((v) => decode(v)) as Decoded<T>;
  } else if (typeof value === 'object' && value !== null) {
    const decodedObject: Record<string, unknown> = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        decodedObject[key] = decode(value[key]);
      }
    }
    return decodedObject as Decoded<T>;
  } else {
    return value as Decoded<T>;
  }
}
