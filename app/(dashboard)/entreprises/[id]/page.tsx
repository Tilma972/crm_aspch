import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CompanyDetailContent } from "./company-detail-content";

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
    <CompanyDetailContent
      company={company}
      qualifications={qualifications || []}
    />
  );
}
