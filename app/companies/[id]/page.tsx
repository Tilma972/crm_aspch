import Link from "next/link";
import { createClient } from "@/supabase/server";
import { notFound } from "next/navigation";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch entreprise
  const { data: company, error: companyError } = await supabase
    .from("entreprise")
    .select("*")
    .eq("id", id)
    .single();

  if (companyError || !company) {
    notFound();
  }

  // Fetch qualifications
  const { data: qualifications } = await supabase
    .from("qualification")
    .select("*")
    .eq("entreprise_id", id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-4">
        {/* Header + retour */}
        <header className="flex items-center justify-between">
          <Link
            href="/companies"
            className="rounded-full border px-3 py-1 text-xs hover:bg-muted"
          >
            Retour
          </Link>
          <span className="text-xs text-muted-foreground">
            {company.ville}
          </span>
        </header>

        {/* Bloc principal */}
        <section className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-lg font-semibold">{company.nom}</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                {company.adresse}
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-1">
              {/* Tags based on qualifications? */}
              {qualifications?.map(q => (
                <span key={q.id} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  {q.statut}
                </span>
              ))}
            </div>
          </div>

          {/* Actions principales */}
          <div className="mt-4 flex flex-wrap gap-2">
            {company.telephone && (
              <a
                href={`tel:${company.telephone}`}
                className="flex-1 rounded-lg bg-primary px-3 py-2 text-center text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Appeler
              </a>
            )}
            {company.email && (
              <a
                href={`mailto:${company.email}`}
                className="flex-1 rounded-lg border px-3 py-2 text-center text-xs font-medium hover:bg-muted"
              >
                Email
              </a>
            )}
          </div>
        </section>

        {/* Coordonnées détaillées */}
        <section className="rounded-xl border bg-card p-4 text-sm">
          <h2 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            Coordonnées
          </h2>
          <div className="space-y-1">
            {company.telephone && (
              <p>
                <span className="font-medium">Téléphone :</span>{" "}
                <a href={`tel:${company.telephone}`} className="underline">
                  {company.telephone}
                </a>
              </p>
            )}
            {company.email && (
              <p>
                <span className="font-medium">Email :</span>{" "}
                <a href={`mailto:${company.email}`} className="underline">
                  {company.email}
                </a>
              </p>
            )}
            {company.adresse && (
              <p>
                <span className="font-medium">Adresse :</span> {company.adresse},{" "}
                {company.ville}
              </p>
            )}
          </div>
        </section>

        {/* Qualifications / Historique */}
        {qualifications && qualifications.length > 0 && (
          <section className="rounded-xl border bg-card p-4 text-sm">
            <h2 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Qualifications 2026
            </h2>
            <div className="space-y-4">
              {qualifications.map((qual) => (
                <div key={qual.id} className="border-b pb-2 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{qual.format_encart || "Format inconnu"}</p>
                      <p className="text-xs text-muted-foreground">
                        Parution : {qual.mois_parution || "Non défini"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{qual.prix_total ? `${qual.prix_total}€` : "-"}</p>
                      <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                        {qual.statut}
                      </span>
                    </div>
                  </div>
                  {qual.commentaires && (
                    <p className="mt-2 text-xs text-muted-foreground italic">
                      "{qual.commentaires}"
                    </p>
                  )}
                  {qual.date_contact && (
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Contacté le : {qual.date_contact}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

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
