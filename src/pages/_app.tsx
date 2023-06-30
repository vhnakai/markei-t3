import { type AppType } from 'next/app'
import { ClerkProvider } from '@clerk/nextjs'
import { ptBR } from '@clerk/localizations'
import { api } from '@/utils/api'

import '@/styles/globals.css'
import Head from 'next/head'
import { Toaster } from '@/components/ui/toaster'

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider localization={ptBR} {...pageProps}>
      <Head>
        <title>Markei</title>
        <meta
          name="description"
          content="Agende suas consultas sem dor de cabeça"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster />
      <Component {...pageProps} />
    </ClerkProvider>
  )
}

export default api.withTRPC(MyApp)
