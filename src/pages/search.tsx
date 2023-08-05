import { useSearchParams } from 'next/navigation';
import { api } from '~/utils/api';

const SearchResults = () => {
  const searchParam = useSearchParams();
  const query = searchParam ? searchParam.get('q') || '' : '';

  const { data, isLoading } = api.profile.getUsersBySearch.useQuery({ query });

  if (isLoading) return <div>Loading...</div>;

  if (!data || data.length === 0) return <div>NO RESULTS</div>;

  return <ul>{data.map((user) => user.username)}</ul>;
};

export default function SearchPage() {
  return (
    <main>
      <h1>Search Results Page</h1>
      <SearchResults />
    </main>
  );
}
