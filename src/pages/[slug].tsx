import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { createServerSideHelpers } from '@trpc/react-query/server';
import type { GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useForm, type SubmitHandler } from 'react-hook-form';
import superjson from 'superjson';
import { z } from 'zod';
import { BusinessView } from '~/components/businessView';
import { LoadingSpinner } from '~/components/loading';
import { appRouter } from '~/server/api/root';
import { prisma } from '~/server/db';
import { api } from '~/utils/api';
import { businessValidationSchema } from '~/utils/businessValidator';
import styles from './profile.module.css';

type FormSchema = z.infer<typeof businessValidationSchema>;

const AddBusinessForm = () => {
  const ctx = api.useContext();
  const { mutate } = api.businesses.create.useMutation({
    onSuccess: () => {
      void ctx.businesses.getAll.invalidate();
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormSchema>({
    resolver: zodResolver(businessValidationSchema),
  });
  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    mutate(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>Business Name</label>
      <input {...register('name')} />
      {errors.name?.message && <p>{errors.name.message}</p>}
      <label>Website</label>
      <input placeholder="https://www.joylist.guide" {...register('url')} />
      {errors.url?.message && <p>{errors.url.message}</p>}
      <label>Phone</label>
      <input placeholder="(555) 555-1234" {...register('phone')} />
      {errors.phone?.message && <p>{errors.phone.message}</p>}

      <button type="submit">Add Business</button>
    </form>
  );
};

const ProfileListing = (props: { userId: string }) => {
  const { data, isLoading } = api.businesses.getBusinessesByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingSpinner />;

  if (!data || data.length === 0) return <div>No items yet!</div>;

  return (
    <ul role="list">
      {data.map((fullListing) => (
        <BusinessView key={fullListing.business.id} {...fullListing} />
      ))}
    </ul>
  );
};

export default function ProfilePage({ username }: { username: string }) {
  const { isSignedIn, user } = useUser();
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div>404</div>;

  // required in Clerk so these should never be empty
  const firstName = data.firstName ?? '';
  const lastName = data.lastName ?? '';

  const isLoggedInUserProfile = user?.username === username;

  return (
    <>
      <Head>
        <title>{`${firstName}'s JoyList`}</title>
      </Head>
      <main>
        <section>
          <div className={styles['user-banner']}></div>
          <div className={styles['user-info']}>
            <div>
              <span className={styles['user-image']}>
                <Image
                  alt={`${firstName}'s profile image`}
                  height={100}
                  src={data.imageUrl}
                  width={100}
                />
              </span>
              <h1 className={styles.username}>{data.username ?? ''}</h1>
              <div className={styles['full-name']}>
                <span>{firstName}</span> <span>{lastName}</span>
              </div>
            </div>
            <div>
              <button>Share</button>
            </div>
          </div>
        </section>
        <section>
          <h2>My JoyList</h2>
          {isSignedIn && isLoggedInUserProfile ? (
            <details className={styles['profile-editor']}>
              <summary>Add to your list</summary>
              <div>
                <AddBusinessForm />
              </div>
            </details>
          ) : null}
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
