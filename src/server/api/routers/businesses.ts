import { clerkClient } from '@clerk/nextjs';
import type { User } from '@clerk/nextjs/dist/types/server';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from '~/server/api/trpc';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const phoneRegex = new RegExp(/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/);
const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
  };
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

    const users = (
      await clerkClient.users.getUserList({
        userId: businesses.map((business) => business.userId),
      })
    ).map(filterUserForClient);

    return businesses.map((business) => {
      const user = users.find((user) => user.id === business.userId);

      if (!user || !user.username)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User for listing not found',
        });

      return {
        business,
        user: {
          ...user,
          username: user.username,
        },
      };
    });
  }),

  create: privateProcedure
    .input(
      z.object({
        name: z.string(),
        url: z.string().url(),
        phone: z.string().regex(phoneRegex, 'Invalid Phone Number'),
      })
    )
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
