import { getAuth } from '@clerk/nextjs/server';
import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { userId, sessionClaims } = getAuth(ctx.req);

  if (!userId) {
    return {
      redirect: {
        destination: `/sign-in?redirect_url=${ctx.resolvedUrl}`,
        permanent: false,
      },
    };
  }

  const username = (await sessionClaims.username) as string | undefined;

  if (!username) {
    return {
      redirect: {
        destination: `/`,
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: `/${username}`,
      permanent: false,
    },
  };
};

export default function RedirectToProfileRoute() {
  return null;
}
