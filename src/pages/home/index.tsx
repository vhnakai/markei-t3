import { type NextPage } from 'next'
import { useRouter } from 'next/router'
import { SignInButton, useUser } from '@clerk/clerk-react'
import { Calendar } from '@/components/ui/calendar'
import { ptBR } from 'date-fns/locale'

const Home: NextPage = () => {
  const router = useRouter()

  const { isSignedIn } = useUser()

  if (isSignedIn) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    router.push('/dashboard')
  }

  return (
    <div className="flex h-screen max-w-none flex-col items-center justify-evenly md:flex-row md:justify-center">
      <div className="max-w-md p-10">
        <h1 className="font-serif text-6xl font-extrabold">Markei</h1>
        <h3 className="font-sans text-2xl font-bold">
          Agendamento descomplicado
        </h3>
        <p className="font-sans text-lg text-subPink opacity-70">
          Conecte seu calendário e permita que as pessoas marquem agendamentos
          no seu tempo livre.
        </p>

        {!isSignedIn && <SignInButton />}
      </div>
      <Calendar
        mode="single"
        locale={ptBR}
        disableNavigation
        className="rounded-2xl border font-mono text-sm"
      />
    </div>
  )
}

export default Home
