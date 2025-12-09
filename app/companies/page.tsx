import Link from "next/link";
import { createClient } from "@/supabase/server";
import { SearchInput } from "@/components/search-input";

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
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-4">
        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Entreprises</h1>
          <Link
            href="/"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            Accueil
          </Link>
        </header>

        {/* Barre de recherche */}
        <div className="relative">
          <SearchInput placeholder="Rechercher une entreprise…" />
        </div>

        {/* Liste d'entreprises */}
        <section className="flex flex-col gap-3">
          {companies?.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Aucune entreprise trouvée.
            </p>
          ) : (
            companies?.map((company) => (
              <Link
                key={company.id}
                href={`/companies/${company.id}`}
                className="rounded-lg border bg-card px-4 py-3 shadow-sm active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold">{company.nom}</h2>
                    <p className="text-xs text-muted-foreground">
                      {company.ville}
                    </p>
                  </div>
                  {company.qualification_status && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {company.qualification_status}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {company.telephone && <span>{company.telephone}</span>}
                  {company.telephone && company.email && <span>•</span>}
                  {company.email && <span>{company.email}</span>}
                </div>
              </Link>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
