/* eslint-disable @typescript-eslint/restrict-template-expressions */
/**
 * TO-DO
 * - listagem de agenda baseado no user_id ok
 * - handle para redirecionar para pagina de agendamento
 *
 * */
import { useState } from 'react'
import { type NextPage } from 'next'
import Head from 'next/head'
import dayjs from 'dayjs'
import { ptBR } from 'date-fns/locale'

import { api } from '@/utils/api'
import { useUser } from '@clerk/nextjs'

import { Calendar } from '@/components/ui/calendar'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const AppointmentTable = ({
  userId: userUuid,
  date,
}: {
  userId: string
  date: Date | undefined
}) => {
  const { data: appointments } = api.schedure.appointments.useQuery({
    userUuid,
    date,
  })

  return (
    <Table>
      {appointments && appointments.length > 0 ? (
        <TableCaption>
          Seus agendamentos marcados para
          {dayjs(date).format('DD/MM/YYYY')}
        </TableCaption>
      ) : (
        <TableCaption>
          Não há agendamento para {dayjs(date).format('DD/MM/YYYY')}
        </TableCaption>
      )}
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Nome</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Horário</TableHead>
          <TableHead className="text-right">Ação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments?.map((appointment) => (
          <TableRow key={appointment.name}>
            <TableCell className="font-medium">{appointment.name}</TableCell>
            <TableCell>{appointment.observations}</TableCell>
            <TableCell>
              {dayjs(appointment.date).format('DD/MM/YYYY')}
            </TableCell>
            <TableCell className="text-right">
              <Button variant={'secondary'} asChild>
                <Link href="/">Sobre</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const DashboardPage: NextPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const { data: interval } = api.timeInterval.getByUserId.useQuery()

  const { toast } = useToast()

  const { user } = useUser()
  if (!user) return null

  const handleCalendarInput = (selectedDate: Date | undefined) => {
    const dateWithTime = dayjs(selectedDate).format('DD/MM/YY')

    toast({
      title: 'A sua agenda foi filtrada para o dia:',
      description: dateWithTime,
    })
  }

  return (
    <>
      <Head>
        <title>{user.username ?? user.firstName}</title>
      </Head>
      <div className="flex max-w-full flex-grow flex-col justify-around  md:p-3 lg:flex-row">
        <div className="flex flex-grow flex-col items-stretch lg:items-center ">
          <h1>Seu calendario</h1>
          <AppointmentTable userId={user.id} date={selectedDate} />
        </div>

        <div className="flex flex-col items-center justify-center">
          <Calendar
            mode="single"
            locale={ptBR}
            className="border-1 rounded-md font-mono text-sm"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date)
              handleCalendarInput(date)
            }}
            disabled={{ before: new Date() }}
          />
          <div className="flex flex-col justify-between gap-2 sm:flex-row">
            {!!interval && interval.length > 0 ? (
              <Button asChild>
                <Link href="/dashboard/time-intervals">
                  Alterar disponibilidades
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href={`/dashboard/time-intervals/${user?.username}`}>
                  Inserir disponibilidades
                </Link>
              </Button>
            )}

            <Button asChild>
              <Link href={`/schedule/${user?.username}`}>
                marcar um agendamento
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default DashboardPage
