import { create } from 'zustand';

interface SearchState {
  query: string;
  setQuery: (query: string) => void;
  
  selectedCuisine: string | null;
  setSelectedCuisine: (cuisine: string | null) => void;
  
  priceLevel: number | null;
  setPriceLevel: (level: number | null) => void;
  
  minRating: number | null;
  setMinRating: (rating: number | null) => void;
  
  distance: number;
  setDistance: (distance: number) => void;
  
  openNow: boolean;
  setOpenNow: (open: boolean) => void;
  
  reset: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  setQuery: (query) => set({ query }),
  
  selectedCuisine: null,
  setSelectedCuisine: (cuisine) => set({ selectedCuisine: cuisine }),
  
  priceLevel: null,
  setPriceLevel: (level) => set({ priceLevel: level }),
  
  minRating: null,
  setMinRating: (rating) => set({ minRating: rating }),
  
  distance: 5000,
  setDistance: (distance) => set({ distance }),
  
  openNow: false,
  setOpenNow: (open) => set({ openNow: open }),
  
  reset: () => set({
    query: '',
    selectedCuisine: null,
    priceLevel: null,
    minRating: null,
    distance: 5000,
    openNow: false,
  }),
}));
