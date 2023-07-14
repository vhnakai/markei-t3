import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

// const timeIntervalsBodySchema = z.object({
//   intervals: z.array(
//     z.object({
//       weekDay: z.number(),
//       startTimeInMinutes: z.number(),
//       endTimeInMinutes: z.number(),
//     }),
//   ),
// })

export const timeIntervalsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.array(
        z.object({
          weekDay: z.number(),
          startTimeInMinutes: z.number(),
          endTimeInMinutes: z.number(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const intervals = input

      const userId = ctx.auth.userId

      await Promise.all(
        intervals.map((interval) => {
          return ctx.prisma.userTimeInterval.create({
            data: {
              weekDay: interval.weekDay,
              timeStartInMinutes: interval.startTimeInMinutes,
              timeEndInMinutes: interval.endTimeInMinutes,
              userId,
              enabled: true,
            },
          })
        }),
      )

      return { message: 'Yours intervals was successfully alocate.' }
    }),

  update: protectedProcedure
    .input(
      z.array(
        z.object({
          weekDay: z.number(),
          startTimeInMinutes: z.number(),
          endTimeInMinutes: z.number(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const newIntervals = input

      const userId = ctx.auth.userId

      const intervals = await ctx.prisma.userTimeInterval.findMany({
        where: { userId },
      })

      const weekDayInDb = intervals.map((interval) => interval.weekDay)

      const isNotInDbs = newIntervals.filter(
        (interval) => !weekDayInDb.includes(interval.weekDay),
      )

      await Promise.all(
        isNotInDbs.map((isNotInDb) => {
          return ctx.prisma.userTimeInterval.create({
            data: {
              weekDay: isNotInDb.weekDay,
              timeStartInMinutes: isNotInDb?.startTimeInMinutes,
              timeEndInMinutes: isNotInDb?.endTimeInMinutes,
              enabled: true,
              userId,
            },
          })
        }),
      )

      await Promise.all(
        intervals.map((interval) => {
          const newTime = newIntervals.find(
            (int) => int.weekDay === interval.weekDay,
          )

          return ctx.prisma.userTimeInterval.update({
            where: {
              id: interval.id,
            },
            data: {
              weekDay: interval.weekDay,
              timeStartInMinutes:
                newTime?.startTimeInMinutes ?? interval.timeStartInMinutes,
              timeEndInMinutes:
                newTime?.endTimeInMinutes ?? interval.timeEndInMinutes,
              enabled: !!newTime,
              userId,
            },
          })
        }),
      )

      return { message: 'Yours intervals was successfully alocate.' }
    }),
  getByUserId: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId

    const intervals = await ctx.prisma.userTimeInterval.findMany({
      select: {
        weekDay: true,
        enabled: true,
        timeStartInMinutes: true,
        timeEndInMinutes: true,
      },
      where: { userId },
      orderBy: { weekDay: 'asc' },
    })

    return intervals
  }),
})
