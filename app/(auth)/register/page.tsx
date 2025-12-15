import type { Metadata } from "next";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: "Inscription",
  description: "Créer un nouveau compte",
};

export default function SignupPage() {
  return (
    <div className="container flex h-screen w-screen mx-auto flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Créer un compte
          </h1>
          <p className="text-sm text-muted-foreground">
            Inscrivez-vous pour commencer
          </p>
        </div>
        <RegisterForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          En cliquant sur continuer, vous acceptez nos conditions de service et notre politique de confidentialité.
        </p>
      </div>
    </div>
  );
}
