import { type NextPage } from "next";

//import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/clerk-react";
// import { Button } from "@/components/button";
import { Calendar } from "@/components/calendar";
import { ptBR } from "date-fns/locale";

const Home: NextPage = () => {

    return (
        <div className="max-w-none h-screen flex flex-col items-center justify-evenly md:flex-row md:justify-center">
            <div className="max-w-md p-10">
                <h1 className="text-6xl font-extrabold font-serif">Markei</h1>
                <h3 className="text-2xl font-bold font-sans">Agendamento descomplicado</h3>
                <p className="text-lg font-sans text-subPink opacity-70">
                    Conecte seu calendário e permita que as pessoas marquem agendamentos
                    no seu tempo livre.
                </p>
            </div>
            <Calendar mode="single" locale={ptBR} disableNavigation className="rounded-md border font-mono text-sm" />
        </div>
    );
};

export default Home;