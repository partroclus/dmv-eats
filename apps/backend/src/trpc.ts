import { initTRPC, TRPCError } from '@trpc/server';
import { FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { getAuth } from '@clerk/backend';
import { prisma } from './db/client';

export const createContext = async (req: FastifyRequest) => {
  // Extract Clerk auth from header
  const session = await getAuth(req as any);
  
  return {
    req,
    userId: session?.userId,
    prisma,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  errorFormatter(opts) {
    const { shape, error } = opts;
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});

// Import and merge routers
import { restaurantRouter } from './routers/restaurant';
import { authRouter } from './routers/auth';
import { socialRouter } from './routers/social';

export const appRouter = router({
  restaurant: restaurantRouter,
  auth: authRouter,
  social: socialRouter,
});

export type AppRouter = typeof appRouter;
