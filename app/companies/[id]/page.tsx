"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Company = {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  notes: string;
  tags: string[];
};

const MOCK_COMPANIES: Company[] = [
  {
    id: "1",
    name: "Garage Martin",
    city: "Clermont-l'Hérault",
    address: "12 Avenue de la République",
    phone: "0467000000",
    email: "contact@garagemartin.fr",
    notes: "Bon contact, soutient les calendriers chaque année.",
    tags: ["Garage", "Partenaire"],
  },
  {
    id: "2",
    name: "Boulangerie du Centre",
    city: "Canet",
    address: "5 Rue de la Liberté",
    phone: "0467000001",
    email: "contact@boulangeriecentre.fr",
    notes: "Préférer le passage le matin avant 10h.",
    tags: ["Commerce", "Calendriers"],
  },
];

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const company = MOCK_COMPANIES.find((c) => c.id === id);

  if (!company) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-4">
          <header className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="rounded-full border px-3 py-1 text-xs"
            >
              Retour
            </button>
            <h1 className="text-lg font-semibold">Entreprise introuvable</h1>
          </header>
          <p className="text-sm text-muted-foreground">
            Aucune fiche ne correspond à cet identifiant.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-4">
        {/* Header + retour */}
        <header className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="rounded-full border px-3 py-1 text-xs"
          >
            Retour
          </button>
          <span className="text-xs text-muted-foreground">
            {company.city}
          </span>
        </header>

        {/* Bloc principal */}
        <section className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-lg font-semibold">{company.name}</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                {company.address}
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-1">
              {company.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Actions principales */}
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`tel:${company.phone}`}
              className="flex-1 rounded-lg bg-primary px-3 py-2 text-center text-xs font-medium text-primary-foreground"
            >
              Appeler
            </a>
            <a
              href={`mailto:${company.email}`}
              className="flex-1 rounded-lg border px-3 py-2 text-center text-xs font-medium"
            >
              Email
            </a>
          </div>
        </section>

        {/* Coordonnées détaillées */}
        <section className="rounded-xl border bg-card p-4 text-sm">
          <h2 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            Coordonnées
          </h2>
          <div className="space-y-1">
            <p>
              <span className="font-medium">Téléphone :</span>{" "}
              <a href={`tel:${company.phone}`} className="underline">
                {company.phone}
              </a>
            </p>
            <p>
              <span className="font-medium">Email :</span>{" "}
              <a href={`mailto:${company.email}`} className="underline">
                {company.email}
              </a>
            </p>
            <p>
              <span className="font-medium">Adresse :</span> {company.address},{" "}
              {company.city}
            </p>
          </div>
        </section>

        {/* Notes / commentaires */}
        <section className="rounded-xl border bg-card p-4 text-sm">
          <h2 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            Notes
          </h2>
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {company.notes}
          </p>
        </section>

        {/* Lien retour liste */}
        <footer className="mt-2 flex justify-center">
          <Link
            href="/companies"
            className="text-xs text-muted-foreground underline underline-offset-4"
          >
            Revenir à la liste
          </Link>
        </footer>
      </div>
    </main>
  );
}
