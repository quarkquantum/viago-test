export type GeoPoint = {
  latitude: number;
  longitude: number;
};

/**
 * Calculate the distance between two geographical points using the Haversine formula
 * @param point1 First geographical point with latitude and longitude
 * @param point2 Second geographical point with latitude and longitude
 * @returns Distance in kilometers
 */
export function getDistanceInKm(point1: GeoPoint, point2: GeoPoint): number {
  const earthRadiusKm = 6371; // Earth's radius in kilometers

  const toRadians = (degrees: number): number => degrees * (Math.PI / 180);

  const lat1Rad = toRadians(point1.latitude);
  const lat2Rad = toRadians(point2.latitude);
  const deltaLatRad = toRadians(point2.latitude - point1.latitude);
  const deltaLonRad = toRadians(point2.longitude - point1.longitude);

  // Haversine formula
  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = earthRadiusKm * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}
