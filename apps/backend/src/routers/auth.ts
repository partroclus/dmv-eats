import { router, publicProcedure, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const authRouter = router({
  // Get current user profile
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { clerkId: ctx.userId! },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return user;
  }),

  // Create user profile (called after Clerk signup)
  createProfile: publicProcedure
    .input(
      z.object({
        clerkId: z.string(),
        email: z.string().email(),
        displayName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.create({
        data: {
          clerkId: input.clerkId,
          email: input.email,
          displayName: input.displayName,
        },
      });

      return user;
    }),

  // Update user preferences
  updatePreferences: protectedProcedure
    .input(
      z.object({
        homeLocation: z.object({ lat: z.number(), lng: z.number() }).optional(),
        workLocation: z.object({ lat: z.number(), lng: z.number() }).optional(),
        dietaryRestrictions: z.array(z.string()).optional(),
        preferences: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: { clerkId: ctx.userId! },
        data: {
          homeLocation: input.homeLocation,
          workLocation: input.workLocation,
          dietaryRestrictions: input.dietaryRestrictions,
          preferences: input.preferences,
        },
      });

      return user;
    }),

  // Follow a user
  followUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.prisma.user.findUnique({
        where: { clerkId: ctx.userId! },
      });

      if (!currentUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Current user not found',
        });
      }

      const targetUser = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      });

      if (!targetUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Target user not found',
        });
      }

      // Note: This assumes a many-to-many relationship for follows
      // You may need to adjust based on your Prisma schema
      return { success: true };
    }),
});
