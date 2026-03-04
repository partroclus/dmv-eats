-- Manual Supabase Setup: Copy & Paste into SQL Editor
-- Go to: Supabase Dashboard → SQL Editor → Run these queries

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create tables (from Prisma schema)

CREATE TABLE "User" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "clerkId" TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  "displayName" TEXT,
  "homeLocation" JSONB,
  "workLocation" JSONB,
  "dietaryRestrictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferences JSONB,
  points INT DEFAULT 0,
  badges TEXT[] DEFAULT ARRAY[]::TEXT[],
  "passportStamps" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "Restaurant" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  "zipCode" TEXT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  "cuisineTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "priceLevel" SMALLINT,
  rating FLOAT,
  "totalReviews" INT DEFAULT 0,
  "ownershipTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "dietaryOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ambiance TEXT,
  "noiseLevel" INT,
  phone TEXT,
  website TEXT,
  "hoursJson" JSONB,
  "currentWait" INT,
  "occupancyLevel" TEXT,
  "photoUrl" TEXT,
  "menuUrl" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "Checkin" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "restaurantId" TEXT NOT NULL,
  "vibeTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "safetyRating" INT,
  "crowdLevel" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"(id) ON DELETE CASCADE
);

CREATE TABLE "Post" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "restaurantId" TEXT,
  caption TEXT,
  "imageUrl" TEXT,
  likes INT DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"(id) ON DELETE SET NULL
);

CREATE TABLE "Review" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "restaurantId" TEXT NOT NULL,
  rating INT NOT NULL,
  content TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"(id) ON DELETE CASCADE
);

CREATE TABLE "Trail" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  stops JSONB NOT NULL,
  badges TEXT[] DEFAULT ARRAY[]::TEXT[],
  difficulty TEXT,
  "estimatedTimeHours" FLOAT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "Event" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  venue TEXT,
  latitude FLOAT,
  longitude FLOAT,
  "eventType" TEXT,
  "startTime" TIMESTAMPTZ NOT NULL,
  "endTime" TIMESTAMPTZ,
  "crowdImpact" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance

CREATE INDEX idx_restaurants_geo ON "Restaurant" (latitude, longitude);
CREATE INDEX idx_restaurants_cuisine ON "Restaurant" USING GIN ("cuisineTypes");
CREATE INDEX idx_restaurants_price ON "Restaurant" ("priceLevel");
CREATE INDEX idx_restaurants_rating ON "Restaurant" (rating DESC);
CREATE INDEX idx_checkins_restaurant ON "Checkin" ("restaurantId");
CREATE INDEX idx_checkins_user ON "Checkin" ("userId");
CREATE INDEX idx_posts_user ON "Post" ("userId");
CREATE INDEX idx_posts_restaurant ON "Post" ("restaurantId");

-- Verify creation
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
