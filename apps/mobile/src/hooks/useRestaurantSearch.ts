import { useState, useEffect, useCallback } from 'react';
import { trpc } from '../utils/trpc';
import { calculateDistance } from '../utils/geospatial';

interface SearchParams {
  query?: string;
  lat: number;
  lng: number;
  cuisineType?: string | null;
  priceLevel?: number | null;
  minRating?: number | null;
  maxDistance?: number; // meters
  openNow?: boolean;
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  rating: number;
  totalReviews: number;
  priceLevel: number;
  cuisineTypes: string[];
  photoUrl?: string;
  phone?: string;
  website?: string;
  distance?: number; // calculated
}

export const useRestaurantSearch = (params: SearchParams) => {
  const [data, setData] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRestaurants = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call tRPC restaurant.search
      const results = await trpc.restaurant.search.query({
        query: params.query || '',
        lat: params.lat,
        lng: params.lng,
        cuisineTypes: params.cuisineType ? [params.cuisineType] : undefined,
        priceLevel: params.priceLevel,
        minRating: params.minRating,
        limit: 50,
      });

      // Calculate distance for each restaurant
      const enriched = results.map((restaurant: any) => ({
        ...restaurant,
        distance: calculateDistance(
          params.lat,
          params.lng,
          restaurant.latitude,
          restaurant.longitude
        ),
      }));

      // Filter by distance if specified
      const filtered = params.maxDistance
        ? enriched.filter((r) => r.distance <= params.maxDistance)
        : enriched;

      // Sort by distance
      filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));

      setData(filtered);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      searchRestaurants();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchRestaurants]);

  return { data, isLoading, error };
};
