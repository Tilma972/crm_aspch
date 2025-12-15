"use client";

// ═══════════════════════════════════════════════════════════
// 📝 FORMULAIRE NOUVELLE QUALIFICATION
// ═══════════════════════════════════════════════════════════

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { 
  FORMATS_ASPCH, 
  MOIS_CALENDRIER, 
  MODES_PAIEMENT,
  calculerPrixTotal,
  formatPrix,
  type FormatEncart
} from "@/lib/constants/pricing";
import { 
  createQualificationSchema, 
  type CreateQualificationInput,
  genererEcheancier
} from "@/lib/schemas/qualification";
import { createQualification } from "../actions";

interface QualificationFormProps {
  entrepriseId: string;
  entrepriseNom: string;
  isPompiers?: boolean;
}

export function QualificationForm({
  entrepriseId,
  entrepriseNom,
  isPompiers = false,
}: QualificationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showEcheancier, setShowEcheancier] = useState(false);

  const form = useForm<CreateQualificationInput>({
    resolver: zodResolver(createQualificationSchema),
    defaultValues: {
      format_encart: undefined,
      mois_parution: [],
      prix_total: 0,
      statut: "Nouveau",
      is_pompiers: isPompiers,
      remise_pourcentage: 0,
      paiement_echelonne: false,
      mode_paiement: undefined,
      commentaires: "",
    },
  });

  const watchFormat = form.watch("format_encart");
  const watchMois = form.watch("mois_parution");
  const watchRemise = form.watch("remise_pourcentage") || 0;
  const watchIsPompiers = form.watch("is_pompiers");

  // Calcul automatique du prix
  const calculerPrix = () => {
    if (!watchFormat || watchMois.length === 0) return 0;

    return calculerPrixTotal({
      format: watchFormat,
      nombreMois: watchMois.length,
      remisePourcentage: watchRemise || 0,
      isPompiers: watchIsPompiers,
    });
  };

  const prixCalcule = calculerPrix();
  if (prixCalcule !== form.getValues("prix_total")) {
    form.setValue("prix_total", prixCalcule);
  }

  // Gestion mois de parution
  const toggleMois = (mois: typeof MOIS_CALENDRIER[number]) => {
    const current = form.getValues("mois_parution");
    const updated = current.includes(mois)
      ? current.filter((m) => m !== mois)
      : [...current, mois];

    form.setValue("mois_parution", updated);
  };

  const selectionnerTousMois = () => {
    form.setValue("mois_parution", [...MOIS_CALENDRIER]);
  };

  const deselectionnerTousMois = () => {
    form.setValue("mois_parution", []);
  };

  // Génération écheancier
  const genererEcheancierAuto = (nombreEcheances: number) => {
    const echeances = genererEcheancier(prixCalcule, nombreEcheances);
    form.setValue("echeances", echeances);
    setShowEcheancier(true);
  };

  // Soumission
  const onSubmit = (values: CreateQualificationInput) => {
    startTransition(async () => {
      const result = await createQualification(entrepriseId, values);

      if (result.success) {
        toast.success("✅ Qualification créée avec succès !");
        router.push(`/entreprises/${entrepriseId}`);
      } else {
        toast.error(result.error || "Erreur lors de la création");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* ENTREPRISE INFO */}
        <Card className="bg-surface-card border-border-subtle">
          <CardContent className="p-4">
            <p className="text-sm text-text-secondary">Entreprise</p>
            <p className="text-lg font-semibold text-text-primary mt-1">
              {entrepriseNom}
            </p>
            {isPompiers && (
              <Badge variant="secondary" className="mt-2 bg-accent-blue/20 text-accent-blue">
                 Sapeur-Pompier (-70%)
              </Badge>
            )}
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
                    Format de l&apos;encart *
                  </FormLabel>
                  <div className="mt-3 grid grid-cols-2 gap-2">
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
                  <FormMessage className="mt-2" />
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
                      Mois de parution *
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

                  <div className="grid grid-cols-3 gap-2">
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

                  {watchMois.length > 0 && (
                    <p className="text-xs text-text-secondary mt-3">
                      {watchMois.length} mois sélectionné(s)
                    </p>
                  )}

                  <FormMessage className="mt-2" />
                </CardContent>
              </Card>
            </FormItem>
          )}
        />

        {/* TARIFS SPÉCIAUX */}
        <Card className="bg-surface-card border-border-subtle">
          <CardContent className="p-4">
            <FormLabel className="text-sm font-medium text-text-secondary">
              Tarifs spéciaux
            </FormLabel>

            <div className="mt-3 space-y-3">
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
                        className="h-5 w-5 rounded border-border-subtle bg-background-main"
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
                      <label className="text-sm text-text-secondary">Remise personnalisée (%)</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="mt-2 bg-background-main border-border-subtle text-text-primary"
                      />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* PRIX TOTAL */}
        <Card className="bg-surface-card border-border-subtle">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Prix total calculé</p>
                {watchRemise > 0 && !watchIsPompiers && (
                  <p className="text-xs text-status-success mt-1">-{watchRemise}%</p>
                )}
                {watchIsPompiers && (
                  <p className="text-xs text-status-success mt-1">-70% (Pompiers)</p>
                )}
              </div>
              <p className="text-2xl font-bold text-accent-blue">
                {formatPrix(prixCalcule)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* PAIEMENT ÉCHELONNÉ */}
        <FormField
          control={form.control}
          name="paiement_echelonne"
          render={({ field }) => (
            <FormItem>
              <Card className="bg-surface-card border-border-subtle">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.checked);
                        setShowEcheancier(e.target.checked);
                      }}
                      className="h-5 w-5 rounded border-border-subtle bg-background-main"
                    />
                    <FormLabel className="text-sm text-text-primary cursor-pointer">
                      💳 Paiement échelonné
                    </FormLabel>
                  </div>

                  {field.value && (
                    <div className="mt-3 flex gap-2">
                      {[2, 3, 4, 6].map((nombre) => (
                        <button
                          key={nombre}
                          type="button"
                          onClick={() => genererEcheancierAuto(nombre)}
                          className="px-3 py-1 rounded text-sm bg-background-main hover:bg-white/5 text-text-secondary border border-border-subtle transition-all"
                        >
                          {nombre}x
                        </button>
                      ))}
                    </div>
                  )}

                  {showEcheancier && form.watch("echeances") && (
                    <div className="mt-4 space-y-2">
                      {form.watch("echeances")?.map((echeance, index) => (
                        <div key={index} className="flex justify-between p-2 rounded bg-background-main text-sm border border-border-subtle">
                          <span className="text-text-secondary">Échéance {index + 1}</span>
                          <div className="text-right">
                            <p className="text-text-primary font-medium">{formatPrix(echeance.montant)}</p>
                            <p className="text-xs text-text-secondary">{new Date(echeance.date).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </FormItem>
          )}
        />

        {/* MODE DE PAIEMENT */}
        <FormField
          control={form.control}
          name="mode_paiement"
          render={({ field }) => (
            <FormItem>
              <Card className="bg-surface-card border-border-subtle">
                <CardContent className="p-4">
                  <FormLabel className="text-sm font-medium text-text-secondary">
                    Mode de paiement
                  </FormLabel>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {MODES_PAIEMENT.map((mode) => (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => field.onChange(mode.value)}
                        className={cn(
                          "p-2 rounded text-sm font-medium transition-all",
                          field.value === mode.value
                            ? "bg-accent-blue text-white"
                            : "bg-background-main text-text-secondary hover:bg-white/5 border border-border-subtle"
                        )}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </FormItem>
          )}
        />

        {/* DATE CONTACT */}
        <FormField
          control={form.control}
          name="date_contact"
          render={({ field }) => (
            <FormItem>
              <Card className="bg-surface-card border-border-subtle">
                <CardContent className="p-4">
                  <FormLabel className="text-sm font-medium text-text-secondary">
                    Date du contact
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="mt-2 bg-background-main border-border-subtle text-text-primary"
                    />
                  </FormControl>
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
                      placeholder="Notes internes, conditions particulières..."
                      className="mt-2 w-full rounded-lg border border-border-subtle bg-background-main px-3 py-2 text-text-primary resize-none focus:border-accent-blue focus:ring-accent-blue"
                    />
                  </FormControl>
                  <FormMessage />
                </CardContent>
              </Card>
            </FormItem>
          )}
        />

        {/* ACTIONS */}
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-surface-card border-t border-border-subtle z-40">
          <div className="max-w-3xl mx-auto flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-background-main text-text-primary border-border-subtle hover:bg-white/5"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-accent-blue hover:bg-accent-blue/90 text-white"
              disabled={isPending || !form.formState.isValid}
            >
              {isPending ? "Création..." : "Créer la qualification"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
