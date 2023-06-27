import { createServerSideHelpers } from '@trpc/react-query/server'
import { appRouter } from '@/server/api/root'
import { prisma } from '@/server/db'
import superjson from 'superjson'
import {
  type SignedOutAuthObject,
  type SignedInAuthObject,
} from '@clerk/nextjs/dist/types/server'

export const generateSSGHelper = () =>
  createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, session: <SignedInAuthObject | SignedOutAuthObject>{} },
    transformer: superjson, // optional - adds superjson serialization
  })
