import { clerkClient } from '@clerk/nextjs';
import type { User } from '@clerk/nextjs/dist/types/server';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
  };
};

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
});
