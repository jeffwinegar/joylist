import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import styles from './header.module.css';

export function Header() {
  return (
    <header className={styles.content}>
      <span className={styles['logo-mark']}>JoyList</span>
      <span className={styles['user-controls']}>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignUpButton mode="modal">
            <button className={styles['secondary-button']}>
              Sign up for free
            </button>
          </SignUpButton>
          <SignInButton mode="modal">
            <button className={styles['primary-button']}>Sign in</button>
          </SignInButton>
        </SignedOut>
      </span>
    </header>
  );
}
