import { SignInButton, SignedIn, SignedOut, useUser } from '@clerk/nextjs';
// import styles from './index.module.css';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { api } from '~/utils/api';
import { LoadingSpinner } from '~/components/loading';
import { BusinessView } from '~/components/businessView';

const phoneRegex = new RegExp(/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/);

export const validationSchema = z.object({
  name: z.string().min(2).max(280),
  url: z.string().url(),
  phone: z.string().regex(phoneRegex, 'Invalid Phone Number'),
});

type Schema = z.infer<typeof validationSchema>;

const AddBusinessForm = () => {
  const { user } = useUser();
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
  } = useForm<Schema>({
    resolver: zodResolver(validationSchema),
  });
  const onSubmit: SubmitHandler<Schema> = (data) => {
    mutate(data);
    reset();
  };

  if (!user || !user.firstName || !user.lastName) return null;

  return (
    <>
      <div>
        <Image
          src={user.imageUrl}
          alt={`${user.firstName}'s profile image`}
          height={64}
          width={64}
        />
        <span>{user.firstName}</span> <span>{user.lastName}</span>
      </div>
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
    </>
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
    <main>
      <section>
        <SignedIn>
          <AddBusinessForm />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </section>

      <Listing />
    </main>
  );
}
