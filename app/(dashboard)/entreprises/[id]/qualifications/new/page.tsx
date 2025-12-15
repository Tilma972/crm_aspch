import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QualificationForm } from "./components/qualification-form";

export default async function NewQualificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // ───────────────────────────────────────────────────────────
  // Vérifier que l'entreprise existe
  // ───────────────────────────────────────────────────────────

  const { data: entreprise, error } = await supabase
    .from("entreprise")
    .select("id, nom, baserow_id")
    .eq("id", id)
    .single();

  if (error || !entreprise) {
    notFound();
  }

  // ───────────────────────────────────────────────────────────
  // Détecter si l'entreprise est pompiers
  // TODO: Ajouter logique métier pour déterminer isPompiers
  // ───────────────────────────────────────────────────────────

  const isPompiers = false;

  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-background-main text-text-primary">
      {/* HEADER STICKY */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-surface-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-surface-card/60 border-b border-border-subtle">
        <Button variant="ghost" size="icon" asChild className="-ml-2 text-text-secondary hover:text-text-primary hover:bg-white/5">
          <Link href={`/entreprises/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>

        <h1 className="text-lg font-bold text-text-primary">Nouvelle Qualification</h1>

        {/* Spacer pour centrer le titre */}
        <div className="w-10"></div>
      </header>

      {/* FORMULAIRE */}
      <div className="px-4 py-6 pb-24 max-w-3xl mx-auto">
        <QualificationForm
          entrepriseId={id}
          entrepriseNom={entreprise.nom}
          isPompiers={isPompiers}
        />
      </div>
    </main>
  );
}
