// Bloom filter implementation matching mohitejaikumar/Hinge1Backend
// Uses BitSet + MurmurHash v3 — same algorithm as the reference repo

/* eslint-disable @typescript-eslint/no-require-imports */
const BitSet           = require("bitset");
const murmurhash       = require("murmurhash");
/* eslint-enable @typescript-eslint/no-require-imports */

const FILTER_SIZE = parseInt(process.env.BLOOM_FILTER_SIZE ?? "28755175", 10);
const HASH_SIZE   = parseInt(process.env.HASH_SIZE         ?? "10",        10);

/**
 * Add a userId to the bloom filter.
 * Returns the updated serialised string to persist back to the DB.
 * Resets the filter when at capacity (same strategy as reference repo).
 */
export function bloomAdd(filterStr: string, userId: string): string {
  let bs = filterStr ? BitSet.fromBinaryString(filterStr) : new BitSet();

  // Reset when at capacity — avoids unbounded growth
  if (bs.cardinality() >= FILTER_SIZE) {
    bs = new BitSet();
  }

  for (let i = 0; i < HASH_SIZE; i++) {
    bs.set(murmurhash.v3(userId, i) % FILTER_SIZE);
  }

  return bs.toString();
}

/**
 * Check whether a userId has already been seen (probably).
 * false → definitely NOT seen → safe to include in discovery feed.
 * true  → probably seen      → skip.
 */
export function bloomCheck(filterStr: string, userId: string): boolean {
  if (!filterStr) return false;

  let bs;
  try {
    bs = BitSet.fromBinaryString(filterStr);
  } catch {
    return false;
  }

  for (let i = 0; i < HASH_SIZE; i++) {
    if (!bs.get(murmurhash.v3(userId, i) % FILTER_SIZE)) return false;
  }
  return true;
}
