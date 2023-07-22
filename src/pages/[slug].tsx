import { createServerSideHelpers } from '@trpc/react-query/server';
import type { GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import superjson from 'superjson';
import { BusinessView } from '~/components/businessView';
import { LoadingSpinner } from '~/components/loading';
import { appRouter } from '~/server/api/root';
import { prisma } from '~/server/db';
import { api } from '~/utils/api';
import styles from './profile.module.css';

const ProfileListing = (props: { userId: string }) => {
  const { data, isLoading } = api.businesses.getBusinessesByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingSpinner />;

  if (!data || data.length === 0) return <div>No items yet!</div>;

  return (
    <div>
      {data.map((fullListing) => (
        <BusinessView key={fullListing.business.id} {...fullListing} />
      ))}
    </div>
  );
};

export default function ProfilePage({ username }: { username: string }) {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{`${data.firstName}'s JoyList`}</title>
      </Head>
      <main>
        <section>
          <div className={styles['user-banner']}></div>
          <div className={styles['user-info']}>
            <Image
              alt={`${data.firstName ?? 'User'}'s profile image`}
              className={styles['user-image']}
              height={86}
              src={data.imageUrl}
              width={86}
            />
            <h1 className={styles.username}>{data.username}</h1>
            <div className={styles.fullname}>
              <span>{data.firstName}</span> <span>{data.lastName}</span>
            </div>
          </div>
        </section>
        <section>
          <h2>My JoyList</h2>
          <ProfileListing userId={data.id} />
        </section>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });

  const slug = context.params?.slug;

  if (typeof slug !== 'string') throw new Error('no slug');

  await ssg.profile.getUserByUsername.prefetch({ username: slug });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username: slug,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: 'blocking' };
};
