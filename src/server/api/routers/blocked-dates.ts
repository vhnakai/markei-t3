import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

export const blockedDatesrouter = createTRPCRouter({

  blockedDates: protectedProcedure
    .input(z.object({
      user_uuid: z.string(),
      year: z.number(),
      month: z.number(),
    }))
    .query(async ({ ctx, input }) => {

      const { user_uuid, year, month } = input

      const availableWeekDays = await ctx.prisma.userTimeInterval.findMany({
        select: {
          week_day: true,
        },
        where: {
          userId: user_uuid,
        },
      })

      const blockedWeekDays = [0, 1, 2, 3, 4, 5, 6].filter((weekDay) => {
        return !availableWeekDays.some(
          (availableWeekDay) => availableWeekDay.week_day === weekDay,
        )
      })


      const blockedDatesRaw: Array<{ date: number }> = await ctx.prisma.$queryRaw`
        SELECT
          EXTRACT(DAY FROM S.DATE) AS date,
          COUNT(S.date) AS amount,
          ((UTI.time_end_in_minutes - UTI.time_start_in_minutes) / 60) AS size

        FROM schedulings S

        LEFT JOIN user_time_intervals UTI
          ON UTI.week_day = WEEKDAY(DATE_ADD(S.date, INTERVAL 1 DAY))

        WHERE S.userId = ${user_uuid}
          AND DATE_FORMAT(S.date, "%Y-%m") = ${`${year}-${month}`}

        GROUP BY EXTRACT(DAY FROM S.DATE),
          ((UTI.time_end_in_minutes - UTI.time_start_in_minutes) / 60)

        HAVING amount >= size
      `

      const blockedDates = blockedDatesRaw.map((item) => item.date)

      return { blockedWeekDays, blockedDates }
    }),
});
