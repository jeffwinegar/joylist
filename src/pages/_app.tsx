import { ClerkProvider } from '@clerk/nextjs';
import { type AppType } from 'next/app';
import { Playfair_Display } from 'next/font/google';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import { Header } from '~/components/header';
import '~/styles/globals.css';
import { api } from '~/utils/api';

const playfair_display = Playfair_Display({ subsets: ['latin'] });

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <Head>
        <title>JoyList</title>
        <meta
          name="description"
          content="Take the guesswork out of finding the perfect gift."
        />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <style jsx global>{`
        :root {
          --font-playfair-display: ${playfair_display.style.fontFamily};
        }
      `}</style>

      <Toaster position="bottom-left" />
      <Header />
      <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
