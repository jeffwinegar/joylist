import { SignInButton, SignedIn, SignedOut, useUser } from '@clerk/nextjs';
// import styles from './index.module.css';
import Head from 'next/head';
// import Link from 'next/link';
import { api } from '~/utils/api';
import type { RouterOutputs } from '~/utils/api';
import Image from 'next/image';
import { LoadingSpinner } from '~/components/loading';

const AddBusinessWizard = () => {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div>
      <Image
        src={user.imageUrl}
        alt={`${user.firstName}'s profile image`}
        height={64}
        width={64}
      />
    </div>
  );
};

type BusinessWithUser = RouterOutputs['businesses']['getAll'][number];

const BusinessView = (props: BusinessWithUser) => {
  const { business } = props;

  return (
    <div key={business.id}>
      {business.name}
      {' • '}
      <a href={business.url} target="_blank" rel="noopener noreferrer">
        Website
      </a>
      {' • '}
      <a href={`tel:+${business.phone}`}>{business.phone}</a>
    </div>
  );
};

const Listing = () => {
  const { data, isLoading } = api.businesses.getAll.useQuery();

  if (isLoading) return <LoadingSpinner size={24} />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div>
      {data.map((fullListing) => (
        <BusinessView key={fullListing.business.id} {...fullListing} />
      ))}
    </div>
  );
};

export default function Home() {
  const { isLoaded: userLoaded } = useUser();

  api.businesses.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <section>
          <SignedIn>
            <AddBusinessWizard />
          </SignedIn>
          <SignedOut>
            <SignInButton />
          </SignedOut>
        </section>

        <Listing />
      </main>
    </>
  );
}
