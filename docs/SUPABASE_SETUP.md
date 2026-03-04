# Supabase Setup Guide for DMV Eats

## Prerequisites

- Supabase account (free tier at supabase.com)
- PostgreSQL 17 with PostGIS extension
- Google Places API key (with Geocoding & Maps API enabled)

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: `dmv-eats` (or similar)
   - **Database Password**: Generate strong password
   - **Region**: Choose US East (for DMV region)
5. Click "Create new project" (takes ~2 minutes)

## Step 2: Enable PostGIS Extension

1. In Supabase dashboard, go to **SQL Editor**
2. Create new query:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```

3. Run the query
4. Verify: `SELECT PostGIS_Version();`

## Step 3: Get Connection String

1. Go to **Project Settings** → **Database**
2. Copy **Connection String** (PostgreSQL)
3. Save as `DATABASE_URL` in `.env`:

```
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/postgres
```

## Step 4: Run Prisma Migrations

```bash
cd apps/backend

# Install dependencies
npm install

# Push schema to Supabase
npx prisma db push

# Verify schema created
npx prisma studio  # Opens UI to view tables
```

## Step 5: Create Geospatial Indexes

In Supabase SQL Editor, run:

```sql
-- Create GiST index for nearest-neighbor queries
CREATE INDEX idx_restaurants_geo 
ON "Restaurant" 
USING GIST (
  ll_to_earth(latitude, longitude)::earth
);

-- Create B-Tree indexes for common filters
CREATE INDEX idx_restaurants_cuisine 
ON "Restaurant" (cuisineTypes);

CREATE INDEX idx_restaurants_price 
ON "Restaurant" (priceLevel);

CREATE INDEX idx_restaurants_rating 
ON "Restaurant" (rating DESC);

-- Create indexes for search performance
CREATE INDEX idx_checkins_restaurant_time 
ON "Checkin" (restaurant_id, created_at DESC);

CREATE INDEX idx_posts_user_time 
ON "Post" (user_id, created_at DESC);
```

## Step 6: Enable Row Level Security (RLS)

In Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Restaurant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Checkin" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;

-- Allow read access to restaurants (public)
CREATE POLICY "Restaurants are viewable by everyone"
ON "Restaurant" FOR SELECT
USING (true);

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON "User" FOR SELECT
USING (auth.uid() = user_id);  -- Adjust based on Clerk setup
```

## Step 7: Set Up Google Places API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: `dmv-eats`
3. Enable APIs:
   - Places API
   - Maps API
   - Geocoding API
4. Create API key (Restrict to these APIs)
5. Add to `.env`:

```
GOOGLE_PLACES_API_KEY=AIzaSy...
```

## Step 8: Verify Connection

```bash
# Test Supabase connection
npx prisma db execute --stdin <<EOF
SELECT count(*) FROM "Restaurant";
EOF

# Output should show: count | 0
```

## Step 9: Run Import Script

```bash
# Seed 5K DMV restaurants from Google Places
npx tsx src/jobs/import-restaurants.ts

# Expected output:
# 🚀 Starting DMV restaurant import from Google Places...
# 📍 Searching in Washington DC Downtown...
# ✅ Imported: Restaurant Name (cuisine types)
# 🎉 Import complete! Added X restaurants.
```

## Expected Timeline

- Step 1-2: ~5 minutes (project creation + PostGIS)
- Step 3-4: ~3 minutes (migrations)
- Step 5-7: ~5 minutes (indexes + setup)
- Step 8-9: ~60-120 minutes (import 5K restaurants with rate limiting)

**Total: ~2 hours**

## Verify Import Success

```bash
# Check restaurant count
npx prisma db execute --stdin <<EOF
SELECT count(*) as total, 
       ROUND(AVG(rating), 1) as avg_rating,
       COUNT(DISTINCT cuisine_types[1]) as cuisine_types
FROM "Restaurant";
EOF
```

Expected output:
```
total | avg_rating | cuisine_types
------|------------|----------------
5000  |   4.2      |   18
```

## Performance Testing

```bash
# Test geospatial search (should be <500ms)
npx prisma db execute --stdin <<EOF
SELECT name, rating, distance_meters
FROM (
  SELECT *,
         6371 * acos(
           cos(radians(38.9072)) * cos(radians(latitude)) *
           cos(radians(longitude) - radians(-77.0369)) +
           sin(radians(38.9072)) * sin(radians(latitude))
         ) * 1000 as distance_meters
  FROM "Restaurant"
  WHERE rating >= 4.0
) AS subquery
WHERE distance_meters < 5000
ORDER BY distance_meters
LIMIT 20;
EOF
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Database connection failed" | Check DATABASE_URL format, verify Supabase is running |
| "PostGIS extension not found" | Run `CREATE EXTENSION postgis` in SQL Editor |
| "Google Places API quota exceeded" | Implement backoff/retry; increase quota limits |
| "Import script hangs" | Check API key is valid, reduce batch size |

## Next Steps

- Week 4: Verify all 5K records, clean data, test search
- Week 5: Mobile UI can query real restaurant data
- Week 6: Performance optimization if needed

---

**Last Updated**: March 3, 2026  
**Status**: Ready for Week 3-4 implementation
