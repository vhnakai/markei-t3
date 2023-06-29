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
import { SignOutButton, useUser } from '@clerk/nextjs'

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

// import { useRouter } from 'next/router'
import { useToast } from '@/components/ui/use-toast'

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
          Seus agendamentos marcados para hoje (
          {dayjs(date).format('DD/MM/YYYY')} )
        </TableCaption>
      ) : (
        <TableCaption>
          Não há agendament para hoje {dayjs(date).format('DD/MM/YYYY')} )
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
            <TableCell className="text-right">Botao</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const DashboardPage: NextPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const { toast } = useToast()

  // const router = useRouter()

  const { user } = useUser()
  if (!user) return null

  const handleCalendarInput = (selectedDate: Date | undefined) => {
    const dateWithTime = dayjs(selectedDate).format('DD/MM/YY')

    toast({
      title: 'A sua agenda foi filtrada para o dia:',
      description: dateWithTime,
    })
    /**
     * Filtrar a lista de agendamentos para a data selecionada
     */
  }

  return (
    <>
      <Head>
        <title>{user.username ?? user.firstName}</title>
      </Head>
      <div className="flex max-w-full items-center justify-around p-3">
        <AppointmentTable userId={user.id} date={selectedDate} />
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
      </div>
      <SignOutButton />
    </>
  )
}

export default DashboardPage
