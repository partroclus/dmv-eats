#!/usr/bin/env node
/**
 * Import restaurants from Google Places API for DMV region
 * Usage: npx tsx src/jobs/import-restaurants.ts
 */

import { importDMVRestaurants, createGeoIndexes } from '../services/google-places';
import { prisma } from '../db/client';

async function main() {
  console.log('='.repeat(50));
  console.log('DMV EATS: Restaurant Data Import');
  console.log('='.repeat(50));
  console.log('');

  // Verify database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }

  // Verify API key
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.error('❌ GOOGLE_PLACES_API_KEY not set in .env');
    process.exit(1);
  }
  console.log('✅ Google Places API key configured');
  console.log('');

  try {
    // Import restaurants
    const count = await importDMVRestaurants();

    // Create indexes
    await createGeoIndexes();

    // Get stats
    const totalRestaurants = await prisma.restaurant.count();
    const cuisineStats = await prisma.restaurant.groupBy({
      by: ['cuisineTypes'],
      _count: true,
    });

    console.log('');
    console.log('='.repeat(50));
    console.log('IMPORT STATISTICS');
    console.log('='.repeat(50));
    console.log(`Total restaurants: ${totalRestaurants}`);
    console.log(`This import: +${count}`);
    console.log(`Average rating: ${(await getAverageRating()).toFixed(1)} ⭐`);
    console.log('');
    console.log('Top cuisines:');
    const topCuisines = await getTopCuisines();
    topCuisines.forEach(([cuisine, count]) => {
      console.log(`  ${cuisine}: ${count}`);
    });

    console.log('');
    console.log('✅ Import successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

async function getAverageRating(): Promise<number> {
  const result = await prisma.restaurant.aggregate({
    _avg: { rating: true },
  });
  return result._avg.rating || 0;
}

async function getTopCuisines(): Promise<[string, number][]> {
  const restaurants = await prisma.restaurant.findMany({
    select: { cuisineTypes: true },
  });

  const cuisineMap = new Map<string, number>();

  restaurants.forEach((r) => {
    r.cuisineTypes?.forEach((cuisine) => {
      cuisineMap.set(cuisine, (cuisineMap.get(cuisine) || 0) + 1);
    });
  });

  return Array.from(cuisineMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
}

main();
