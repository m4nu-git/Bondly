// Geohash helpers matching the reference repo's 2-ring neighbor expansion
/* eslint-disable @typescript-eslint/no-require-imports */
const ngeohash = require("ngeohash");
/* eslint-enable @typescript-eslint/no-require-imports */

/**
 * Encode lat/lng to a geohash string at precision 4 (~40 km × 20 km cells).
 */
export function encodeGeohash(lat: number, lng: number, precision = 4): string {
  return ngeohash.encode(lat, lng, precision);
}

/**
 * Return all geohash cells within a 2-ring expansion around the given hash.
 * Mirrors the reference repo: neighbors() → neighbors of neighbors → ~81 cells.
 * Used as a fast approximate filter before the precise PostGIS ST_DWithin pass.
 */
export function expandGeohash(geohash: string): string[] {
  const ring1: string[] = ngeohash.neighbors(geohash); // 8 immediate neighbors
  const level1 = new Set([geohash, ...ring1]);

  for (const gh of ring1) {
    const ring2: string[] = ngeohash.neighbors(gh);
    for (const n of ring2) {
      level1.add(n);
    }
  }

  return Array.from(level1);
}
