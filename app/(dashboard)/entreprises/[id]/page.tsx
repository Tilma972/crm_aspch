import Link from "next/link";
import { createClient } from "@/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, FileText, Receipt, Plus, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EntrepriseForm } from "@/components/entreprises/EntrepriseForm";

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
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" asChild className="-ml-2">
            <Link href="/companies">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Fiche Entreprise</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-6">
          {/* Company Profile Header */}
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 rounded-xl border">
              <AvatarImage src={`https://avatar.vercel.sh/${company.nom}.png`} alt={company.nom} />
              <AvatarFallback className="rounded-xl text-lg bg-muted">{company.nom.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              <h2 className="text-xl font-bold leading-tight">{company.nom}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {company.adresse}, {company.ville}
              </p>
              <div className="flex gap-2 pt-1">
                <Badge variant="secondary" className="bg-blue-900/30 text-blue-400 border-0">Prospect</Badge>
                <Badge variant="outline" className="border-orange-500/50 text-orange-500">A relancer</Badge>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="infos" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="infos">Infos & Contact</TabsTrigger>
              <TabsTrigger value="docs">Qualifications & Docs</TabsTrigger>
            </TabsList>

            <TabsContent value="infos" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Informations</CardTitle>
                </CardHeader>
                <CardContent>
                  <EntrepriseForm initialData={company} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="docs" className="space-y-4 mt-4">
              {qualifications && qualifications.length > 0 ? (
                qualifications.map((qual) => (
                  <Card key={qual.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">Qualification 2026</p>
                          <p className="text-sm text-muted-foreground">{qual.format_encart} - {qual.mois_parution}</p>
                        </div>
                        <Badge variant="outline">{qual.statut}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-4">
                        <span className="font-medium">{qual.prix_total}€</span>
                        <span className="text-muted-foreground text-xs">{new Date(qual.created_at).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Aucune qualification pour le moment.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Sticky Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-20">
        <div className="max-w-md mx-auto flex flex-col gap-3">
          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 text-base">
            <Link href={`/entreprises/${id}/qualifications/new`}>
              <Plus className="mr-2 h-5 w-5" /> Créer une qualification
            </Link>
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" className="w-full">
              <FileText className="mr-2 h-4 w-4" /> Bon de commande
            </Button>
            <Button variant="secondary" className="w-full">
              <Receipt className="mr-2 h-4 w-4" /> Facture
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
