import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import styles from './userSearch.module.css';

export const UserSearch = () => {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams ? searchParams.get('q') : ''
  );
  const router = useRouter();

  const onSearch = (event: React.FormEvent) => {
    event.preventDefault();

    if (typeof searchQuery !== 'string') return;

    router.push(`/search?q=${encodeURI(searchQuery)}`);
  };

  return (
    <form className={styles.form} onSubmit={onSearch}>
      <input
        onChange={(e) => setSearchQuery(e.target.value)}
        type="text"
        value={searchQuery || ''}
      />
      <button className={styles['primary-button']} type="submit">
        Find a user
      </button>
    </form>
  );
};
