/* eslint-disable @typescript-eslint/no-misused-promises */
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { generateSSGHelper } from '@/server/helper/ssgHelper'
import { api } from '@/utils/api'
import { ptBR } from 'date-fns/locale'
import dayjs from 'dayjs'

import { type NextPage, type GetStaticProps } from 'next'
import { NextSeo } from 'next-seo'
import { useState } from 'react'
import ErrorPage from 'next/error'
import { Form, FormDescription } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'

const scheduleFormSchema = z.object({
  name: z.string().min(3, { message: 'O nome precisa no mínimo 3 caracteres' }),
  email: z.string().email({ message: 'Digite um e-mail válido' }),
  observations: z.string().nullable(),
})

type ScheduleFormData = z.infer<typeof scheduleFormSchema>

const Schedule: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({ username })
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null)
  const [openFormModal, setOpenFormModal] = useState(false)

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleFormSchema),
  })

  const { toast } = useToast()

  if (!data) return <ErrorPage statusCode={404} />

  const { data: availability } =
    api.availability.getTimesByUserIdAndDate.useQuery({
      date: selectedDate,
      userId: data.id,
    })

  const isDateSelected = !!selectedDate

  function handleSelectTime(hour: number) {
    const dateWithTime = dayjs(selectedDate)
      .set('hour', hour)
      .startOf('hour')
      .toDate()

    setSelectedDateTime(dateWithTime)
    setOpenFormModal(true)
  }

  const userId = data.id

  const { mutate } = api.schedule.schedule.useMutation({
    onSuccess: (schedule) => {
      form.reset()
      toast({ description: schedule.message })
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content
      if (errorMessage && errorMessage[0]) {
        toast({ description: errorMessage[0] })
      } else {
        toast({
          description: e.message,
        })
      }
    },
  })

  function handleScheduleSubmit({
    name,
    email,
    observations,
  }: ScheduleFormData) {
    const formattedDatetime = dayjs(selectedDateTime).toISOString()

    mutate({
      userUuid: userId,
      date: formattedDatetime,
      name,
      email,
      observations,
    })

    setOpenFormModal(false)
  }

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = form

  return (
    <>
      <NextSeo title={`Agendar com ${username}`} />
      <main className="overflow-none flex h-screen justify-center">
        <div className="flex h-full w-screen flex-col items-center justify-center gap-3">
          <h1 className="text-4xl">
            {data.firstName?.toLocaleUpperCase()}{' '}
            {data.lastName?.toLocaleUpperCase()}
          </h1>
          <p>
            {`Você está querendo marcar para:
            ${dayjs(selectedDate).format('DD/MM/YY')}`}
          </p>
          <div className="flex flex-col items-center justify-around p-0 md:flex-row">
            <Calendar
              mode="single"
              locale={ptBR}
              className="border-1 rounded-md font-mono text-sm"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={{ before: new Date() }}
            />

            {isDateSelected &&
              (availability && availability.possibleTimes.length > 0 ? (
                <div className="max-h-72 w-72 overflow-auto px-6 pb-0 pt-6">
                  <div className="mt-3 grid grid-cols-2 gap-2 ">
                    {availability.possibleTimes.map((hour) => {
                      return (
                        <Button
                          variant={'outline'}
                          key={hour}
                          onClick={() => handleSelectTime(hour)}
                          disabled={!availability.availableTimes.includes(hour)}
                        >
                          {String(hour).padStart(2, '0')}:00h
                        </Button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex h-full max-h-72 w-72 flex-col items-center justify-center overflow-auto  px-6 pb-0 pt-6 lg:w-full ">
                  <p>Não temos horarios disponiveis</p>
                </div>
              ))}

            {selectedDateTime && (
              <Dialog open={openFormModal} onOpenChange={setOpenFormModal}>
                <DialogContent className="sm:max-w-[425px]">
                  <Form {...form}>
                    <DialogHeader>
                      <DialogTitle>Falta mais um pouco</DialogTitle>
                      <DialogDescription>
                        Preencha essas informações para agendar
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(handleScheduleSubmit)}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Nome Completo
                          </Label>
                          <Input
                            id="name"
                            placeholder="Seu nome"
                            className="col-span-3"
                            {...register('name')}
                          />
                          {errors.name && (
                            <FormDescription>
                              {errors.name.message}
                            </FormDescription>
                          )}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="email" className="text-right">
                            E-mail
                          </Label>
                          <Input
                            id="email"
                            placeholder="johndoe@example.com"
                            className="col-span-3"
                            {...register('email')}
                          />
                          {errors.email && (
                            <FormDescription>
                              {errors.email.message}
                            </FormDescription>
                          )}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="observations" className="text-right">
                            Observações
                          </Label>
                          <Textarea
                            id="observations"
                            placeholder="Escreva alguma observação"
                            className="col-span-3"
                            {...register('observations')}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                          Save changes
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
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

  if (typeof username !== 'string') throw new Error('Sem usúario')

  await ssg.profile.getUserByUsername.prefetch({ username })

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  }
}

export default Schedule
