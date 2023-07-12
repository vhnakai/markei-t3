import { type NextPage } from 'next'
import { SignOutButton, SignInButton, useUser } from '@clerk/clerk-react'
import { Calendar } from '@/components/ui/calendar'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const Home: NextPage = () => {
  const { isSignedIn } = useUser()

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

        {!isSignedIn && (
          <SignInButton redirectUrl="/dashboard" mode="modal">
            <Button variant={'outline'}>Inscrever-se</Button>
          </SignInButton>
        )}
        {!!isSignedIn && <SignOutButton>Sair</SignOutButton>}
        {!!isSignedIn && (
          <Button variant={'link'} asChild>
            <Link href={'/dashboard'}>Minha agenda</Link>
          </Button>
        )}
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
