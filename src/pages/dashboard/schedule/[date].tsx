import { type GetStaticProps, type NextPage } from 'next'
import Head from 'next/head'

const SchedurePage: NextPage<{ date: string }> = ({ date }) => {
  return (
    <>
      <Head>
        <title> Agendamento para o dia {date}</title>
      </Head>
    </>
  )
}

export const getStaticProps: GetStaticProps = ({ params }) => {
  const date = String(params?.date)

  if (typeof date !== 'string') throw new Error('no date')

  return {
    props: {
      date,
    },
  }
}

export const getStaticPaths = () => {
  return { paths: [], fallback: 'blocking' }
}

export default SchedurePage
