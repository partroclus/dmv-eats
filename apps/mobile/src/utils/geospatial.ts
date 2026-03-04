/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 User latitude
 * @param lng1 User longitude
 * @param lat2 Restaurant latitude
 * @param lng2 Restaurant longitude
 * @returns Distance in meters
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Format distance for display
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

/**
 * Get search radius from distance filter
 */
export const getRadiusFromFilter = (filter: string): number => {
  const radiusMap: Record<string, number> = {
    '1km': 1000,
    '2km': 2000,
    '5km': 5000,
    '10km': 10000,
  };
  return radiusMap[filter] || 5000;
};
