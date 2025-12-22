import { createClient } from "@/lib/supabase/server";
import { QualificationList } from "./components/qualification-list";
import { Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function QualificationsPage() {
  const supabase = await createClient();

  // Fetch qualifications with entreprise details
  const { data: qualifications, error } = await supabase
    .from("qualification")
    .select(`
      *,
      entreprise (
        nom,
        ville
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching qualifications:", JSON.stringify(error, null, 2));
    return (
      <div className="p-4 text-center">
        <p className="text-status-error">Erreur lors du chargement des qualifications</p>
        <p className="text-xs text-text-secondary mt-2">{error.message || "Erreur inconnue"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-main flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-card/95 backdrop-blur supports-[backdrop-filter]:bg-surface-card/60 border-b border-border-subtle">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-text-primary">Qualifications</h1>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className="text-text-secondary hover:text-text-primary hover:bg-white/5">
              <Plus className="h-6 w-6" />
            </Button>
            <Button size="icon" variant="ghost" className="text-text-secondary hover:text-text-primary hover:bg-white/5">
              <Bell className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <QualificationList initialQualifications={qualifications || []} />
      </div>
    </div>
  );
}
