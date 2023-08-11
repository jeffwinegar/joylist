import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { LoadingSpinner } from '~/components/loading';
import { UserSearch } from '~/components/userSearch';
import { api, type RouterOutputs } from '~/utils/api';
import styles from './search.module.css';
import Link from 'next/link';

type User = RouterOutputs['profile']['getUsersBySearch'][number];

const UserView = (props: User) => {
  // required in Clerk so these should never be empty
  const username = props.username ?? '';
  const firstName = props.firstName ?? '';
  const lastName = props.lastName ?? '';

  return (
    <li key={props.id}>
      <Link className={styles['list-item']} href={`/${username}`}>
        <span className={styles['user-image']}>
          <Image
            alt={`${firstName}'s profile image`}
            height={48}
            src={props.imageUrl}
            width={48}
          />
        </span>
        <p>
          <span className={styles['username']}>{username}</span>
          <span
            className={styles['full-name']}
          >{`${firstName} ${lastName}`}</span>
        </p>
      </Link>
    </li>
  );
};

const SearchResults = () => {
  const searchParams = useSearchParams();
  const queryParam = searchParams ? searchParams.get('q') : null;
  const query = queryParam ?? '';

  const { data, isLoading } = api.profile.getUsersBySearch.useQuery({ query });

  if (isLoading)
    return (
      <div className={styles['empty-list']}>
        <LoadingSpinner size={28} />
      </div>
    );

  if (!data || data.length === 0)
    return (
      <div className={styles['empty-list']}>
        <span>No matching users found</span>
      </div>
    );

  return (
    <ul className={styles.list} role="list">
      {data.map((fullListing) => (
        <UserView key={fullListing.id} {...fullListing} />
      ))}
    </ul>
  );
};

export default function SearchPage() {
  return (
    <main>
      <section>
        <div className={styles.wrapper}>
          <div className={styles.container}>
            <h1 className={styles['primary-heading']}>Search Results</h1>
            <UserSearch />
          </div>
        </div>
        <div className={styles.container}>
          <SearchResults />
        </div>
      </section>
    </main>
  );
}
