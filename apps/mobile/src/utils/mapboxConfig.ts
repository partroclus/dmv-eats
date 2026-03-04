// Mapbox configuration
export const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '';
export const MAPBOX_STYLE = 'mapbox://styles/mapbox/light-v11';

// Default DC location
export const DEFAULT_CENTER = {
  lat: 38.9072,
  lng: -77.0369,
};

// Clustering settings
export const CLUSTER_CONFIG = {
  maxZoom: 14,      // Cluster at zoom < 14
  radius: 50,       // Cluster radius in pixels
  maxPoints: 50,    // Max restaurants per cluster
};

// Distance radius based on zoom level
export const getRadiusFromZoom = (zoomLevel: number): number => {
  if (zoomLevel < 12) return 25000; // 25km
  if (zoomLevel < 14) return 10000; // 10km
  if (zoomLevel < 16) return 5000;  // 5km
  return 2000;                       // 2km
};

// Cuisine emoji map for markers
export const cuisineEmoji: Record<string, string> = {
  sushi: '🍣',
  pizza: '🍕',
  taco: '🌮',
  italian: '🍝',
  american: '🍔',
  chinese: '🥡',
  indian: '🍛',
  thai: '🥗',
  restaurant: '🍽️',
};
