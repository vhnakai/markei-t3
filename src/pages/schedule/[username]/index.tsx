import { generateSSGHelper } from '@/server/helper/ssgHelper'
import { api } from '@/utils/api'
import { type NextPage, type GetStaticProps } from 'next'
import { NextSeo } from 'next-seo'

const Schedule: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({ username })
  if (!data) return <div> 404</div>
  return (
    <>
      <NextSeo title={`Agendar com ${username}`} />
    </>
  )
}

export const getStaticPaths = () => {
  return { paths: [], fallback: 'blocking' }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper()
  const username = context.params?.username

  if (typeof username !== 'string') throw new Error('Sem usúario')

  await ssg.profile.getUserByUsername.prefetch({ username })

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
    revalidate: 60 * 60 * 24, // 1 day
  }
}

export default Schedule
