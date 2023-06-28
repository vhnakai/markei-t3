import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

const timeIntervalsBodySchema = z.object({
  intervals: z.array(
    z.object({
      weekDay: z.number(),
      startTimeInMinutes: z.number(),
      endTimeInMinutes: z.number(),
    }),
  ),
})

export const timeIntervalsRouter = createTRPCRouter({
  intervals: protectedProcedure
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
      const { intervals } = timeIntervalsBodySchema.parse(input)

      const userId = ctx.session.userId

      await Promise.all(
        intervals.map((interval) => {
          return ctx.prisma.userTimeInterval.create({
            data: {
              weekDay: interval.weekDay,
              timeStartInMinutes: interval.startTimeInMinutes,
              timeEndInMinutes: interval.endTimeInMinutes,
              userId,
            },
          })
        }),
      )

      return { message: 'Yours intervals was successfully alocate.' }
    }),
})
