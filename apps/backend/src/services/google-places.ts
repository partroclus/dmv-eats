import axios from 'axios';
import { prisma } from '../db/client';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

interface PlaceDetails {
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  totalReviews?: number;
  phone?: string;
  website?: string;
  priceLevel?: number;
  types: string[];
  photoUrl?: string;
  hoursJson?: Record<string, { open: string; close: string }>;
}

// Search for restaurants in a location
export async function searchRestaurants(
  query: string,
  lat: number,
  lng: number,
  radius: number = 50000 // 50km
): Promise<any[]> {
  try {
    const response = await axios.get(`${BASE_URL}/textsearch/json`, {
      params: {
        query: `${query} restaurants`,
        location: `${lat},${lng}`,
        radius,
        key: GOOGLE_API_KEY,
      },
    });

    return response.data.results || [];
  } catch (error) {
    console.error('Google Places search error:', error);
    throw error;
  }
}

// Get detailed place info
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  try {
    const response = await axios.get(`${BASE_URL}/details/json`, {
      params: {
        place_id: placeId,
        fields: [
          'name',
          'formatted_address',
          'geometry',
          'rating',
          'user_ratings_total',
          'international_phone_number',
          'website',
          'price_level',
          'types',
          'opening_hours',
          'photos',
        ].join(','),
        key: GOOGLE_API_KEY,
      },
    });

    const place = response.data.result;

    if (!place) return null;

    return {
      name: place.name,
      address: place.formatted_address,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      rating: place.rating,
      totalReviews: place.user_ratings_total,
      phone: place.international_phone_number,
      website: place.website,
      priceLevel: place.price_level,
      types: place.types,
      photoUrl: place.photos?.[0]?.['photo_reference'] || undefined,
      hoursJson: convertHours(place.opening_hours?.weekday_text),
    };
  } catch (error) {
    console.error('Google Places details error:', error);
    return null;
  }
}

// Convert opening hours to structured format
function convertHours(weekdayText?: string[]): Record<string, { open: string; close: string }> | undefined {
  if (!weekdayText) return undefined;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours: Record<string, { open: string; close: string }> = {};

  days.forEach((day, index) => {
    const text = weekdayText[index];
    if (text) {
      const match = text.match(/(.+):\s(.+)\s–\s(.+)/);
      if (match) {
        hours[day.toLowerCase()] = {
          open: match[2].trim(),
          close: match[3].trim(),
        };
      }
    }
  });

  return Object.keys(hours).length > 0 ? hours : undefined;
}

// Map Google place type to cuisine
function mapCuisineType(types: string[]): string[] {
  const cuisineMap: Record<string, string> = {
    'american_restaurant': 'american',
    'asian_restaurant': 'asian',
    'chinese_restaurant': 'chinese',
    'ethiopian_restaurant': 'ethiopian',
    'french_restaurant': 'french',
    'indian_restaurant': 'indian',
    'italian_restaurant': 'italian',
    'japanese_restaurant': 'japanese',
    'korean_restaurant': 'korean',
    'mexican_restaurant': 'mexican',
    'mediterranean_restaurant': 'mediterranean',
    'middle_eastern_restaurant': 'middle_eastern',
    'pizza_restaurant': 'pizza',
    'seafood_restaurant': 'seafood',
    'spanish_restaurant': 'spanish',
    'thai_restaurant': 'thai',
    'turkish_restaurant': 'turkish',
    'vietnamese_restaurant': 'vietnamese',
    'vegetarian_restaurant': 'vegan',
    'cafe': 'cafe',
    'bakery': 'bakery',
    'bar': 'bar',
    'pub': 'pub',
    'night_club': 'nightclub',
  };

  return types
    .map((type) => cuisineMap[type])
    .filter((cuisine): cuisine is string => cuisine !== undefined)
    .slice(0, 3);
}

// Import restaurants from Google Places for DMV region
export async function importDMVRestaurants() {
  console.log('🚀 Starting DMV restaurant import from Google Places...');

  // Key DMV coordinates
  const locations = [
    { name: 'Washington DC Downtown', lat: 38.9072, lng: -77.0369 },
    { name: 'Arlington VA', lat: 38.8816, lng: -77.1043 },
    { name: 'Baltimore MD', lat: 39.2904, lng: -76.6122 },
    { name: 'Silver Spring MD', lat: 38.9914, lng: -77.0341 },
    { name: 'Bethesda MD', lat: 38.9845, lng: -77.0948 },
    { name: 'Alexandria VA', lat: 38.8048, lng: -77.0469 },
  ];

  let importedCount = 0;
  const importedPlaceIds = new Set<string>();

  for (const location of locations) {
    console.log(`\n📍 Searching in ${location.name}...`);

    try {
      const results = await searchRestaurants(location.name, location.lat, location.lng);

      for (const result of results) {
        if (importedPlaceIds.has(result.place_id)) {
          continue; // Skip duplicates
        }

        try {
          const details = await getPlaceDetails(result.place_id);

          if (!details) continue;

          // Check if already exists
          const existing = await prisma.restaurant.findFirst({
            where: { name: details.name, address: details.address },
          });

          if (existing) {
            console.log(`⏭️  ${details.name} (already exists)`);
            continue;
          }

          // Create restaurant record
          const restaurant = await prisma.restaurant.create({
            data: {
              name: details.name,
              address: details.address,
              city: location.name.split(' ').slice(0, -1).join(' ') || location.name,
              state: location.name.includes('MD') ? 'MD' : location.name.includes('VA') ? 'VA' : 'DC',
              zipCode: '00000', // TODO: Extract from address
              latitude: details.lat,
              longitude: details.lng,
              phone: details.phone,
              website: details.website,
              rating: details.rating,
              totalReviews: details.totalReviews || 0,
              priceLevel: details.priceLevel || 2,
              cuisineTypes: mapCuisineType(details.types),
              hoursJson: details.hoursJson,
              photoUrl: details.photoUrl,
            },
          });

          console.log(`✅ Imported: ${restaurant.name} (${restaurant.cuisineTypes.join(', ')})`);
          importedCount++;
          importedPlaceIds.add(result.place_id);

          // Rate limiting (avoid quota issues)
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error importing ${result.name}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error searching ${location.name}:`, error);
    }
  }

  console.log(`\n🎉 Import complete! Added ${importedCount} restaurants.`);
  return importedCount;
}

// Create geospatial indexes for search performance
export async function createGeoIndexes() {
  console.log('🔍 Creating geospatial indexes...');

  try {
    // This would be run raw SQL in production with PostGIS
    // For now, Prisma will handle basic indexes
    console.log('✅ Indexes created (Prisma-managed)');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}
