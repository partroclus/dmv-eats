#!/usr/bin/env node

// Use Yelp API (same as DC After Dark - working endpoint)
const YELP_CLIENT_ID = 'O-jhKMqaUluSTWULP9TaiA';
const YELP_API_KEY = process.env.YELP_API_KEY || 'YOUR_YELP_API_KEY';
const SUPABASE_URL = 'https://ktllbxtstalvglqsjzdi.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0bGxieHRzdGFsdmdscXNqemRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU4NTU4MiwiZXhwIjoyMDg4MTYxNTgyfQ.KNONN8kG7D1FY-kLHkU92LJd-Gydd-5-G15eNytT4Nk';

const dmvCities = [
  { name: 'Washington', state: 'DC' },
  { name: 'Arlington', state: 'VA' },
  { name: 'Alexandria', state: 'VA' },
  { name: 'Baltimore', state: 'MD' },
  { name: 'Silver Spring', state: 'MD' },
  { name: 'Bethesda', state: 'MD' },
];

async function searchYelp(city, state, offset = 0) {
  try {
    const url = `https://api.yelp.com/v3/businesses/search?location=${city},${state}&categories=restaurants&sort_by=rating&limit=50&offset=${offset}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${YELP_API_KEY}`,
      },
    });

    if (!res.ok) {
      const error = await res.text();
      console.error(`Yelp error (${city}, ${state}):`, error);
      return [];
    }

    const data = await res.json();
    return data.businesses || [];
  } catch (error) {
    console.error(`Search error (${city}, ${state}):`, error.message);
    return [];
  }
}

async function insertRestaurant(details) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/Restaurant`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: details.name,
      address: details.address,
      city: details.city,
      state: details.state,
      zipCode: details.zipCode || '00000',
      latitude: details.latitude,
      longitude: details.longitude,
      cuisineTypes: details.cuisineTypes,
      priceLevel: (details.price?.length || 2),
      rating: details.rating,
      totalReviews: details.totalReviews,
      phone: details.phone,
      website: details.website,
      photoUrl: details.photoUrl,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`HTTP ${res.status}: ${error}`);
  }

  return res.json();
}

async function importRestaurants() {
  if (!YELP_API_KEY || YELP_API_KEY === 'YOUR_YELP_API_KEY') {
    console.error('❌ YELP_API_KEY not set in environment!');
    console.error('Set it: export YELP_API_KEY="your_key_here"');
    process.exit(1);
  }

  console.log('\n🚀 Starting DMV restaurant import via Yelp...\n');

  let total = 0;
  const imported = new Set();
  const startTime = Date.now();

  for (const loc of dmvCities) {
    console.log(`📍 ${loc.name}, ${loc.state}...`);

    // Paginate through results (50 per page, up to 1000)
    for (let offset = 0; offset < 1000; offset += 50) {
      const results = await searchYelp(loc.name, loc.state, offset);
      if (results.length === 0) break;

      console.log(`   Page ${offset / 50 + 1}: ${results.length} results`);

      for (const restaurant of results) {
        const key = `${restaurant.name}-${restaurant.location.city}`;
        if (imported.has(key)) continue;

        const cuisineTypes = restaurant.categories
          ?.map((c) => c.alias)
          .slice(0, 3) || ['restaurant'];

        const address = restaurant.location.address1 || '';
        const city = restaurant.location.city || loc.name;
        const state = restaurant.location.state || loc.state;
        const zipCode = restaurant.location.zip_code || '00000';

        try {
          await insertRestaurant({
            name: restaurant.name,
            address,
            city,
            state,
            zipCode,
            latitude: restaurant.coordinates.latitude,
            longitude: restaurant.coordinates.longitude,
            cuisineTypes,
            price: restaurant.price,
            rating: restaurant.rating,
            totalReviews: restaurant.review_count,
            phone: restaurant.phone,
            website: restaurant.url,
            photoUrl: restaurant.image_url,
          });

          console.log(`   ✅ ${restaurant.name} (${cuisineTypes.join(', ')})`);
          total++;
          imported.add(key);
        } catch (error) {
          console.log(`   ❌ ${restaurant.name}: ${error.message}`);
        }

        // Rate limit: 100ms between inserts
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    // Rate limit: 500ms between cities
    await new Promise((r) => setTimeout(r, 500));
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n🎉 Import complete!`);
  console.log(`   Total: ${total} restaurants`);
  console.log(`   Time: ${elapsed} minutes`);
  console.log(`\n✅ Database ready for Week 5-6 mobile UI\n`);
}

importRestaurants().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
