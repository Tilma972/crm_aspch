"use client";

import Link from "next/link";

type Company = {
  id: string;
  name: string;
  city: string;
  phone: string;
  email: string;
  tags: string[];
};

const MOCK_COMPANIES: Company[] = [
  {
    id: "1",
    name: "Garage Martin",
    city: "Clermont-l'Hérault",
    phone: "0467000000",
    email: "contact@garagemartin.fr",
    tags: ["Garage", "Partenaire"],
  },
  {
    id: "2",
    name: "Boulangerie du Centre",
    city: "Canet",
    phone: "0467000001",
    email: "contact@boulangeriecentre.fr",
    tags: ["Commerce", "Calendriers"],
  },
];

export default function CompaniesPage() {
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

        {/* Barre de recherche simple (statique pour l'instant) */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Rechercher une entreprise…"
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Liste d'entreprises */}
        <section className="flex flex-col gap-3">
          {MOCK_COMPANIES.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.id}`}
              className="rounded-lg border bg-card px-4 py-3 shadow-sm active:scale-[0.99]"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold">{company.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {company.city}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  {company.tags[0] ?? "Partenaire"}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>{company.phone}</span>
                <span>•</span>
                <span>{company.email}</span>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
