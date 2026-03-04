import { create } from 'zustand';

interface Restaurant {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  rating: number;
  priceLevel: number;
  distance?: number;
  cuisineTypes?: string[];
  photoUrl?: string;
}

interface MapState {
  viewport: {
    lat: number;
    lng: number;
    zoomLevel: number;
  };
  setViewport: (viewport: { lat: number; lng: number; zoomLevel: number }) => void;
  
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  
  showBottomSheet: boolean;
  setShowBottomSheet: (show: boolean) => void;
}

export const useMapStore = create<MapState>((set) => ({
  viewport: {
    lat: 38.9072,
    lng: -77.0369,
    zoomLevel: 14,
  },
  setViewport: (viewport) => set({ viewport }),
  
  selectedRestaurant: null,
  setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),
  
  showBottomSheet: false,
  setShowBottomSheet: (show) => set({ showBottomSheet: show }),
}));
