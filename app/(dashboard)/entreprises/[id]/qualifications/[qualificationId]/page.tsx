import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QualificationEditForm } from "./components/qualification-edit-form";

export default async function EditQualificationPage({
  params,
}: {
  params: Promise<{ id: string; qualificationId: string }>;
}) {
  const { id, qualificationId } = await params;
  const supabase = await createClient();

  // ───────────────────────────────────────────────────────────
  // Récupérer la qualification et l'entreprise
  // ───────────────────────────────────────────────────────────

  const { data: qualification, error } = await supabase
    .from("qualification")
    .select(`
      *,
      entreprise:entreprise_id (
        id,
        nom
      )
    `)
    .eq("id", qualificationId)
    .eq("entreprise_id", id)
    .single();

  if (error || !qualification) {
    notFound();
  }

  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-background-main text-text-primary">
      {/* HEADER STICKY */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-surface-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-surface-card/60 border-b border-border-subtle">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="-ml-2 text-text-secondary hover:text-text-primary hover:bg-white/5">
            <Link href={`/entreprises/${id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-text-primary">
              Édition Qualification
            </h1>
            <p className="text-xs text-text-secondary">
              {qualification.entreprise.nom}
            </p>
          </div>
        </div>
      </header>

      <div className="container max-w-3xl mx-auto p-4 pb-32">
        <QualificationEditForm 
          qualification={qualification} 
          entrepriseId={id}
        />
      </div>
    </main>
  );
}
