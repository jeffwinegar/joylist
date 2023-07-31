import { ClerkProvider } from '@clerk/nextjs';
import { type AppType } from 'next/app';
import { Playfair_Display } from 'next/font/google';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import { Header } from '~/components/header';
import '~/styles/globals.css';
import { api } from '~/utils/api';

const playfairDisplay = Playfair_Display({ subsets: ['latin'] });

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <style jsx global>{`
        :root {
          --font-playfairDisplay: ${playfairDisplay.style.fontFamily};
        }
      `}</style>
      <Head>
        <title>JoyList</title>
        <meta name="description" content="Give the right gift." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster position="bottom-left" />
      <Header />
      <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
