import { createClient } from "@/lib/supabase/server";
import { EntrepriseTable } from "@/components/entreprises/EntrepriseTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function EntreprisesPage() {
  const supabase = await createClient();
  const { data: entreprises, error } = await supabase
    .from("entreprise")
    .select("*")
    .order("nom");

  if (error) {
    return <div>Erreur lors du chargement des entreprises</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Entreprises</h2>
        <Button asChild>
          <Link href="/entreprises/nouvelle">
            <Plus className="mr-2 h-4 w-4" /> Nouvelle Entreprise
          </Link>
        </Button>
      </div>
      <EntrepriseTable data={entreprises || []} />
    </div>
  );
}
