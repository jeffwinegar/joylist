import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import styles from './userSearch.module.css';

export const UserSearch = () => {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = React.useState(
    searchParams ? searchParams.get('q') || '' : ''
  );
  const router = useRouter();

  const onSearch = (event: React.FormEvent) => {
    event.preventDefault();

    if (!searchQuery) return;

    const encodedSearchQuery = encodeURI(searchQuery);
    router.push(`/search?q=${encodedSearchQuery}`);
  };

  return (
    <form className={styles.form} onSubmit={onSearch}>
      <input
        onChange={(e) => setSearchQuery(e.target.value)}
        type="text"
        value={searchQuery}
      />
      <button className={styles['primary-button']} type="submit">
        Find a user
      </button>
    </form>
  );
};
