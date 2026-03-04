import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Favorite {
  restaurantId: string;
  name: string;
  rating: number;
  distance?: number;
  cuisineTypes?: string[];
  photoUrl?: string;
}

interface FavoritesState {
  favorites: Favorite[];
  addFavorite: (favorite: Favorite) => void;
  removeFavorite: (restaurantId: string) => void;
  isFavorite: (restaurantId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      addFavorite: (favorite) => {
        set((state) => {
          if (!state.favorites.find((f) => f.restaurantId === favorite.restaurantId)) {
            return { favorites: [...state.favorites, favorite] };
          }
          return state;
        });
      },
      
      removeFavorite: (restaurantId) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f.restaurantId !== restaurantId),
        }));
      },
      
      isFavorite: (restaurantId) => {
        return get().favorites.some((f) => f.restaurantId === restaurantId);
      },
      
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
