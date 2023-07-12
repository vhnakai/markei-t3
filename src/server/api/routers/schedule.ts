import { z } from 'zod'
import dayjs from 'dayjs'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc'

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

      const samePersonScheduling = await ctx.prisma.scheduling.findFirst({
        where: {
          userId: userUuid,
          email,
          AND: [
            {
              date: {
                lte: schedulingDate.endOf('day').toDate(),
                gt: schedulingDate.startOf('day').toDate(),
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

      return {
        message: 'A new appointment was successfully scheduled.',
        scheduleId: scheduling.id,
      }
    }),
  appointments: protectedProcedure
    .input(
      z.object({
        date: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { date } = input

      const { userId } = ctx

      if (!userId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Not Logged.',
        })
      }

      const formattedDate = dayjs(date).startOf('day')

      const appointments = await ctx.prisma.scheduling.findMany({
        select: {
          name: true,
          date: true,
          observations: true,
        },
        where: {
          userId,
          AND: [
            {
              date: {
                lte: formattedDate.endOf('day').toDate(),
                gt: formattedDate.startOf('day').toDate(),
              },
            },
          ],
        },
        orderBy: {
          date: 'asc',
        },
        take: 15,
      })

      return appointments
    }),
})
