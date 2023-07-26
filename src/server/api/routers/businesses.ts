import { clerkClient } from '@clerk/nextjs';
import type { Business } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { z } from 'zod';
import { businessValidationSchema } from '~/utils/businessValidator';
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from '~/server/api/trpc';
import { filterUserForClient } from '~/server/helpers/filterUserForClient';

const addUserDataToBusinesses = async (businesses: Business[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: businesses.map((business) => business.userId),
    })
  ).map(filterUserForClient);

  return businesses.map((business) => {
    const user = users.find((user) => user.id === business.userId);

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User for listing not found',
      });
    }
    if (!user.username) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'User has no account',
      });
    }

    return {
      business,
      user: {
        ...user,
        username: user.username ?? '(username not found)',
      },
    };
  });
};

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '1 m'),
  analytics: true,
});

export const businessesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const businesses = await ctx.prisma.business.findMany();

    return addUserDataToBusinesses(businesses);
  }),

  getBusinessesByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const businesses = await ctx.prisma.business.findMany({
        where: { userId: input.userId },
      });

      return addUserDataToBusinesses(businesses);
    }),

  create: privateProcedure
    .input(businessValidationSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const { name, url, phone } = input;

      const { success } = await ratelimit.limit(userId);

      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });

      const business = await ctx.prisma.business.create({
        data: {
          userId,
          name,
          url,
          phone,
        },
      });

      return business;
    }),
});
