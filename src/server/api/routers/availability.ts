import { z } from 'zod'
import dayjs from 'dayjs'

import { createTRPCRouter, publicProcedure } from '@/server/api/trpc'

export const availabilityRouter = createTRPCRouter({
  getTimesByUserIdAndDate: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        date: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userId, date } = input

      const referenceDate = dayjs(String(date))
      const isPastDate = referenceDate.endOf('day').isBefore(new Date())

      if (isPastDate) {
        return { possibleTimes: [], availableTimes: [] }
      }

      const userAvailability = await ctx.prisma.userTimeInterval.findFirst({
        where: {
          userId,
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
          userId,
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
