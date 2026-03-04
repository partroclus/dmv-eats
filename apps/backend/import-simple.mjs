#!/usr/bin/env node
import axios from 'axios';
import * as fs from 'fs';

const GOOGLE_API_KEY = 'AIzaSyDuIYmwniEwfugu2b8PHgjdGKKMBPujYNQ';
const SUPABASE_URL = 'https://ktllbxtstalvglqsjzdi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_kNXx9Ml4wjVTAq8O_2gqfA_to0LMq68';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0bGxieHRzdGFsdmdscXNqemRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU4NTU4MiwiZXhwIjoyMDg4MTYxNTgyfQ.KNONN8kG7D1FY-kLHkU92LJd-Gydd-5-G15eNytT4Nk';

const supabase = axios.create({
  baseURL: `${SUPABASE_URL}/rest/v1`,
  headers: {
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    apikey: SERVICE_ROLE_KEY,
    'Content-Type': 'application/json',
  },
});

const locations = [
  { name: 'Washington DC Downtown', lat: 38.9072, lng: -77.0369 },
  { name: 'Arlington VA', lat: 38.8816, lng: -77.1043 },
  { name: 'Baltimore MD', lat: 39.2904, lng: -76.6122 },
  { name: 'Silver Spring MD', lat: 38.9914, lng: -77.0341 },
  { name: 'Bethesda MD', lat: 38.9845, lng: -77.0948 },
  { name: 'Alexandria VA', lat: 38.8048, lng: -77.0469 },
];

async function searchRestaurants(query, lat, lng) {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: {
        query: `${query} restaurants`,
        location: `${lat},${lng}`,
        radius: 50000,
        key: GOOGLE_API_KEY,
      },
    });
    return response.data.results || [];
  } catch (error) {
    console.error('Search error:', error.message);
    return [];
  }
}

async function getPlaceDetails(placeId) {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        fields: 'name,formatted_address,geometry,rating,user_ratings_total,international_phone_number,website,price_level,types',
        key: GOOGLE_API_KEY,
      },
    });
    const place = response.data.result;
    if (!place) return null;

    return {
      name: place.name,
      address: place.formatted_address,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      rating: place.rating || null,
      totalReviews: place.user_ratings_total || 0,
      phone: place.international_phone_number,
      website: place.website,
      priceLevel: place.price_level || 2,
      cuisineTypes: mapCuisineType(place.types),
    };
  } catch (error) {
    console.error('Details error:', error.message);
    return null;
  }
}

function mapCuisineType(types) {
  const cuisineMap = {
    american_restaurant: 'american',
    asian_restaurant: 'asian',
    chinese_restaurant: 'chinese',
    ethiopian_restaurant: 'ethiopian',
    french_restaurant: 'french',
    indian_restaurant: 'indian',
    italian_restaurant: 'italian',
    japanese_restaurant: 'japanese',
    korean_restaurant: 'korean',
    mexican_restaurant: 'mexican',
    mediterranean_restaurant: 'mediterranean',
    pizza_restaurant: 'pizza',
    seafood_restaurant: 'seafood',
    thai_restaurant: 'thai',
    vegetarian_restaurant: 'vegan',
    cafe: 'cafe',
    bar: 'bar',
  };

  return types
    .map((t) => cuisineMap[t])
    .filter((c) => c)
    .slice(0, 3);
}

async function importRestaurants() {
  console.log('🚀 Starting DMV restaurant import...\n');

  let total = 0;
  const imported = new Set();

  for (const loc of locations) {
    console.log(`📍 ${loc.name}...`);
    const results = await searchRestaurants(loc.name, loc.lat, loc.lng);

    for (const result of results) {
      if (imported.has(result.place_id)) continue;

      const details = await getPlaceDetails(result.place_id);
      if (!details) continue;

      try {
        await supabase.post('/Restaurant', {
          name: details.name,
          address: details.address,
          city: loc.name.split(' ')[0],
          state: loc.name.includes('MD') ? 'MD' : loc.name.includes('VA') ? 'VA' : 'DC',
          zipCode: '00000',
          latitude: details.latitude,
          longitude: details.longitude,
          cuisineTypes: details.cuisineTypes,
          priceLevel: details.priceLevel,
          rating: details.rating,
          totalReviews: details.totalReviews,
          phone: details.phone,
          website: details.website,
        });

        console.log(`✅ ${details.name}`);
        total++;
        imported.add(result.place_id);
      } catch (error) {
        console.error(`❌ ${details.name}: ${error.message}`);
      }

      await new Promise((r) => setTimeout(r, 200));
    }
  }

  console.log(`\n🎉 Import complete! Added ${total} restaurants.`);
}

importRestaurants().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
