import { generateSSGHelper } from '@/server/helper/ssgHelper'
import { api } from '@/utils/api'
import Image from 'next/image'
import { type NextPage, type GetStaticProps } from 'next'
import { NextSeo } from 'next-seo'

const Schedule: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({ username })
  if (!data) return <div> 404</div>
  return (
    <>
      <NextSeo title={`Agendar com ${username}`} />
      <main className="overflow-none flex h-screen justify-center">
        <div className="flex h-full w-full flex-col border-x border-slate-400 md:max-w-2xl">
          <div className="relative h-36 bg-slate-600">
            <Image
              src={data.profileImageUrl}
              alt={`${
                data.username ?? data.externalUsername ?? 'unknown'
              }'s profile pic`}
              width={128}
              height={128}
              className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
            />
          </div>
          <div className="h-[64px]"></div>
          <div className="p-4 text-2xl font-bold">{`@${
            data.username ?? data.externalUsername ?? 'unknown'
          }`}</div>
          <div className="w-full border-b border-slate-400" />
        </div>
      </main>
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
