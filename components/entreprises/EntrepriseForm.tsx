"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
    nom: z.string().min(2, {
        message: "Le nom doit contenir au moins 2 caractères.",
    }),
    email: z.string().email().optional().or(z.literal("")),
    telephone: z.string().optional(),
    adresse: z.string().optional(),
    ville: z.string().optional(),
    cp: z.string().optional(),
});

interface EntrepriseFormProps {
    initialData?: any;
}

export function EntrepriseForm({ initialData }: EntrepriseFormProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nom: initialData.nom || "",
            email: initialData.email || "",
            telephone: initialData.telephone || "",
            adresse: initialData.adresse || "",
            ville: initialData.ville || "",
            cp: initialData.cp || "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSaving(true);
        const supabase = createClient();

        try {
            if (initialData?.id) {
                const { error } = await supabase
                    .from("entreprise")
                    .update(values)
                    .eq("id", initialData.id);

                if (error) throw error;
                toast.success("Entreprise mise à jour");
            } else {
                const { error } = await supabase
                    .from("entreprise")
                    .insert([values]);

                if (error) throw error;
                toast.success("Entreprise créée");
                router.push("/entreprises");
            }

            router.refresh();
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="nom"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                                <Input placeholder="Nom de l'entreprise" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="contact@exemple.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="telephone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Téléphone</FormLabel>
                                <FormControl>
                                    <Input placeholder="06 12 34 56 78" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="adresse"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Adresse</FormLabel>
                            <FormControl>
                                <Input placeholder="123 Rue Principale" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="ville"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ville</FormLabel>
                                <FormControl>
                                    <Input placeholder="Paris" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="cp"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Code Postal</FormLabel>
                                <FormControl>
                                    <Input placeholder="75000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enregistrer
                    </Button>
                </div>
            </form>
        </Form>
    );
}
