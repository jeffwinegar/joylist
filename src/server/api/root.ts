import { createTRPCRouter } from '~/server/api/trpc';
import { businessesRouter } from '~/server/api/routers/businesses';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  businesses: businessesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
