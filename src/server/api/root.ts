import { createTRPCRouter } from '@/server/api/trpc'
import { exampleRouter } from '@/server/api/routers/example'
import { availabilityRouter } from '@/server/api/routers/availability'
import { blockedDatesrouter } from '@/server/api/routers/blocked-dates'
import { scheduringRouter } from '@/server/api/routers/schedule'
import { profileRouter } from './routers/profile'
import { timeIntervalsRouter } from './routers/time-intervals'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  availability: availabilityRouter,
  blockedDates: blockedDatesrouter,
  schedule: scheduringRouter,
  profile: profileRouter,
  timeInterval: timeIntervalsRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
