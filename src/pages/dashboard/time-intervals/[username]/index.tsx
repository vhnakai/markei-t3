/* eslint-disable @typescript-eslint/no-misused-promises */
import { zodResolver } from '@hookform/resolvers/zod'
import { generateSSGHelper } from '@/server/helper/ssgHelper'
import { type NextPage, type GetStaticProps } from 'next'

import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import { Check } from 'lucide-react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { convertTimeStringToMinutes } from '@/utils/convert-time-string-to-minute'
import { getWeekDays } from '@/utils/get-week-days'

import { api } from '@/utils/api'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

const timeIntervalsFormSchema = z.object({
  intervals: z
    .array(
      z.object({
        weekDay: z.number().min(0).max(6),
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .length(7)
    .transform((intervals) => intervals.filter((interval) => interval.enabled))
    .refine((intervals) => intervals.length > 0, {
      message: 'Você precisa selecionar pelo menos um dia da semana',
    })
    .transform((intervals) => {
      return intervals.map((interval) => {
        return {
          weekDay: interval.weekDay,
          startTimeInMinutes: convertTimeStringToMinutes(interval.startTime),
          endTimeInMinutes: convertTimeStringToMinutes(interval.endTime),
        }
      })
    })
    .refine(
      (intervals) => {
        return intervals.every(
          (interval) =>
            interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes,
        )
      },
      {
        message:
          'O horário de término deve ser pelo menos 1h distante do início.',
      },
    ),
})

type TimeIntervalsFormInput = z.input<typeof timeIntervalsFormSchema>
type TimeIntervalsFormOutput = z.output<typeof timeIntervalsFormSchema>

const TimeIntervals: NextPage<{ username: string }> = () => {
  const { toast } = useToast()
  const router = useRouter()

  const { mutate, data } = api.timeInterval.create.useMutation({
    onSuccess: () => {
      toast({
        description: data?.message,
      })
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content
      if (errorMessage && errorMessage[0]) {
        toast({ description: errorMessage[0] })
      } else {
        toast({ description: 'Failed to create! Please try again later.' })
      }
    },
  })

  const form = useForm<TimeIntervalsFormInput>({
    resolver: zodResolver(timeIntervalsFormSchema),
    defaultValues: {
      intervals: [
        { weekDay: 0, enabled: false, startTime: '08:00', endTime: '18:00' },
        { weekDay: 1, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 2, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 3, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 4, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 5, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 6, enabled: false, startTime: '08:00', endTime: '18:00' },
      ],
    },
  })

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting, errors },
  } = form

  const weekDays = getWeekDays()

  const { fields } = useFieldArray({
    control,
    name: 'intervals',
  })

  const intervals = watch('intervals')

  async function handleSetTimeIntervals(data: any) {
    const { intervals } = data as TimeIntervalsFormOutput

    mutate(intervals)

    await router.push('/dashboard')
  }

  return (
    <>
      <NextSeo title="Selecione sua disponibilidade | Markei" noindex />

      <main className="overflow-none my-auto flex h-screen flex-col items-center justify-center">
        <div className="px-6 py-0">
          <p>
            Defina o intervalo de horário que você está disponível em cada dia
            da semana.
          </p>
        </div>

        <div className="mt-6 flex w-3/4 max-w-sm flex-col">
          <Form {...form}>
            <form
              className="mt-6 flex flex-col gap-4"
              onSubmit={handleSubmit(handleSetTimeIntervals)}
            >
              <div className="mb-4 rounded-md border-solid border-gray-50">
                {fields.map((field, index) => {
                  return (
                    <div
                      className="flex items-center justify-between px-3 py-4 first:border-t-slate-600 "
                      key={field.id}
                    >
                      <div className="flex items-center gap-3">
                        <Controller
                          name={`intervals.${index}.enabled`}
                          control={control}
                          render={({ field }) => {
                            return (
                              <Checkbox
                                onCheckedChange={(checked) =>
                                  field.onChange(checked === true)
                                }
                                checked={field.value}
                              />
                            )
                          }}
                        />
                        <p>{weekDays[field.weekDay]}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          step={60}
                          disabled={intervals[index]?.enabled === false}
                          {...register(`intervals.${index}.startTime`)}
                        />
                        <Input
                          type="time"
                          step={60}
                          disabled={intervals[index]?.enabled === false}
                          {...register(`intervals.${index}.endTime`)}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {errors.intervals && (
                <p className="text-sm">{errors.intervals.message}</p>
              )}

              <Button type="submit" disabled={isSubmitting}>
                Salvar
                <Check className="m-1" />
              </Button>
            </form>
          </Form>
        </div>
      </main>
    </>
  )
}

export const getStaticPaths = () => {
  return { paths: [], fallback: 'blocking' }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper()
  const username = context.params?.username

  if (typeof username !== 'string') throw new Error('Sem usuario')

  await ssg.timeInterval.getByUserId.prefetch()

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
    revalidate: 60 * 60 * 24, // 1 day
  }
}

export default TimeIntervals
