import Link from "next/link";
import { createClient } from "@/supabase/server";
import { SearchInput } from "@/components/search-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Filter } from "lucide-react";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q || "";
  const supabase = await createClient();

  let request = supabase
    .from("entreprise")
    .select("*")
    .order("nom");

  if (query) {
    request = request.ilike("nom", `%${query}%`);
  }

  const { data: companies, error } = await request;

  if (error) {
    console.error("Error fetching companies:", error);
    return <div>Une erreur est survenue lors du chargement des entreprises.</div>;
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-4">
      <div className="mx-auto max-w-md flex flex-col gap-6">
        {/* Header */}
        <header className="flex items-center justify-center py-4">
          <h1 className="text-xl font-bold">Liste des Entreprises</h1>
        </header>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1">
            <SearchInput placeholder="Rechercher par nom, ville..." />
          </div>
          <Button variant="secondary" size="icon" className="shrink-0">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Liste d'entreprises */}
        <section className="flex flex-col gap-4">
          {companies?.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Aucune entreprise trouvée.
            </p>
          ) : (
            companies?.map((company) => (
              <Card key={company.id} className="bg-card border-border overflow-hidden">
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <Link href={`/companies/${company.id}`} className="block">
                      <CardTitle className="text-base font-semibold hover:underline decoration-primary underline-offset-4">
                        {company.nom}
                      </CardTitle>
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {company.adresse}, {company.ville}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] bg-blue-900/30 text-blue-400 hover:bg-blue-900/40 border-0">
                    Prospect
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex justify-end gap-2">
                  {company.email && (
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-md" asChild>
                      <a href={`mailto:${company.email}`}>
                        <Mail className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {company.telephone && (
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-md" asChild>
                      <a href={`tel:${company.telephone}`}>
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
