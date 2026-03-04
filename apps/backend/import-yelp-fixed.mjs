#!/usr/bin/env node

// DMV Eats Restaurant Import via Yelp API
const YELP_API_KEY = process.env.YELP_API_KEY || 'WqGLdU_DonzG41P61_aqRj_2DKoa9crkU8n4LxpT-xyeJ9FmHyVRoSjSTKap0s5nowrAID8sdmscIhcdsWRJnxRVhGx-96MdEaX327U7S5FuUqnn-hCnbLr1MXqjaXYx';
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
      headers: { Authorization: `Bearer ${YELP_API_KEY}` },
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

async function insertRestaurants(restaurants) {
  if (restaurants.length === 0) return 0;

  // Use bulk insert with single POST request
  const payload = restaurants.map((r) => ({
    name: r.name,
    address: r.location.address1 || '',
    city: r.location.city || 'Unknown',
    state: r.location.state || 'XX',
    zipCode: r.location.zip_code || '00000',
    latitude: r.coordinates.latitude,
    longitude: r.coordinates.longitude,
    cuisineTypes: r.categories?.map((c) => c.alias).slice(0, 3) || ['restaurant'],
    priceLevel: r.price?.length || 2,
    rating: r.rating,
    totalReviews: r.review_count,
    phone: r.phone || null,
    website: r.url,
    photoUrl: r.image_url || null,
  }));

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/Restaurant`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        apikey: SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Bulk insert failed: ${res.status}`, errorText);
      return 0;
    }

    return payload.length;
  } catch (error) {
    console.error(`Insert error:`, error.message);
    return 0;
  }
}

async function importRestaurants() {
  console.log('\n🚀 DMV EATS IMPORT VIA YELP (BULK MODE)\n');

  let total = 0;
  const imported = new Set();

  for (const loc of dmvCities) {
    console.log(`📍 ${loc.name}, ${loc.state}...`);

    // Yelp limit: 240 max (limit + offset <= 240)
    for (let offset = 0; offset < 240; offset += 50) {
      const results = await searchYelp(loc.name, loc.state, offset);
      if (results.length === 0) break;

      // Deduplicate
      const unique = results.filter((r) => {
        const key = `${r.name}-${r.location.city}`;
        if (imported.has(key)) return false;
        imported.add(key);
        return true;
      });

      if (unique.length === 0) continue;

      const count = await insertRestaurants(unique);
      if (count > 0) {
        console.log(`   ✅ Page ${offset / 50 + 1}: ${count} restaurants inserted`);
        total += count;
      }

      // Rate limit
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  console.log(`\n🎉 IMPORT COMPLETE!\n   Total inserted: ${total}\n`);
  process.exit(0);
}

importRestaurants().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
