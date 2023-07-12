import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

export const blockedDatesrouter = createTRPCRouter({
  blockedDates: protectedProcedure
    .input(
      z.object({
        userUuid: z.string(),
        year: z.number(),
        month: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userUuid, year, month } = input

      const availableWeekDays = await ctx.prisma.userTimeInterval.findMany({
        select: {
          weekDay: true,
        },
        where: {
          userId: userUuid,
        },
      })

      const blockedWeekDays = [0, 1, 2, 3, 4, 5, 6].filter((weekDay) => {
        return !availableWeekDays.some(
          (availableWeekDay) => availableWeekDay.weekDay === weekDay,
        )
      })

      const blockedDatesRaw: Array<{ date: number }> = await ctx.prisma
        .$queryRaw`
        SELECT
          EXTRACT(DAY FROM S.DATE) AS date,
          COUNT(S.date) AS amount,
          ((UTI.time_end_in_minutes - UTI.time_start_in_minutes) / 60) AS size

        FROM schedulings S

        LEFT JOIN user_time_intervals UTI
          ON UTI.week_day = WEEKDAY(DATE_ADD(S.date, INTERVAL 1 DAY))

        WHERE S.userId = ${userUuid}
          AND DATE_FORMAT(S.date, "%Y-%m") = ${`${year}-${month}`}

        GROUP BY EXTRACT(DAY FROM S.DATE),
          ((UTI.time_end_in_minutes - UTI.time_start_in_minutes) / 60)

        HAVING amount >= size
      `

      const blockedDates = blockedDatesRaw.map((item) => item.date)

      return { blockedWeekDays, blockedDates }
    }),
})
