import { UserSearch } from '~/components/userSearch';
import styles from './index.module.css';
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <section className={styles['hero-section']}>
        <div className={styles['pitch-container']}>
          <article className={styles['pitch-content']}>
            <h1 className={styles['hero-heading']}>Gift giving done right!</h1>
            <p>
              Take the guesswork out of knowing what to get a friend,
              acquaintance or loved one with this ultimate reference tool
              designed to streamline gift giving — happiness guaranteed.
            </p>

            <UserSearch />
          </article>
        </div>
      </section>
      <section className={styles['pitch-section']}>
        <div className={styles['pitch-container']}>
          <article className={styles['pitch-content']}>
            <h2 className={styles['pitch-heading']}>
              Create and customize your JoyList in minutes
            </h2>
            <p>
              List what you love so others can love you back. Add your favorite
              places, services or activities and share your profile.
            </p>

            <Link className={styles['primary-button']} href={'/sign-up'}>
              Get started for free
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}
