import type { Metadata } from "next";
import LoginForm from "./login-form";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte",
};

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen mx-auto flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Bienvenue !
          </h1>
          <p className="text-sm text-muted-foreground">
            Entrez votre email pour vous connecter à votre compte
          </p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
