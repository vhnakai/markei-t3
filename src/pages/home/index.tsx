import { type NextPage } from "next";

//import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/clerk-react";
// import { Button } from "@/components/button";
import { Calendar } from "@/components/calendar";
import { ptBR } from "date-fns/locale";

const Home: NextPage = () => {

    return (
        <div className="max-w-none h-screen flex items-center justify-evenly ">
            <div className="max-w-md px-0 py-10 ">
                <h1 className="text-4xl font-serif">Agendamento descomplicado</h1>
                <p className="text-xl font-sans text-gray-500">
                    Conecte seu calendário e permita que as pessoas marquem agendamentos
                    no seu tempo livre.
                </p>
            </div>
            <Calendar mode="single" locale={ptBR} disableNavigation className="rounded-xl border delay-150" />
        </div>
    );
};

export default Home;