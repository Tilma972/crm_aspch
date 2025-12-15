import { createClient } from "@/supabase/server";
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
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER STICKY */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between bg-slate-950/80 px-4 backdrop-blur-sm border-b border-slate-700">
        <Button variant="ghost" size="icon" asChild className="-ml-2">
          <Link href={`/entreprises/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>

        <h1 className="text-lg font-bold">Nouvelle Qualification</h1>

        {/* Spacer pour centrer le titre */}
        <div className="w-10"></div>
      </header>

      {/* FORMULAIRE */}
      <div className="px-4 py-6 pb-24">
        <QualificationForm
          entrepriseId={id}
          entrepriseNom={entreprise.nom}
          isPompiers={isPompiers}
        />
      </div>
    </main>
  );
}
