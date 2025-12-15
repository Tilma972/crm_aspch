import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Search, Mail, Phone, MapPin } from "lucide-react";

export default async function EntreprisesPage() {
  const supabase = await createClient();
  
  // Récupérer les entreprises avec leurs qualifications pour les statuts
  const { data: entreprises, error } = await supabase
    .from("entreprise")
    .select(`
      *,
      qualification (
        statut,
        date_creation
      )
    `)
    .order("nom");

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-status-error">Erreur lors du chargement des entreprises</p>
      </div>
    );
  }

  // Fonction pour déterminer le statut principal d'une entreprise
  const getEntrepriseStatus = (qualifications: { statut: string; date_creation: string }[]) => {
    if (!qualifications || qualifications.length === 0) {
      return { label: "Prospect", variant: "secondary" as const };
    }
    
    const hasNewQualifications = qualifications.some(q => q.statut === "Nouveau");
    const hasValidatedQualifications = qualifications.some(q => q.statut === "Payé");
    
    if (hasNewQualifications) {
      return { label: "À contacter", variant: "destructive" as const };
    }
    
    if (hasValidatedQualifications) {
      return { label: "Client", variant: "default" as const };
    }
    
    return { label: "Qualifié", variant: "secondary" as const };
  };

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Liste des Entreprises</h1>
        <Button asChild className="bg-accent-blue hover:bg-accent-blue/80">
          <Link href="/entreprises/nouvelle">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
        <Input
          placeholder="Rechercher nom, ville..."
          className="pl-10 bg-surface-card border-border-subtle text-text-primary placeholder:text-text-secondary"
        />
      </div>

      {/* Entreprises List */}
      <div className="space-y-3">
        {entreprises?.map((entreprise) => {
          const status = getEntrepriseStatus(entreprise.qualification);
          
          return (
            <Card key={entreprise.id} className="bg-surface-card border-border-subtle hover:bg-surface-card/80 transition-colors">
              <CardContent className="p-4">
                <Link href={`/entreprises/${entreprise.id}`} className="block">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-text-primary line-clamp-1">
                          {entreprise.nom}
                        </h3>
                        <Badge variant={status.variant} className="text-xs">
                          {status.label}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col gap-1 text-sm text-text-secondary">
                        {entreprise.adresse && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="line-clamp-1">{entreprise.adresse}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4">
                          {entreprise.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="line-clamp-1">{entreprise.email}</span>
                            </div>
                          )}
                          
                          {entreprise.telephone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 shrink-0" />
                              <span className="line-clamp-1">{entreprise.telephone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-text-secondary hover:text-text-primary"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-text-secondary hover:text-text-primary"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          );
        })}
        
        {(!entreprises || entreprises.length === 0) && (
          <Card className="bg-surface-card border-border-subtle">
            <CardContent className="p-8 text-center">
              <p className="text-text-secondary">Aucune entreprise trouvée</p>
              <Button asChild className="mt-4 bg-accent-blue hover:bg-accent-blue/80">
                <Link href="/entreprises/nouvelle">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer votre première entreprise
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
