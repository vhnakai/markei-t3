import { z } from "zod";
import dayjs from 'dayjs'

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

export const availabilityRouter = createTRPCRouter({

  available: protectedProcedure.input(z.object({
    user_uuid: z.string(),
    date: z.date()
  })).query(async ({ ctx, input }) => {

    const { user_uuid, date } = input

    const referenceDate = dayjs(String(date))
    const isPastDate = referenceDate.endOf('day').isBefore(new Date())

    if (isPastDate) {
      return { possibleTimes: [], availableTimes: [] }
    }

    const userAvailability = await ctx.prisma.userTimeInterval.findFirst({
      where: {
        userId: user_uuid,
        week_day: referenceDate.get('day'),
      },
    })

    if (!userAvailability) {
      return { possibleTimes: [], availableTimes: [] }
    }

    const { time_start_in_minutes, time_end_in_minutes } = userAvailability

    const startHour = time_start_in_minutes / 60
    const endHour = time_end_in_minutes / 60

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
        userId: user_uuid,
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

      const isTimeInPast = referenceDate.set('hour', time).isBefore(new Date())

      return !isTimeBlocked && !isTimeInPast
    })

    return { possibleTimes, availableTimes }

  }),
});
