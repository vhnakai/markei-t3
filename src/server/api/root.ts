import { createTRPCRouter } from '@/server/api/trpc'
import { exampleRouter } from '@/server/api/routers/example'
import { availabilityRouter } from '@/server/api/routers/availability'
import { blockedDatesrouter } from '@/server/api/routers/blocked-dates'
import { scheduringRouter } from '@/server/api/routers/schedure'
import { profileRouter } from './routers/profile'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  availability: availabilityRouter,
  blockedDates: blockedDatesrouter,
  schedure: scheduringRouter,
  profile: profileRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
