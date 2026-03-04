import { router, publicProcedure, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const socialRouter = router({
  // Get feed for current user (posts from followed users + trending)
  getFeed: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { clerkId: ctx.userId! },
        include: { following: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const followingIds = user.following.map((u) => u.id);

      const posts = await ctx.prisma.post.findMany({
        where: {
          userId: { in: [...followingIds, user.id] },
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
        skip: input.offset,
        include: {
          user: { select: { id: true, displayName: true } },
          restaurant: {
            select: { id: true, name: true, photoUrl: true },
          },
        },
      });

      return posts;
    }),

  // Create a post
  createPost: protectedProcedure
    .input(
      z.object({
        caption: z.string().optional(),
        imageUrl: z.string().optional(),
        restaurantId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { clerkId: ctx.userId! },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const post = await ctx.prisma.post.create({
        data: {
          userId: user.id,
          caption: input.caption,
          imageUrl: input.imageUrl,
          restaurantId: input.restaurantId,
        },
        include: {
          user: true,
          restaurant: true,
        },
      });

      return post;
    }),

  // Like a post
  likePost: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Update post likes count
      const post = await ctx.prisma.post.update({
        where: { id: input.postId },
        data: { likes: { increment: 1 } },
      });

      return post;
    }),

  // Get posts for a restaurant
  getRestaurantPosts: publicProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const posts = await ctx.prisma.post.findMany({
        where: { restaurantId: input.restaurantId },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
        include: {
          user: { select: { id: true, displayName: true } },
        },
      });

      return posts;
    }),

  // Get user's profile
  getUserProfile: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        include: {
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
            },
          },
        },
      });

      return user;
    }),

  // Get trending restaurants (by check-ins in last 24h)
  getTrending: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const oneDay = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Get restaurants with most check-ins in last 24h
      const trending = await ctx.prisma.restaurant.findMany({
        where: {
          checkins: {
            some: {
              createdAt: { gte: oneDay },
            },
          },
        },
        take: input.limit,
      });

      return trending;
    }),
});
