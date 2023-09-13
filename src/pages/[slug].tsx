import { useUser } from '@clerk/nextjs';
import {
  Description as DialogDescription,
  Title as DialogTitle,
} from '@radix-ui/react-dialog';
import * as Popover from '@radix-ui/react-popover';
import { createServerSideHelpers } from '@trpc/react-query/server';
import type { GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import superjson from 'superjson';
import { Dialog, DialogContent, DialogTrigger } from '~/components/dialog';
import { AddEntryForm, UpdateEntryForm } from '~/components/entryForm';
import { LoadingSpinner } from '~/components/loading';
import { appRouter } from '~/server/api/root';
import { prisma } from '~/server/db';
import { api, type RouterOutputs } from '~/utils/api';
import styles from './profile.module.css';

type BusinessWithUser = {
  data: RouterOutputs['businesses']['getBusinessesByUserId'][number];
  isUserProfile: boolean | undefined;
};

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
      aria-label="Copy URL to clipboard"
      className={styles['share-button']}
      onClick={copy}
    >
      <svg height={20} width={20}>
        <use href="/icons.svg#link" />
      </svg>
    </button>
  );
};

const EntryManagePopover = (props: {
  businessId: string;
  businessUrl: string;
}) => {
  const [open, setOpen] = useState(false);
  const { businessId, businessUrl } = props;
  const ctx = api.useContext();
  const { mutate } = api.businesses.delete.useMutation({
    onSuccess: () => {
      toast.success('Business removed!', {
        id: 'removeBusiness',
      });
      void ctx.businesses.getBusinessesByUserId.invalidate();
    },
  });

  const { data, refetch } = api.businesses.getBusinessById.useQuery(
    { businessId },
    { enabled: false }
  );

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          aria-label="Entry management"
          className={styles['entry-popover-button']}
          onClick={() => refetch()}
        >
          <svg height={20} width={20}>
            <use href="/icons.svg#kebab" />
          </svg>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="center"
          className={styles['entry-popover']}
          collisionPadding={16}
          side="bottom"
          sideOffset={5}
        >
          <Popover.Close className={styles['sr-only']}>Close</Popover.Close>
          <Popover.Close asChild>
            <a href={businessUrl} rel="noopener noreferrer" target="_blank">
              Go to site
              <svg height={16} width={16}>
                <use href="/icons.svg#arrowUpRight" />
              </svg>
            </a>
          </Popover.Close>

          <Dialog>
            <DialogTrigger asChild>
              <button disabled={!data}>
                Edit
                <svg height={14} width={14}>
                  <use href="/icons.svg#pencil" />
                </svg>
              </button>
            </DialogTrigger>
            <DialogContent onInteractOutside={() => setOpen(false)}>
              {!!data && (
                <>
                  <DialogTitle>Edit entry</DialogTitle>
                  <DialogDescription>
                    Make changes to your favorite place, service or activity.
                  </DialogDescription>
                  <UpdateEntryForm business={data} setOpen={setOpen} />
                </>
              )}
            </DialogContent>
          </Dialog>
          <button onClick={() => mutate({ id: businessId })} type="button">
            Remove
            <svg height={14} width={14}>
              <use href="/icons.svg#trash" />
            </svg>
          </button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

const BusinessViewContent = (props: BusinessWithUser) => {
  const {
    data: { business },
    isUserProfile,
  } = props;
  const hostname = new URL(business.url).hostname;
  const iconSrc = `https://s2.googleusercontent.com/s2/favicons?domain=${hostname}&sz=128`;
  const [error, setError] = useState(false);

  return (
    <>
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
      {isUserProfile ? (
        <EntryManagePopover
          businessId={business.id}
          businessUrl={business.url}
        />
      ) : (
        <span className={styles['list-icon']}>
          <svg height={20} width={20}>
            <use href="/icons.svg#arrowUpRight" />
          </svg>
        </span>
      )}
    </>
  );
};

const BusinessView = (props: BusinessWithUser) => {
  const {
    data: { business },
    isUserProfile,
  } = props;

  if (!isUserProfile)
    return (
      <li key={business.id}>
        <a
          className={styles['list-item']}
          href={business.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          <BusinessViewContent {...props} />
        </a>
      </li>
    );

  return (
    <li key={business.id}>
      <span className={styles['list-item']}>
        <BusinessViewContent {...props} />
      </span>
    </li>
  );
};

const ProfileList = (props: {
  userId: string;
  isUserProfile: boolean | undefined;
}) => {
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
      {data.map((fullListing) => {
        const fullListingWithUserInfo = {
          data: fullListing,
          isUserProfile: props.isUserProfile,
        };
        return (
          <BusinessView
            key={fullListing.business.id}
            {...fullListingWithUserInfo}
          />
        );
      })}
    </ul>
  );
};

export default function ProfilePage({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div>404</div>;

  // required in Clerk so these should never be empty
  const firstName = data.firstName ?? '';
  const lastName = data.lastName ?? '';

  const isSignedInUserProfile = isSignedIn && user.username === username;

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
            <div className={styles['user-controls']}>
              {isSignedInUserProfile ? (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <button className={styles['add-entry-button']}>
                      Add to list
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>Add new entry</DialogTitle>
                    <DialogDescription>
                      Add your favorite place, service or activity to your list.
                    </DialogDescription>
                    <AddEntryForm setOpen={setOpen} />
                  </DialogContent>
                </Dialog>
              ) : null}
              <CopyURLToClipboardButton />
            </div>
          </div>
        </section>
        <section className={styles['list-content']}>
          <h2 className={styles['list-heading']}>My JoyList</h2>
          <ProfileList userId={data.id} isUserProfile={isSignedInUserProfile} />
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
