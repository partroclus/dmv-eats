import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationCoords {
  lat: number;
  lng: number;
  accuracy: number;
}

export const useMapLocation = () => {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      try {
        setIsLoading(true);
        
        // Request permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          setIsLoading(false);
          return;
        }

        // Get current location
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocation({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          accuracy: loc.coords.accuracy || 20,
        });
      } catch (err) {
        console.error('Location error:', err);
        setError(err instanceof Error ? err.message : 'Location failed');
      } finally {
        setIsLoading(false);
      }
    };

    getLocation();
  }, []);

  return { location, isLoading, error };
};
