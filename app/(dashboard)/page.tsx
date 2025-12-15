import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Building2, Clock, CheckCircle2 } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Statistiques de base
  const { count: totalEntreprises } = await supabase
    .from("entreprise")
    .select("*", { count: "exact", head: true });

  const { data: qualifications } = await supabase
    .from("qualification")
    .select("statut, prix_total");

  const stats = {
    nouveau: qualifications?.filter((q) => q.statut === "Nouveau").length || 0,
    bc_envoye: qualifications?.filter((q) => q.statut === "BC envoyé").length || 0,
    paye: qualifications?.filter((q) => q.statut === "Payé").length || 0,
  };

  const revenuTotal = qualifications
    ?.filter((q) => q.statut === "Payé")
    .reduce((acc, q) => acc + (Number(q.prix_total) || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Tableau de bord</h2>
        <p className="text-sm text-muted-foreground">Vue d'ensemble de votre activité</p>
      </div>

      {/* Grid responsive : 1 colonne mobile, 2 tablet, 4 desktop */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 0,
              }).format(revenuTotal)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.paye} qualification(s) payée(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entreprises</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEntreprises || 0}</div>
            <p className="text-xs text-muted-foreground">Total dans la base</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.nouveau}</div>
            <p className="text-xs text-muted-foreground">Nouvelles qualifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BC envoyés</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bc_envoye}</div>
            <p className="text-xs text-muted-foreground">En attente signature</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}