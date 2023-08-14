import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { createServerSideHelpers } from '@trpc/react-query/server';
import type { GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import superjson from 'superjson';
import type { z } from 'zod';
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
  const pathname = usePathname();

  const copy = async () => {
    await navigator.clipboard.writeText(`${baseUrl}${pathname}`);

    toast.success('Copied to clipboard!', {
      id: 'clipboard',
    });
  };

  return (
    <button
      aria-label="Copy URL"
      className={styles['share-button']}
      onClick={copy}
    >
      <svg height={20} width={20}>
        <use href="/icons.svg#link" />
      </svg>
    </button>
  );
};

const AddBusinessForm = () => {
  const ctx = api.useContext();
  const { mutate } = api.businesses.create.useMutation({
    onSuccess: () => {
      toast.success('Business added!', {
        id: 'addBusiness',
      });
      void ctx.businesses.getBusinessesByUserId.invalidate();
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
        <label htmlFor="businessName">Business Name</label>
        <input
          aria-invalid={errors.name ? 'true' : 'false'}
          id="businessName"
          type="text"
          {...register('name')}
        />
        {!!errors.name && <p role="alert">{errors.name.message}</p>}
      </div>

      <div className={styles['form-item']}>
        <label htmlFor="businessType">
          Business Type <span>(Optional)</span>
        </label>
        <input
          aria-invalid={errors.type ? 'true' : 'false'}
          id="businessType"
          type="text"
          {...register('type')}
        />
        {!!errors.type && <p role="alert">{errors.type.message}</p>}
      </div>

      <div className={styles['form-item']}>
        <label htmlFor="businessWebsite">Website</label>
        <input
          aria-invalid={errors.url ? 'true' : 'false'}
          id="businessWebsite"
          placeholder="e.g. https://www.joylist.guide"
          type="text"
          {...register('url')}
        />
        {!!errors.url && <p role="alert">{errors.url.message}</p>}
      </div>

      <div className={styles['form-item']}>
        <label htmlFor="businessPhone">
          Phone <span>(Optional)</span>
        </label>
        <input
          aria-invalid={errors.phone ? 'true' : 'false'}
          id="businessPhone"
          placeholder="e.g. (555) 555-1234"
          type="text"
          {...register('phone')}
        />
        {!!errors.phone && <p role="alert">{errors.phone.message}</p>}
      </div>

      <button type="submit">Add Business</button>
      <button type="reset" onClick={() => reset()}>
        Cancel
      </button>
    </form>
  );
};

const BusinessView = (props: BusinessWithUser) => {
  const { business } = props;
  const hostname = new URL(business.url).hostname;
  const iconSrc = `https://s2.googleusercontent.com/s2/favicons?domain=${hostname}&sz=128`;
  const [error, setError] = useState(false);

  return (
    <li key={business.id}>
      <a
        className={styles['list-item']}
        href={business.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        <span className={styles['business-icon']}>
          <Image
            alt="business favicon"
            height={32}
            onError={() => setError(true)}
            priority={true}
            src={error ? '/fallbackHeart.svg' : iconSrc}
            width={32}
          />
        </span>
        <p>
          <span className={styles['business-name']}>{business.name}</span>
          {!!business.type ? <span>{` ⸱ ${business.type}`}</span> : null}
          {!!business.phone ? <span>{business.phone}</span> : null}
        </p>
        <span className={styles['list-icon']}>
          <svg height={20} width={20}>
            <use href="/icons.svg#arrowUpRight" />
          </svg>
        </span>
      </a>
    </li>
  );
};

const ProfileList = (props: { userId: string }) => {
  const { data, isLoading } = api.businesses.getBusinessesByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading)
    return (
      <div className={styles['empty-list']}>
        <LoadingSpinner size={28} />
      </div>
    );

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
      </Head>
      <main>
        <section>
          <div className={styles['user-banner']}></div>
          <div className={styles['user-info']}>
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
            <p className={styles['full-name']}>{`${firstName} ${lastName}`}</p>
            <CopyURLToClipboardButton />
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
