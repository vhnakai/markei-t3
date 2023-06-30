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

const Schedule: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({ username })
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>()
  const [openFormModal, setOpenFormModal] = useState(false)

  if (!data) return <div> 404</div>

  const { data: availability } = api.availability.available.useQuery({
    date: selectedDate || new Date(),
    username,
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

  return (
    <>
      <NextSeo title={`Agendar com ${username}`} />
      <main className="overflow-none flex h-screen justify-center">
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 md:max-w-2xl">
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
              onSelect={(date) => {
                setSelectedDate(date)
                // handleCalendarInput(date)
              }}
              disabled={{ before: new Date() }}
            />

            {isDateSelected && (
              <div className="h-72 w-72 overflow-auto border-2 border-solid px-6 pb-0 pt-6 lg:w-auto">
                <div className="mt-3 grid grid-cols-1 gap-2 max-lg:grid-cols-2">
                  {availability?.possibleTimes.map((hour) => {
                    return (
                      <Button
                        variant={'outline'}
                        key={hour}
                        onClick={() => handleSelectTime(hour)}
                        disabled={availability.availableTimes.includes(hour)}
                      >
                        {String(hour).padStart(2, '0')}:00h
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            {selectedDateTime && (
              <Dialog open={openFormModal} onOpenChange={setOpenFormModal}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Falta mais um pouco</DialogTitle>
                    <DialogDescription>
                      Preencha essas informações para agendar
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value="Pedro Duarte"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="username" className="text-right">
                        Username
                      </Label>
                      <Input
                        id="username"
                        value="@peduarte"
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save changes</Button>
                  </DialogFooter>
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
    revalidate: 60 * 60 * 24, // 1 day
  }
}

export default Schedule
