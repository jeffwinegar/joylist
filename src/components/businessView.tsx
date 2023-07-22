import type { RouterOutputs } from '~/utils/api';

type BusinessWithUser = RouterOutputs['businesses']['getAll'][number];

export const BusinessView = (props: BusinessWithUser) => {
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
