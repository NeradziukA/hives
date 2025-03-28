/**
 * Converts a distance in meters to degrees of latitude.
 * @param meters Distance in meters.
 * @returns Distance in degrees of latitude.
 */
export function metersToLatitudeDegrees(meters: number): number {
  const metersPerDegreeLatitude = 111320; // Approximate value
  return meters / metersPerDegreeLatitude;
}

/**
 * Converts a distance in meters to degrees of longitude at a specific latitude.
 * @param meters Distance in meters.
 * @param latitude Latitude in degrees.
 * @returns Distance in degrees of longitude.
 */
export function metersToLongitudeDegrees(
  meters: number,
  latitude: number
): number {
  const metersPerDegreeLongitude =
    111320 * Math.cos(latitude * (Math.PI / 180)); // Value at equator adjusted for latitude
  return meters / metersPerDegreeLongitude;
}

/**
 * Converts a distance in meters to degrees at a specific altitude.
 * @param meters Distance in meters.
 * @param altitude Altitude above sea level in meters.
 * @returns Distance in degrees adjusted for altitude.
 */
export function metersToDegreesAtAltitude(meters: number): number {
  const earthRadius = 6371000; // Earth's radius in meters
  const radiusAtAltitude = earthRadius;
  const metersPerDegreeAtAltitude = (2 * Math.PI * radiusAtAltitude) / 360;
  return meters / metersPerDegreeAtAltitude;
}
