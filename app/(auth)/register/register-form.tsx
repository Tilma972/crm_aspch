"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signup } from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/ui/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const signupSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères" }),

  email: z.string().email({ message: "Email invalide" }),

  phone: z
    .string()
    .min(9, { message: "Le numéro de téléphone doit contenir au moins 9 caractères" }),

  password: z
    .string()
    .min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

export default function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    startTransition(async () => {
      const response = await signup(values);

      if (response.error) {
        toast.error(
          "Une erreur s'est produite. Veuillez réessayer plus tard."
        );
        return;
      }

      toast.success("Presque terminé ! Vérifiez votre boîte de réception pour le lien d'activation.");
      router.push("/");
    });
  }
  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="grid gap-6">
        <Button variant="outline" type="button" disabled={isPending}>
          <Icons.google className="mr-2 h-4 w-4" />
          S'inscrire avec Google
        </Button>
        <Separator />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Mon nom..."
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="exemple@mail.com"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+33123456789"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="mot de passe"
                        type="password"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button className="mt-8 w-full">
              {isPending ? (
                <div className="flex items-center justify-center gap-1">
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  <span>Création en cours...</span>
                </div>
              ) : (
                "Créer mon compte"
              )}
            </Button>
          </form>
        </Form>
      </div>
      <div className="text-center">
        <Link href="/login" className="w-full">
          <Button variant="outline" className="w-full">
            Retour à la connexion
          </Button>
        </Link>
      </div>
    </div>
  );
}
