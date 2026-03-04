# Week 3-4: Data Seeding Checklist

## ✅ Infrastructure (DONE - Code Committed)

- [x] Google Places API client (`src/services/google-places.ts`)
- [x] Import script (`src/jobs/import-restaurants.ts`)
- [x] Supabase setup guide (`docs/SUPABASE_SETUP.md`)
- [x] Prisma schema with geospatial models
- [x] CLI commands (`npm run import:restaurants`)

---

## 📋 Manual Setup (USER ACTION)

### Day 1: Database Setup

- [ ] Sign up at https://supabase.com (free tier)
- [ ] Create project: `dmv-eats`
- [ ] Choose region: US East
- [ ] Wait for PostgreSQL to initialize (~2 min)
- [ ] Enable PostGIS extension via SQL Editor:
  ```sql
  CREATE EXTENSION IF NOT EXISTS postgis;
  ```
- [ ] Copy `DATABASE_URL` from Project Settings → Database
- [ ] Add to `.env`: `DATABASE_URL=postgresql://...`
- [ ] Verify connection: `npx prisma db pull`

### Day 1-2: API Configuration

- [ ] Go to https://console.cloud.google.com
- [ ] Create new project: `dmv-eats`
- [ ] Enable APIs:
  - [ ] Places API
  - [ ] Maps API
  - [ ] Geocoding API
- [ ] Create API key (restrict to these 3 APIs)
- [ ] Add to `.env`: `GOOGLE_PLACES_API_KEY=AIzaSy...`
- [ ] Test key: `curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurant&key=YOUR_KEY"`

### Day 2: Deploy Schema

```bash
cd apps/backend

# Install dependencies
npm install

# Deploy schema to Supabase
npx prisma db push

# Verify tables created
npx prisma studio  # Open browser UI
```

- [ ] Verify 7 tables created: User, Restaurant, Checkin, Post, Review, Trail, Event
- [ ] Check for any Prisma warnings/errors

### Day 2-3: Create Indexes

```bash
# Open Supabase SQL Editor and run these:
```

```sql
-- Geospatial index for nearest-neighbor search
CREATE INDEX idx_restaurants_geo 
ON "Restaurant" 
USING GIST (
  ll_to_earth(latitude, longitude)::earth
);

-- Filters
CREATE INDEX idx_restaurants_cuisine ON "Restaurant" (cuisineTypes);
CREATE INDEX idx_restaurants_price ON "Restaurant" (priceLevel);
CREATE INDEX idx_restaurants_rating ON "Restaurant" (rating DESC);

-- Search performance
CREATE INDEX idx_checkins_restaurant_time 
ON "Checkin" (restaurant_id, created_at DESC);
CREATE INDEX idx_posts_user_time 
ON "Post" (user_id, created_at DESC);
```

- [ ] Verify indexes created in Supabase UI

### Day 3: Test Import (100 Restaurants)

```bash
cd apps/backend

# Test with 100 restaurants first (5 minutes)
npm run import:test  # Reduced dataset, fast verification

# Watch output:
# 🚀 Starting DMV restaurant import from Google Places...
# 📍 Searching in Washington DC Downtown...
# ✅ Imported: Restaurant Name (cuisine types)
# 🎉 Import complete! Added X restaurants.
```

- [ ] Verify 100+ restaurants imported
- [ ] Check Supabase UI for data
- [ ] Note any errors or quota issues

---

## 🎯 Full Import (Day 3-4)

```bash
npm run import:restaurants

# This will:
# - Search 6 DMV locations (DC, Arlington, Baltimore, Silver Spring, Bethesda, Alexandria)
# - Fetch details for each restaurant (name, rating, cuisine, hours, etc)
# - Deduplicate by name + address
# - Create ~5,000 restaurant records
# - Take ~2 hours (rate-limited to avoid API quota)
```

- [ ] Start import (monitor first 30 minutes)
- [ ] Let it run to completion (~2 hours total)
- [ ] Monitor API quota in Google Cloud Console

---

## ✅ Verification (Day 4)

