/**
 * TO-DO
 * - listagem de agenda baseado no user_id ok
 * - handle para redirecionar para pagina de agendamento
 *
 * */

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

import { api } from '@/utils/api'
import { useUser } from '@clerk/nextjs'
import { ptBR } from 'date-fns/locale'
import dayjs from 'dayjs'
import { type NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'

const AppointmentTable = (props: { userId: string }) => {
  const { data: appointments } = api.schedure.appointments.useQuery({
    userUuid: props.userId,
  })

  if (!appointments) return <h1>No apppointment was found</h1>

  return (
    <Table>
      <TableCaption>
        Seus agendamentos marcados para hoje (
        {dayjs(new Date()).format('DD/MM/YYYY')} )
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Nome</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Horário</TableHead>
          <TableHead className="text-right">Ação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appointment) => (
          <TableRow key={appointment.name}>
            <TableCell className="font-medium">{appointment.name}</TableCell>
            <TableCell>{appointment.observations}</TableCell>
            <TableCell>
              {dayjs(appointment.date).format('DD/MM/YYYY')}
            </TableCell>
            <TableCell className="text-right">Botao</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function handleCalendarInput(selectedDate: Date) {
  const dateWithTime = dayjs(selectedDate).toDate()

  console.log(dateWithTime)
}

const DashboardPage: NextPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>()

  const { user } = useUser()
  if (!user) return <div>404</div>

  return (
    <>
      <Head>
        <title>{user.username ?? user.firstName}</title>
      </Head>
      <div className="flex max-w-full items-stretch justify-center ">
        <AppointmentTable userId={user.id} />

        <Calendar
          mode="single"
          locale={ptBR}
          className="border-1 rounded-md font-mono text-sm"
          selected={selectedDate}
          onSelect={setSelectedDate}
          onDayClick={handleCalendarInput}
        />
      </div>
    </>
  )
}

export default DashboardPage
