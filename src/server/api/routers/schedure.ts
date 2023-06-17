import { z } from "zod";
import dayjs from "dayjs";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

export const scheduringRouter = createTRPCRouter({

  schedure: protectedProcedure
    .input(z.object({
      user_uuid: z.string(),
      name: z.string(),
      email: z.string().email(),
      observations: z.string(),
      date: z.string().datetime(),
    }))
    .query(async ({ ctx, input }) => {

      const { user_uuid, name, email, observations, date } = input

      const schedulingDate = dayjs(date).startOf('hour')

      if (schedulingDate.isBefore(new Date())) {
        return {
          message: 'Date is in the past.',
        }
      }

      const conflictingScheduling = await ctx.prisma.scheduling.findFirst({
        where: {
          userId: user_uuid,
          date: schedulingDate.toDate(),
        },
      })

      if (conflictingScheduling) {
        return {
          message: 'There is another scheduling at at the same time.',
        }
      }

      const scheduling = await ctx.prisma.scheduling.create({
        data: {
          name,
          email,
          observations,
          date: schedulingDate.toDate(),
          userId: user_uuid,
        },
      })

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

      return { message: 'A new appointment was successfully scheduled.', schedureId: scheduling.id }
    }),
  appointments: publicProcedure.input(z.object({
    user_uuid: z.string()
  }))
    .query(
      async ({ ctx, input }) => {
        const { user_uuid } = input

        const appointments = await ctx.prisma.scheduling.findMany({
          select: {
            name: true,
            date: true,
            observations: true
          },
          where: {
            userId: user_uuid,
          },
          orderBy: {
            date: "asc"
          },
          take: 15
        })

        return appointments

      }
    )
});
