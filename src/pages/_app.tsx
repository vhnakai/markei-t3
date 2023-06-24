import { type AppType } from 'next/app'
import { ClerkProvider } from '@clerk/nextjs'
import { api } from '@/utils/api'

import '@/styles/globals.css'
import Head from 'next/head'

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <Head>
        <title>Markei</title>
        <meta
          name="description"
          content="Agende suas consultas sem dor de cabeça"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </ClerkProvider>
  )
}

export default api.withTRPC(MyApp)
