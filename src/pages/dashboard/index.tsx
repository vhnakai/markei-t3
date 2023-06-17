/**
 * TO-DO 
 * - listagem de agenda baseado no user_id ok
 * - handle para redirecionar para pagina de agendamento
 * 
 * */

import { Calendar } from "@/components/calendar"
import { api } from "@/utils/api"
import { useUser } from "@clerk/nextjs"
import { ptBR } from "date-fns/locale"
import dayjs from "dayjs"
import { NextPage } from "next"
import Head from "next/head"
import { useState } from "react"

const AppointmentList = (props: { userId: string }) => {

    const { data: appointments } = api.schedure.appointments.useQuery({ user_uuid: props.userId })

    if (!appointments) return <h1>No apppointment was found</h1>

    return (
        <div className="flex flex-col">
            {
                appointments.map(appointment => (
                    <div key={appointment.name} className="rounded-lg p-3 mt-2 border-border border-4">
                        <span className="text-md">
                            {appointment.name} - {dayjs(appointment.date).format("DD/MM/YYYY")} -  {appointment.observations}
                        </span>
                    </div>
                ))
            }
        </div>
    )
}

function handleCalendarInput(selectedDate: Date) {
    const dateWithTime = dayjs(selectedDate)
        .toDate()

    console.log(dateWithTime)
}

const DashboardPage: NextPage = () => {

    const [selectedDate, setSelectedDate] = useState<Date>()


    const { user } = useUser()
    if (!user) return <div>404</div>;

    return (
        <>
            <Head>
                <title>{user.username ?? user.firstName}</title>
            </Head>
            <div className="max-w-full flex items-center justify-center ">

                <AppointmentList userId={user.id} />

                <Calendar
                    mode="single"
                    locale={ptBR}
                    className="rounded-md border-1 font-mono text-sm"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    onDayClick={handleCalendarInput}
                />

            </div>
        </>
    );
}

export default DashboardPage