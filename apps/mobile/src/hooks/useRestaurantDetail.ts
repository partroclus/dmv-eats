import { useState, useEffect } from 'react';
import { trpc } from '../utils/trpc';

interface Review {
  id: string;
  rating: number;
  content: string;
  author: string;
}

interface DetailRestaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  rating: number;
  totalReviews: number;
  priceLevel: number;
  cuisineTypes: string[];
  phone?: string;
  website?: string;
  photoUrl?: string;
  hours?: Record<string, string>;
  reviews?: Review[];
}

export const useRestaurantDetail = (restaurantId: string) => {
  const [data, setData] = useState<DetailRestaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        // TODO: Call tRPC restaurant.detail with restaurantId
        // For now, mock data
        setData({
          id: restaurantId,
          name: 'Sushi Palace',
          address: '1234 Main St',
          city: 'Washington',
          state: 'DC',
          zipCode: '20001',
          latitude: 38.9072,
          longitude: -77.0369,
          rating: 4.9,
          totalReviews: 492,
          priceLevel: 3,
          cuisineTypes: ['sushi', 'japanese', 'seafood'],
          phone: '+1-202-555-0123',
          website: 'https://sushipalace.example.com',
          photoUrl: 'https://example.com/photo.jpg',
          hours: {
            monday: '11:00 AM - 10:00 PM',
            tuesday: '11:00 AM - 10:00 PM',
            wednesday: '11:00 AM - 10:00 PM',
            thursday: '11:00 AM - 10:00 PM',
            friday: '11:00 AM - 11:00 PM',
            saturday: '12:00 PM - 11:00 PM',
            sunday: '12:00 PM - 10:00 PM',
          },
          reviews: [
            {
              id: '1',
              rating: 5,
              content: 'Amazing sushi! Fresh and delicious.',
              author: 'John D.',
            },
            {
              id: '2',
              rating: 4,
              content: 'Great service and reasonable prices.',
              author: 'Sarah M.',
            },
            {
              id: '3',
              rating: 5,
              content: 'Best sushi in DC!',
              author: 'Mike R.',
            },
          ],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [restaurantId]);

  return { data, isLoading, error };
};
