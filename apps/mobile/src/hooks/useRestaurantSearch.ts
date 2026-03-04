import { useState, useEffect } from 'react';

interface SearchParams {
  query?: string;
  lat: number;
  lng: number;
  cuisineType?: string | null;
  priceLevel?: number | null;
  minRating?: number | null;
  radius?: number;
}

export const useRestaurantSearch = (params: SearchParams) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Call tRPC restaurant.search with params
    // For now, mock data
    setIsLoading(true);

    // Simulate API call
    const timer = setTimeout(() => {
      setData([
        {
          id: '1',
          name: 'Pinsa Love',
          rating: 4.8,
          totalReviews: 92,
          priceLevel: 2,
          cuisineTypes: ['pizza', 'italian'],
          photoUrl:
            'https://s3-media1.fl.yelpcdn.com/bphoto/example1',
        },
        {
          id: '2',
          name: 'Sushi Palace',
          rating: 4.9,
          totalReviews: 150,
          priceLevel: 3,
          cuisineTypes: ['sushi', 'japanese'],
          photoUrl:
            'https://s3-media1.fl.yelpcdn.com/bphoto/example2',
        },
      ]);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [params]);

  return { data, isLoading, error };
};
