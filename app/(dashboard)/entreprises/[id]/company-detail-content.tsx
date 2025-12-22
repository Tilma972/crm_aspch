'use client';

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, FileText, Receipt, Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EntrepriseForm } from "@/components/entreprises/EntrepriseForm";
import { FactureModal } from "@/components/entreprises/FactureModal";
import { useToast } from "@/hooks/use-toast";

interface Company {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  email?: string;
  telephone?: string;
  cp?: string;
}

interface Qualification {
  id: string;
  format_encart: string;
  mois_parution: string;
  prix_total: number;
  statut: string;
  created_at: string;
}

interface CompanyDetailContentProps {
  company: Company;
  qualifications: Qualification[];
}

export function CompanyDetailContent({ company, qualifications }: CompanyDetailContentProps) {
  const [factureModalOpen, setFactureModalOpen] = useState(false);
  const [selectedQualificationId, setSelectedQualificationId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFactureClick = () => {
    if (qualifications.length === 0) {
      toast({
        title: "Aucune qualification",
        description: "Veuillez créer une qualification avant de générer une facture.",
        variant: "destructive",
      });
      return;
    }
    
    // Sélectionner la première qualification (plus récente)
    setSelectedQualificationId(qualifications[0].id);
    setFactureModalOpen(true);
  };

  const handleFactureSuccess = () => {
    toast({
      title: "Succès !",
      description: "La facture a été générée avec succès.",
    });
    // Optionnel : rafraîchir les données
    // window.location.reload();
  };

  return (
    <main className="min-h-screen bg-background-main text-text-primary flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-card/95 backdrop-blur supports-[backdrop-filter]:bg-surface-card/60 border-b border-border-subtle">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" asChild className="-ml-2 text-text-secondary hover:text-text-primary hover:bg-white/5">
            <Link href="/entreprises">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold text-text-primary">Fiche Entreprise</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-32 md:pb-24">
        <div className="p-4 space-y-6">
          {/* Company Profile Header */}
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 rounded-xl border border-border-subtle">
              <AvatarImage src={`https://avatar.vercel.sh/${company.nom}.png`} alt={company.nom} />
              <AvatarFallback className="rounded-xl text-lg bg-surface-card text-text-secondary">{company.nom.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              <h2 className="text-xl font-bold leading-tight text-text-primary">{company.nom}</h2>
              <p className="text-sm text-text-secondary flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {company.adresse}, {company.ville}
              </p>
              <div className="flex gap-2 pt-1">
                <Badge variant="secondary" className="bg-accent-blue/20 text-accent-blue border-0 hover:bg-accent-blue/30">Prospect</Badge>
                <Badge variant="outline" className="border-status-warning/50 text-status-warning hover:bg-status-warning/10">A relancer</Badge>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="infos" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-surface-card border border-border-subtle">
              <TabsTrigger value="infos" className="data-[state=active]:bg-accent-blue data-[state=active]:text-white">Infos & Contact</TabsTrigger>
              <TabsTrigger value="docs" className="data-[state=active]:bg-accent-blue data-[state=active]:text-white">Qualifications & Docs</TabsTrigger>
            </TabsList>

            <TabsContent value="infos" className="space-y-4 mt-4">
              <Card className="bg-surface-card border-border-subtle">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-text-secondary">Informations</CardTitle>
                </CardHeader>
                <CardContent>
                  <EntrepriseForm initialData={company as unknown as Record<string, unknown>} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="docs" className="space-y-4 mt-4">
              {qualifications && qualifications.length > 0 ? (
                qualifications.map((qual) => (
                  <Link href={`/entreprises/${company.id}/qualifications/${qual.id}`} key={qual.id} className="block">
                    <Card className="bg-surface-card border-border-subtle hover:border-accent-blue transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-text-primary">Qualification 2026</p>
                            <p className="text-sm text-text-secondary">{qual.format_encart} - {qual.mois_parution}</p>
                          </div>
                          <Badge variant="outline" className="border-border-subtle text-text-secondary">{qual.statut}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-4">
                          <span className="font-medium text-accent-blue">{qual.prix_total}€</span>
                          <span className="text-text-secondary text-xs">{new Date(qual.created_at).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-text-secondary text-sm">
                  Aucune qualification pour le moment.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Sticky Footer Actions */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-surface-card border-t border-border-subtle z-40">
        <div className="max-w-md mx-auto flex flex-col gap-3">
          <Button asChild className="w-full bg-accent-blue hover:bg-accent-blue/90 text-white font-semibold h-12 text-base">
            <Link href={`/entreprises/${company.id}/qualifications/new`}>
              <Plus className="mr-2 h-5 w-5" /> Créer une qualification
            </Link>
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" className="w-full bg-background-main text-text-primary hover:bg-white/5 border border-border-subtle">
              <FileText className="mr-2 h-4 w-4" /> Bon de commande
            </Button>
            <Button 
              onClick={handleFactureClick}
              variant="secondary" 
              className="w-full bg-background-main text-text-primary hover:bg-white/5 border border-border-subtle"
            >
              <Receipt className="mr-2 h-4 w-4" /> Facture
            </Button>
          </div>
        </div>
      </div>

      {/* Facture Modal */}
      {selectedQualificationId && (
        <FactureModal
          open={factureModalOpen}
          onOpenChange={setFactureModalOpen}
          qualificationId={selectedQualificationId}
          onSuccess={handleFactureSuccess}
        />
      )}
    </main>
  );
}
