import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import memoize from 'lodash/memoize';

export const encodeLowerCased = memoize((data: string) => encodeHexLowerCase(sha256(new TextEncoder().encode(data))));

export const hashString = memoize((data: string) => sha256(new TextEncoder().encode(data)));

/**
 * Convert Uint8Array to hex string
 */
function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Stable stringify helper — ensures consistent key ordering
 */
function stableStringify(obj: any): string {
  if (obj === null) {
    return 'null';
  }
  if (typeof obj !== 'object') {
    return String(obj);
  }
  if (Array.isArray(obj)) {
    return `[${obj.map(stableStringify).join(',')}]`;
  }
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `"${k}":${stableStringify(obj[k])}`).join(',')}}`;
}

/**
 * Creates a dedupe key from an object.
 * Memoized for efficiency.
 */
export const hashData = memoize((obj: any): string => {
  const str = stableStringify(obj);
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const hashBytes = sha256(bytes);
  return toHex(hashBytes);
}, stableStringify);

/**
 * Checks if two dedupe keys match based on object comparison
 */
export function areDedupeKeysEqual(obj1: any, obj2: any): boolean {
  return hashData(obj1) === hashData(obj2);
}