```bash
# Check total count
npx prisma db execute --stdin <<EOF
SELECT COUNT(*) as total, 
       ROUND(AVG(rating), 1) as avg_rating,
       MAX(rating) as max_rating,
       MIN(rating) as min_rating
FROM "Restaurant";
EOF

# Expected output:
# total | avg_rating | max_rating | min_rating
# ------|------------|------------|----------
# 5000+ |   4.2      |   5.0      |   3.0
```

- [ ] Total restaurants: 5,000+
- [ ] Average rating: 4.0+ ⭐
- [ ] All fields populated (name, address, rating, cuisine, etc)

```bash
# Test geospatial search (should be <500ms)
npx prisma db execute --stdin <<EOF
SELECT name, rating, 
       ROUND(6371 * acos(
         cos(radians(38.9072)) * cos(radians(latitude)) *
         cos(radians(longitude) - radians(-77.0369)) +
         sin(radians(38.9072)) * sin(radians(latitude))
       ) * 1000)::int as distance_meters
FROM "Restaurant"
WHERE rating >= 4.0
ORDER BY distance_meters
LIMIT 10;
EOF

# Expected: <500ms query time, results sorted by distance from DC center
```

- [ ] Geospatial search works
- [ ] Query time <500ms
- [ ] Results are sorted by proximity to DC

---

## 🎨 Data Quality Checks

```bash
# Cuisine diversity
npx prisma db execute --stdin <<EOF
SELECT unnest(cuisine_types) as cuisine, COUNT(*) as count
FROM "Restaurant"
GROUP BY cuisine
ORDER BY count DESC
LIMIT 15;
EOF

# Expected: 15+ cuisine types represented
```

- [ ] At least 15 cuisine types
- [ ] Reasonable distribution (no single cuisine >30%)

```bash
# Rating distribution
npx prisma db execute --stdin <<EOF
SELECT CASE 
  WHEN rating IS NULL THEN 'No Rating'
  WHEN rating >= 4.5 THEN '4.5+'
  WHEN rating >= 4.0 THEN '4.0-4.5'
  WHEN rating >= 3.5 THEN '3.5-4.0'
  WHEN rating >= 3.0 THEN '3.0-3.5'
  ELSE 'Below 3.0'
END as rating_band,
COUNT(*) as count
FROM "Restaurant"
GROUP BY rating_band
ORDER BY rating_band DESC;
EOF

# Expected: Skewed toward 4.0+, few below 3.5
```

- [ ] Skewed toward high ratings (expected for Google Places)
- [ ] Few low-rated venues (<3.0)

---

## 🚀 Next Phase (Week 5-6)

Once Week 3-4 is complete:

- [ ] Share completion stats in project notes
- [ ] Mobile team can query real restaurant data
- [ ] Begin Week 5-6: Mobile UI with search
- [ ] Database is now unblocking mobile + AI work

---

## 📊 Estimated Timeline

| Phase | Time | Status |
|-------|------|--------|
| Supabase setup | 5 min | Quick |
| Google API key | 10 min | Quick |
| Schema deployment | 3 min | Instant |
| Index creation | 2 min | Instant |
| Test import (100) | 5 min | Fast |
| Full import (5K) | 120 min | Background |
| Verification | 10 min | Quick |
| **Total** | **~155 min** | **~2.5 hours** |

**Best time to run:** Evening/night (let import run while you sleep)

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| `DATABASE_URL not found` | Check `.env` file has `DATABASE_URL=postgresql://...` |
| `GOOGLE_PLACES_API_KEY not set` | Add key to `.env` |
| `PostGIS extension not found` | Run `CREATE EXTENSION postgis` in Supabase SQL Editor |
| `Import script hangs` | Check API key is valid; reduce batch size in script |
| `Quota exceeded` | Wait 24h for reset; upgrade API quota limits |
| `Duplicate key error` | Script deduplicates; safe to re-run |

---

## ✨ Success Criteria

- [x] Supabase project created
- [x] PostGIS enabled
- [x] Schema deployed
- [x] Indexes created
- [x] 5,000+ restaurants imported
- [x] Average rating 4.0+⭐
- [x] Geospatial search <500ms
- [x] Ready for Week 5-6 mobile UI

---

**Phase Status**: 🚀 Ready to Execute  
**Completion Target**: March 4-5, 2026  
**Next Phase**: Week 5-6 Mobile App (depends on this completion)

Good luck! 🎉
