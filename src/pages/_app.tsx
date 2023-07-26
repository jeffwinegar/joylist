import { ClerkProvider } from '@clerk/nextjs';
import { type AppType } from 'next/app';
import Head from 'next/head';
import { Header } from '~/components/header';
import '~/styles/globals.css';
import { api } from '~/utils/api';

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <Head>
        <title>JoyList</title>
        <meta name="description" content="Give the right gift." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
