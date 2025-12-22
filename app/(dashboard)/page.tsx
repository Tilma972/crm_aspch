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
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">Tableau de bord</h2>
        <p className="text-sm text-text-secondary">Vue d&apos;ensemble de votre activité</p>
      </div>

      {/* Grid responsive : 1 colonne mobile, 2 tablet, 4 desktop */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-primary">Revenu Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent-blue">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 0,
              }).format(revenuTotal)}
            </div>
            <p className="text-xs text-text-secondary">
              {stats.paye} qualification(s) payée(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-primary">Entreprises</CardTitle>
            <Building2 className="h-4 w-4 text-icon-neutral" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{totalEntreprises || 0}</div>
            <p className="text-xs text-text-secondary">Total dans la base</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-primary">En attente</CardTitle>
            <Clock className="h-4 w-4 text-status-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-warning">{stats.nouveau}</div>
            <p className="text-xs text-text-secondary">Nouvelles qualifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-primary">BC envoyés</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-status-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-success">{stats.bc_envoye}</div>
            <p className="text-xs text-text-secondary">En attente signature</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}