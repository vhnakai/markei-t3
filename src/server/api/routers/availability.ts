import { z } from 'zod'
import dayjs from 'dayjs'

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { clerkClient } from '@clerk/nextjs'
import { TRPCError } from '@trpc/server'

export const availabilityRouter = createTRPCRouter({
  available: protectedProcedure
    .input(
      z.object({
        username: z.string(),
        date: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { username, date } = input

      const referenceDate = dayjs(String(date))
      const isPastDate = referenceDate.endOf('day').isBefore(new Date())

      if (isPastDate) {
        return { possibleTimes: [], availableTimes: [] }
      }

      const [user] = await clerkClient.users.getUserList({
        username: [username],
      })

      if (!user) {
        // if we hit here we need a unsantized username so hit api once more and find the user.
        const users = await clerkClient.users.getUserList({
          limit: 200,
        })
        const user = users.find((user) =>
          user.externalAccounts.find(
            (account) => account.username === input.username,
          ),
        )
        if (!user) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'User not found',
          })
        }
      }

      if (!user) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'User not found',
        })
      }

      const userAvailability = await ctx.prisma.userTimeInterval.findFirst({
        where: {
          userId: user.id,
          weekDay: referenceDate.get('day'),
        },
      })

      if (!userAvailability) {
        return { possibleTimes: [], availableTimes: [] }
      }

      const { timeStartInMinutes, timeEndInMinutes } = userAvailability

      const startHour = timeStartInMinutes / 60
      const endHour = timeEndInMinutes / 60

      const possibleTimes = Array.from({ length: endHour - startHour }).map(
        (_, i) => {
          return startHour + i
        },
      )

      const blockedTimes = await ctx.prisma.scheduling.findMany({
        select: {
          date: true,
        },
        where: {
          userId: user.id,
          date: {
            gte: referenceDate.set('hour', startHour).toDate(),
            lte: referenceDate.set('hour', endHour).toDate(),
          },
        },
      })

      const availableTimes = possibleTimes.filter((time) => {
        const isTimeBlocked = blockedTimes.some(
          (blockedTime) => blockedTime.date.getHours() === time,
        )

        const isTimeInPast = referenceDate
          .set('hour', time)
          .isBefore(new Date())

        return !isTimeBlocked && !isTimeInPast
      })

      return { possibleTimes, availableTimes }
    }),
})
