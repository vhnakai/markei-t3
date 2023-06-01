import { type NextPage } from "next";

//import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/clerk-react";
// import { Button } from "@/components/button";
// import { Calendar } from "@/components/calendar";

const Home: NextPage = () => {

  return (
    <div className="max-w-screen-lg ml-auto h-full flex items-center gap-20">
      <main className="max-w-md px-0 py-10">
        <h1 className="text-4xl ">Agendamento descomplicado</h1>
        <div className="text-xl text-gray-500">
            Conecte seu calendário e permita que as pessoas marquem agendamentos
          no seu tempo livre.
        </div>
      </main>
    </div>
  );
};

export default Home;