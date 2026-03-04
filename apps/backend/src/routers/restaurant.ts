import { router, publicProcedure, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const restaurantRouter = router({
  // Search restaurants with filters
  search: publicProcedure
    .input(
      z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        radius: z.number().min(0).max(50).default(5), // km
        cuisines: z.array(z.string()).optional(),
        priceLevel: z.number().min(1).max(4).optional(),
        dietaryOptions: z.array(z.string()).optional(),
        ownershipTags: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Build dynamic query
      let query = ctx.prisma.restaurant.findMany({
        where: {
          // Geospatial filtering would use PostGIS raw query in production
          // For now, simple filtering
          ...(input.cuisines && input.cuisines.length > 0
            ? { cuisineTypes: { hasSome: input.cuisines } }
            : {}),
          ...(input.priceLevel ? { priceLevel: { lte: input.priceLevel } } : {}),
          ...(input.dietaryOptions && input.dietaryOptions.length > 0
            ? { dietaryOptions: { hasSome: input.dietaryOptions } }
            : {}),
          ...(input.ownershipTags && input.ownershipTags.length > 0
            ? { ownershipTags: { hasSome: input.ownershipTags } }
            : {}),
        },
        take: 20,
      });

      const restaurants = await query;

      return {
        restaurants,
        total: restaurants.length,
      };
    }),

  // Get restaurant details
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const restaurant = await ctx.prisma.restaurant.findUnique({
        where: { id: input.id },
        include: {
          checkins: { take: 10, orderBy: { createdAt: 'desc' } },
          posts: { take: 5, orderBy: { createdAt: 'desc' } },
          reviews: { take: 10, orderBy: { createdAt: 'desc' } },
        },
      });

      return restaurant;
    }),

  // Add restaurant to favorites
  addFavorite: protectedProcedure
    .input(z.object({ restaurantId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { clerkId: ctx.userId! },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Note: This requires updating Prisma schema to support favorites
      return { success: true };
    }),

  // Remove from favorites
  removeFavorite: protectedProcedure
    .input(z.object({ restaurantId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return { success: true };
    }),

  // Get user's favorite restaurants
  getFavorites: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { clerkId: ctx.userId! },
      include: {
        favoritedVenues: true,
      },
    });

    return user?.favoritedVenues || [];
  }),

  // Submit a check-in
  checkin: protectedProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        crowdLevel: z.enum(['empty', 'moderate', 'busy', 'packed']).optional(),
        vibeTags: z.array(z.string()).optional(),
        safetyRating: z.number().min(1).max(5).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { clerkId: ctx.userId! },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const checkin = await ctx.prisma.checkin.create({
        data: {
          userId: user.id,
          restaurantId: input.restaurantId,
          crowdLevel: input.crowdLevel,
          vibeTags: input.vibeTags || [],
          safetyRating: input.safetyRating,
        },
      });

      // Update restaurant's occupancy based on check-ins
      // TODO: Aggregate check-in data to update restaurant occupancy

      return checkin;
    }),
});
