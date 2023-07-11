import { z } from 'zod'
import dayjs from 'dayjs'
// import { google } from 'googleapis'
// import { getGoogleOAuthToken } from '@/lib/google'

import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'
// import { clerkClient } from '@clerk/nextjs'

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { TRPCError } from '@trpc/server'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '1 m'),
  analytics: true,
})

export const scheduringRouter = createTRPCRouter({
  schedule: publicProcedure
    .input(
      z.object({
        userUuid: z.string(),
        name: z.string(),
        email: z.string().email().toLowerCase(),
        observations: z.string().nullable(),
        date: z.string().datetime(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userUuid, name, email, observations, date } = input

      const schedulingDate = dayjs(date).startOf('hour')

      if (schedulingDate.isBefore(new Date())) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Date is in the past.',
        })
      }

      const conflictingScheduling = await ctx.prisma.scheduling.findFirst({
        where: {
          userId: userUuid,
          date: schedulingDate.toDate(),
        },
      })

      if (conflictingScheduling) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'There is another scheduling at at the same time.',
        })
      }

      // same person scheduring in same day

      const samePersonScheduling = await ctx.prisma.scheduling.findFirst({
        where: {
          userId: userUuid,
          email,
          AND: [
            {
              date: {
                lte: schedulingDate.endOf('day').toDate(),
              },
            },
          ],
        },
      })

      if (samePersonScheduling) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'There is another scheduling to a same person.',
        })
      }

      const { success } = await ratelimit.limit(userUuid)
      if (!success) throw new TRPCError({ code: 'TOO_MANY_REQUESTS' })

      const scheduling = await ctx.prisma.scheduling.create({
        data: {
          name,
          email,
          observations,
          date: schedulingDate.toDate(),
          userId: userUuid,
        },
      })

      // const user = await clerkClient.users.getUser(userUuid)

      // const calendar = google.calendar({
      //   version: 'v3',
      //   auth: await getGoogleOAuthToken(user.id),
      // })

      // await calendar.events.insert({
      //   calendarId: 'primary',
      //   conferenceDataVersion: 1,
      //   requestBody: {
      //     summary: `Consulta: ${name}`,
      //     description: observations,
      //     start: {
      //       dateTime: schedulingDate.format(),
      //     },
      //     end: {
      //       dateTime: schedulingDate.add(1, 'hour').format(),
      //     },
      //     attendees: [{ email, displayName: name }],
      //     conferenceData: {
      //       createRequest: {
      //         requestId: scheduling.id,
      //         conferenceSolutionKey: {
      //           type: 'hangoutsMeet',
      //         },
      //       },
      //     },
      //   },
      // })

      return {
        message: 'A new appointment was successfully scheduled.',
        scheduleId: scheduling.id,
      }
    }),
  appointments: publicProcedure
    .input(
      z.object({
        userUuid: z.string(),
        date: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userUuid, date } = input

      const appointments = await ctx.prisma.scheduling.findMany({
        select: {
          name: true,
          date: true,
          observations: true,
        },
        where: {
          userId: userUuid,
          date: date || new Date(),
        },
        orderBy: {
          date: 'asc',
        },
        take: 15,
      })

      return appointments
    }),
})
