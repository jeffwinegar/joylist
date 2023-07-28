import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { createServerSideHelpers } from '@trpc/react-query/server';
import type { GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import superjson from 'superjson';
import { z } from 'zod';
import { LoadingSpinner } from '~/components/loading';
import { appRouter } from '~/server/api/root';
import { prisma } from '~/server/db';
import { api, type RouterOutputs } from '~/utils/api';
import { businessValidationSchema } from '~/utils/businessValidator';
import styles from './profile.module.css';

type FormSchema = z.infer<typeof businessValidationSchema>;
type BusinessWithUser = RouterOutputs['businesses']['getAll'][number];

const CopyURLToClipboardButton = () => {
  const baseUrl =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : '';
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(`${baseUrl}${router.asPath}`);
    setCopied(true);
    toast.success('Copied to clipboard!', {
      id: 'clipboard',
    });

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <button
      aria-label="Copy URL"
      className={styles['share-button']}
      onClick={copy}
    >
      {copied ? (
        <svg height={20} width={20}>
          <use href="/icons.svg#check" />
        </svg>
      ) : (
        <svg height={20} width={20}>
          <use href="/icons.svg#link" />
        </svg>
      )}
    </button>
  );
};

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
      <div className={styles['form-item']}>
        <label>Business Name</label>
        <input {...register('name')} />
        {errors.name?.message && <p>{errors.name.message}</p>}
      </div>

      <div className={styles['form-item']}>
        <label>Website</label>
        <input
          placeholder="e.g. https://www.joylist.guide"
          {...register('url')}
        />
        {errors.url?.message && <p>{errors.url.message}</p>}
      </div>

      <div className={styles['form-item']}>
        <label>Phone</label>
        <input placeholder="e.g. (555) 555-1234" {...register('phone')} />
        {errors.phone?.message && <p>{errors.phone.message}</p>}
      </div>

      <button type="submit">Add Business</button>
      <button type="reset">Cancel</button>
    </form>
  );
};

const BusinessView = (props: BusinessWithUser) => {
  const { business } = props;

  return (
    <li key={business.id}>
      <span>{business.name}</span>
      {' ⸱ '}
      <a href={business.url} target="_blank" rel="noopener noreferrer">
        Website
      </a>
      {' ⸱ '}
      <a href={`tel:+${business.phone}`}>{business.phone}</a>
    </li>
  );
};

const ProfileList = (props: { userId: string }) => {
  const { data, isLoading } = api.businesses.getBusinessesByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingSpinner size={28} />;

  if (!data || data.length === 0)
    return (
      <div className={styles['empty-list']}>
        <svg height={68} width={68}>
          <use href="/icons.svg#gift" />
        </svg>{' '}
        No items yet!
      </div>
    );

  return (
    <ul className={styles.list} role="list">
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
        <link rel="preload" as="image/svg+xml" href="icons.svg" />
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
                  priority={true}
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
              <CopyURLToClipboardButton />
            </div>
          </div>
        </section>
        <section className={styles['list-content']}>
          <h2 className={styles['list-heading']}>My JoyList</h2>
          {isSignedIn && isLoggedInUserProfile ? (
            <details className={styles['list-editor']}>
              <summary>Add to your list</summary>
              <AddBusinessForm />
            </details>
          ) : null}
          <ProfileList userId={data.id} />
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
