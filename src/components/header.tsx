import {
  ClerkLoaded,
  SignInButton,
  SignOutButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  useClerk,
  useUser,
} from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import styles from './header.module.css';
import * as Popover from '@radix-ui/react-popover';

const CustomUserButton = () => {
  const { user } = useUser();
  const { session, openUserProfile } = useClerk();

  if (!user) return;
  // required in Clerk so these should never be empty
  const username = user.username ?? '';
  const firstName = user.firstName ?? '';
  const lastName = user.lastName ?? '';

  return (
    <ClerkLoaded>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className={styles['user-button']}
            aria-label="User management"
          >
            <Image
              alt={`${firstName} ${lastName}`}
              height={32}
              priority={true}
              src={user.imageUrl}
              width={32}
            />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="end"
            className={styles['user-popover']}
            collisionPadding={16}
            side="bottom"
            sideOffset={8}
          >
            <Popover.Close className={styles['sr-only']}>Close</Popover.Close>
            <Popover.Close asChild>
              <Link
                className={styles['user-profile-link']}
                href={`/${username}`}
              >
                <span className={styles['user-avatar']}>
                  <Image
                    alt={`${firstName} ${lastName}`}
                    height={44}
                    priority={true}
                    src={user.imageUrl}
                    width={44}
                  />
                </span>
                <span className={styles['user-preview-text']}>
                  <p
                    className={styles['primary-user-identifier']}
                  >{`${firstName} ${lastName}`}</p>
                  <p>{username}</p>
                </span>
              </Link>
            </Popover.Close>

            <Popover.Close asChild>
              <Link
                className={styles['user-profile-link']}
                href={`/${username}`}
              >
                <svg height={13} width={13}>
                  <use href="/icons.svg#heart" />
                </svg>{' '}
                My JoyList
              </Link>
            </Popover.Close>
            <button
              className={styles['manage-account-button']}
              onClick={() => openUserProfile()}
            >
              <svg height={12} width={12}>
                <use href="/icons.svg#gear" />
              </svg>{' '}
              Manage account
            </button>
            <SignOutButton signOutOptions={{ sessionId: session?.id }}>
              <button className={styles['sign-out-button']}>
                <svg height={12} width={12}>
                  <use href="/icons.svg#signOut" />
                </svg>
                Sign out
              </button>
            </SignOutButton>

            <footer>
              <p>
                Secured by{' '}
                <a
                  href="http://www.clerk.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg height={14} width={48}>
                    <use href="/icons.svg#clerkLogo" />
                  </svg>
                </a>
              </p>
            </footer>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </ClerkLoaded>
  );
};

export function Header() {
  return (
    <header className={styles.content}>
      <Link className={styles['logo-mark']} href="/">
        JoyList
      </Link>
      <span className={styles['user-controls']}>
        <SignedIn>
          <CustomUserButton />
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
