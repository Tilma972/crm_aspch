"use client";

// ═══════════════════════════════════════════════════════════
// 📝 FORMULAIRE ÉDITION QUALIFICATION
// ═══════════════════════════════════════════════════════════

import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FileText, Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { 
  FORMATS_ASPCH, 
  MOIS_CALENDRIER, 
  MODES_PAIEMENT,
  calculerPrixTotal,
  formatPrix,
  type FormatEncart,
  type MoisCalendrier
} from "@/lib/constants/pricing";
import { 
  createQualificationSchema, 
  type CreateQualificationInput,
  genererEcheancier
} from "@/lib/schemas/qualification";
import { updateQualification } from "../actions";

// Type partiel pour la qualification venant de Supabase
interface QualificationData {
  id: string;
  format_encart: FormatEncart;
  mois_parution: string;
  prix_total: number;
  statut: "Nouveau" | "Qualifié" | "BC envoyé" | "Payé" | "Terminé" | "Annulé";
  remise_pourcentage: number;
  paiement_echelonne: boolean;
  echeances: { date: string; montant: number }[];
  mode_paiement: string | null;
  date_contact: string | null;
  commentaires: string | null;
}

interface QualificationEditFormProps {
  qualification: QualificationData;
  entrepriseId: string;
}

export function QualificationEditForm({
  qualification,
  entrepriseId,
}: QualificationEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showEcheancier, setShowEcheancier] = useState(!!qualification.paiement_echelonne);

  // ───────────────────────────────────────────────────────────
  // Parsing initial des données
  // ───────────────────────────────────────────────────────────
  
  // Reconstitution du tableau des mois
  const getInitialMois = (moisStr: string): string[] => {
    if (!moisStr) return [];
    if (moisStr === 'Janvier à Décembre') return [...MOIS_CALENDRIER];
    return moisStr.split(', ').map(m => m.trim());
  };

  // Heuristique pour détecter si c'est un tarif pompier
  const isPompiersInitial = qualification.remise_pourcentage === 70;

  const form = useForm<CreateQualificationInput>({
    resolver: zodResolver(createQualificationSchema),
    defaultValues: {
      format_encart: qualification.format_encart,
      mois_parution: getInitialMois(qualification.mois_parution) as MoisCalendrier[],
      prix_total: qualification.prix_total,
      statut: qualification.statut,
      is_pompiers: isPompiersInitial,
      remise_pourcentage: qualification.remise_pourcentage || 0,
      paiement_echelonne: qualification.paiement_echelonne,
      echeances: qualification.echeances || undefined,
      mode_paiement: (qualification.mode_paiement as "Chèque" | "Virement" | "CB" | "Espèces") || undefined,
      date_contact: qualification.date_contact || undefined,
      commentaires: qualification.commentaires || "",
    },
  });

  const watchFormat = form.watch("format_encart");
  const watchMois = form.watch("mois_parution");
  const watchRemise = form.watch("remise_pourcentage") || 0;
  const watchIsPompiers = form.watch("is_pompiers");

  // ───────────────────────────────────────────────────────────
  // Logique de calcul (identique au create form)
  // ───────────────────────────────────────────────────────────

  const calculerPrix = useCallback(() => {
    if (!watchFormat || watchMois.length === 0) return 0;

    return calculerPrixTotal({
      format: watchFormat,
      nombreMois: watchMois.length,
      remisePourcentage: watchRemise || 0,
      isPompiers: watchIsPompiers,
    });
  }, [watchFormat, watchMois, watchRemise, watchIsPompiers]);

  // Recalculer le prix si les paramètres changent
  // Note: On ne le fait que si l'utilisateur modifie le formulaire
  // Pour éviter d'écraser le prix stocké au chargement si la logique de calcul a changé
  useEffect(() => {
    if (form.formState.isDirty) {
      const prixCalcule = calculerPrix();
      if (prixCalcule !== form.getValues("prix_total")) {
        form.setValue("prix_total", prixCalcule);
      }
    }
  }, [calculerPrix, form]);

  // Gestion mois de parution
  const toggleMois = (mois: typeof MOIS_CALENDRIER[number]) => {
    const current = form.getValues("mois_parution");
    const updated = current.includes(mois)
      ? current.filter((m) => m !== mois)
      : [...current, mois];

    form.setValue("mois_parution", updated, { shouldDirty: true });
  };

  const selectionnerTousMois = () => {
    form.setValue("mois_parution", [...MOIS_CALENDRIER], { shouldDirty: true });
  };

  const deselectionnerTousMois = () => {
    form.setValue("mois_parution", [], { shouldDirty: true });
  };

  // Génération écheancier
  const genererEcheancierAuto = (nombreEcheances: number) => {
    const prix = form.getValues("prix_total");
    const echeances = genererEcheancier(prix, nombreEcheances);
    form.setValue("echeances", echeances, { shouldDirty: true });
    setShowEcheancier(true);
  };

  // ───────────────────────────────────────────────────────────
  // Soumission
  // ───────────────────────────────────────────────────────────

  const onSubmit = (values: CreateQualificationInput) => {
    startTransition(async () => {
      const result = await updateQualification(qualification.id, entrepriseId, values);

      if (result.success) {
        toast.success("✅ Qualification mise à jour !");
        router.refresh();
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    });
  };

  // ───────────────────────────────────────────────────────────
  // Actions Documentaires (Placeholders)
  // ───────────────────────────────────────────────────────────
  
  const handleGenerateBC = () => {
    toast.info("🚀 Génération du Bon de Commande via n8n... (Bientôt disponible)");
    // TODO: Call n8n webhook
  };

  const handleGenerateFacture = () => {
    toast.info("🚀 Génération de la Facture via n8n... (Bientôt disponible)");
    // TODO: Call n8n webhook
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        
        {/* BARRE D'ACTIONS RAPIDES (DOCUMENTS) */}
        <Card className="bg-surface-card border-border-subtle">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-secondary uppercase tracking-wider">
              Actions Documentaires
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="bg-background-main border-border-subtle hover:bg-white/5 text-text-primary"
              onClick={handleGenerateBC}
            >
              <FileText className="mr-2 h-4 w-4 text-accent-blue" />
              Générer Bon de Commande
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="bg-background-main border-border-subtle hover:bg-white/5 text-text-primary"
              onClick={handleGenerateFacture}
            >
              <Receipt className="mr-2 h-4 w-4 text-status-success" />
              Générer Facture
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLONNE GAUCHE : PARAMÈTRES COMMERCIAUX */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* STATUT */}
            <Card className="bg-surface-card border-border-subtle">
              <CardContent className="p-4">
                <FormField
                  control={form.control}
                  name="statut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-text-secondary">Statut de la qualification</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background-main border-border-subtle text-text-primary">
                            <SelectValue placeholder="Sélectionner un statut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-surface-card border-border-subtle text-text-primary">
                          <SelectItem value="Nouveau">Nouveau</SelectItem>
                          <SelectItem value="Qualifié">Qualifié</SelectItem>
                          <SelectItem value="BC envoyé">BC envoyé</SelectItem>
                          <SelectItem value="Payé">Payé</SelectItem>
                          <SelectItem value="Terminé">Terminé</SelectItem>
                          <SelectItem value="Annulé">Annulé</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* FORMAT */}
            <FormField
              control={form.control}
              name="format_encart"
              render={({ field }) => (
                <FormItem>
                  <Card className="bg-surface-card border-border-subtle">
                    <CardContent className="p-4">
                      <FormLabel className="text-sm font-medium text-text-secondary">
                        Format de l&apos;encart
                      </FormLabel>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(FORMATS_ASPCH).map(([key, config]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => field.onChange(key as FormatEncart)}
                            className={cn(
                              "p-3 rounded-lg border-2 text-left transition-all",
                              field.value === key
                                ? "border-accent-blue bg-accent-blue/10"
                                : "border-border-subtle bg-background-main hover:border-text-secondary"
                            )}
                          >
                            <p className="text-sm font-medium text-text-primary">{config.label}</p>
                            <p className="text-xs text-text-secondary mt-1">{config.description}</p>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </FormItem>
              )}
            />

            {/* MOIS DE PARUTION */}
            <FormField
              control={form.control}
              name="mois_parution"
              render={() => (
                <FormItem>
                  <Card className="bg-surface-card border-border-subtle">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <FormLabel className="text-sm font-medium text-text-secondary">
                          Mois de parution
                        </FormLabel>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={selectionnerTousMois}
                            className="text-xs px-2 py-1 rounded bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30"
                          >
                            Tous
                          </button>
                          <button
                            type="button"
                            onClick={deselectionnerTousMois}
                            className="text-xs px-2 py-1 rounded bg-background-main text-text-secondary hover:bg-white/5 border border-border-subtle"
                          >
                            Aucun
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {MOIS_CALENDRIER.map((mois) => (
                          <button
                            key={mois}
                            type="button"
                            onClick={() => toggleMois(mois)}
                            className={cn(
                              "p-2 rounded text-sm font-medium transition-all",
                              watchMois.includes(mois)
                                ? "bg-accent-blue text-white"
                                : "bg-background-main text-text-secondary hover:bg-white/5 border border-border-subtle"
                            )}
                          >
                            {mois.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </FormItem>
              )}
            />

            {/* COMMENTAIRES */}
            <FormField
              control={form.control}
              name="commentaires"
              render={({ field }) => (
                <FormItem>
                  <Card className="bg-surface-card border-border-subtle">
                    <CardContent className="p-4">
                      <FormLabel className="text-sm font-medium text-text-secondary">
                        Commentaires
                      </FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          rows={4}
                          className="mt-2 w-full rounded-lg border border-border-subtle bg-background-main px-3 py-2 text-text-primary resize-none focus:border-accent-blue focus:ring-accent-blue"
                        />
                      </FormControl>
                    </CardContent>
                  </Card>
                </FormItem>
              )}
            />
          </div>

          {/* COLONNE DROITE : PRIX & PAIEMENT */}
          <div className="space-y-6">
            
            {/* PRIX TOTAL */}
            <Card className="bg-surface-card border-border-subtle sticky top-20">
              <CardContent className="p-4 space-y-4">
                <div>
                  <p className="text-sm text-text-secondary">Prix total</p>
                  <p className="text-3xl font-bold text-accent-blue">
                    {formatPrix(form.getValues("prix_total"))}
                  </p>
                </div>

                <Separator className="bg-border-subtle" />

                {/* TARIFS SPÉCIAUX */}
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="is_pompiers"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-border-subtle bg-background-main"
                          />
                          <label className="text-sm text-text-primary cursor-pointer">
                            🚒 Sapeur-Pompier (-70%)
                          </label>
                        </div>
                      </FormItem>
                    )}
                  />

                  {!watchIsPompiers && (
                    <FormField
                      control={form.control}
                      name="remise_pourcentage"
                      render={({ field }) => (
                        <FormItem>
                          <label className="text-xs text-text-secondary">Remise (%)</label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="h-8 bg-background-main border-border-subtle text-text-primary"
                          />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <Separator className="bg-border-subtle" />

                {/* PAIEMENT ÉCHELONNÉ */}
                <FormField
                  control={form.control}
                  name="paiement_echelonne"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.checked);
                            setShowEcheancier(e.target.checked);
                          }}
                          className="h-4 w-4 rounded border-border-subtle bg-background-main"
                        />
                        <FormLabel className="text-sm text-text-primary cursor-pointer">
                          Paiement échelonné
                        </FormLabel>
                      </div>

                      {field.value && (
                        <div className="flex gap-1 flex-wrap">
                          {[2, 3, 4, 6].map((nombre) => (
                            <button
                              key={nombre}
                              type="button"
                              onClick={() => genererEcheancierAuto(nombre)}
                              className="px-2 py-1 rounded text-xs bg-background-main hover:bg-white/5 text-text-secondary border border-border-subtle"
                            >
                              {nombre}x
                            </button>
                          ))}
                        </div>
                      )}

                      {showEcheancier && form.watch("echeances") && (
                        <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
                          {form.watch("echeances")?.map((echeance, index) => (
                            <div key={index} className="flex justify-between p-1.5 rounded bg-background-main text-xs border border-border-subtle">
                              <span className="text-text-secondary">Éch. {index + 1}</span>
                              <span className="text-text-primary font-medium">{formatPrix(echeance.montant)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <Separator className="bg-border-subtle" />

                {/* MODE DE PAIEMENT */}
                <FormField
                  control={form.control}
                  name="mode_paiement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-text-secondary">
                        Mode de paiement
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-8 bg-background-main border-border-subtle text-text-primary">
                            <SelectValue placeholder="Choisir..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-surface-card border-border-subtle text-text-primary">
                          {MODES_PAIEMENT.map((mode) => (
                            <SelectItem key={mode.value} value={mode.value}>
                              {mode.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-accent-blue hover:bg-accent-blue/90 text-white mt-4"
                  disabled={isPending || !form.formState.isDirty}
                >
                  {isPending ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
