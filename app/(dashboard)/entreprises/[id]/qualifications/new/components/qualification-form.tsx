"use client";

// ═══════════════════════════════════════════════════════════
// 📝 FORMULAIRE NOUVELLE QUALIFICATION
// ═══════════════════════════════════════════════════════════

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { 
  FORMATS_ASPCH, 
  MOIS_CALENDRIER, 
  MODES_PAIEMENT,
  calculerPrixTotal,
  formatPrix,
  getMoisParutionString
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
        <div className="rounded-xl bg-slate-900 p-4 border border-slate-700">
          <p className="text-sm text-slate-400">Entreprise</p>
          <p className="text-lg font-semibold text-white mt-1">
            {entrepriseNom}
          </p>
          {isPompiers && (
            <Badge variant="secondary" className="mt-2 bg-blue-900/30 text-blue-400">
              🚒 Sapeur-Pompier (-70%)
            </Badge>
          )}
        </div>

        {/* FORMAT */}
        <FormField
          control={form.control}
          name="format_encart"
          render={({ field }) => (
            <FormItem>
              <div className="rounded-xl bg-slate-900 p-4 border border-slate-700">
                <FormLabel className="text-sm font-medium text-slate-300">
                  Format de l'encart *
                </FormLabel>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {Object.entries(FORMATS_ASPCH).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => field.onChange(key as any)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        field.value === key
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <p className="text-sm font-medium text-white">{config.label}</p>
                      <p className="text-xs text-slate-400 mt-1">{config.description}</p>
                    </button>
                  ))}
                </div>
                <FormMessage className="mt-2" />
              </div>
            </FormItem>
          )}
        />

        {/* MOIS DE PARUTION */}
        <FormField
          control={form.control}
          name="mois_parution"
          render={() => (
            <FormItem>
              <div className="rounded-xl bg-slate-900 p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <FormLabel className="text-sm font-medium text-slate-300">
                    Mois de parution *
                  </FormLabel>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectionnerTousMois}
                      className="text-xs px-2 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                    >
                      Tous
                    </button>
                    <button
                      type="button"
                      onClick={deselectionnerTousMois}
                      className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600"
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
                      className={`p-2 rounded text-sm font-medium transition-all ${
                        watchMois.includes(mois)
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {mois.slice(0, 3)}
                    </button>
                  ))}
                </div>

                {watchMois.length > 0 && (
                  <p className="text-xs text-slate-400 mt-3">
                    {watchMois.length} mois sélectionné(s)
                  </p>
                )}

                <FormMessage className="mt-2" />
              </div>
            </FormItem>
          )}
        />

        {/* TARIFS SPÉCIAUX */}
        <div className="rounded-xl bg-slate-900 p-4 border border-slate-700">
          <FormLabel className="text-sm font-medium text-slate-300">
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
                      className="h-5 w-5 rounded border-slate-700"
                    />
                    <label className="text-sm text-slate-300 cursor-pointer">
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
                    <label className="text-sm text-slate-300">Remise personnalisée (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="mt-2 bg-slate-800 border-slate-700 text-white"
                    />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* PRIX TOTAL */}
        <div className="rounded-xl bg-slate-900 p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Prix total calculé</p>
              {watchRemise > 0 && !watchIsPompiers && (
                <p className="text-xs text-green-400 mt-1">-{watchRemise}%</p>
              )}
              {watchIsPompiers && (
                <p className="text-xs text-green-400 mt-1">-70% (Pompiers)</p>
              )}
            </div>
            <p className="text-2xl font-bold text-blue-400">
              {formatPrix(prixCalcule)}
            </p>
          </div>
        </div>

        {/* PAIEMENT ÉCHELONNÉ */}
        <FormField
          control={form.control}
          name="paiement_echelonne"
          render={({ field }) => (
            <FormItem>
              <div className="rounded-xl bg-slate-900 p-4 border border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.checked);
                      setShowEcheancier(e.target.checked);
                    }}
                    className="h-5 w-5 rounded border-slate-700"
                  />
                  <FormLabel className="text-sm text-white cursor-pointer">
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
                        className="px-3 py-1 rounded text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                      >
                        {nombre}x
                      </button>
                    ))}
                  </div>
                )}

                {showEcheancier && form.watch("echeances") && (
                  <div className="mt-4 space-y-2">
                    {form.watch("echeances")?.map((echeance, index) => (
                      <div key={index} className="flex justify-between p-2 rounded bg-slate-800 text-sm">
                        <span className="text-slate-300">Échéance {index + 1}</span>
                        <div className="text-right">
                          <p className="text-white font-medium">{formatPrix(echeance.montant)}</p>
                          <p className="text-xs text-slate-400">{new Date(echeance.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormItem>
          )}
        />

        {/* MODE DE PAIEMENT */}
        <FormField
          control={form.control}
          name="mode_paiement"
          render={({ field }) => (
            <FormItem>
              <div className="rounded-xl bg-slate-900 p-4 border border-slate-700">
                <FormLabel className="text-sm font-medium text-slate-300">
                  Mode de paiement
                </FormLabel>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {MODES_PAIEMENT.map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => field.onChange(mode.value)}
                      className={`p-2 rounded text-sm font-medium transition-all ${
                        field.value === mode.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </FormItem>
          )}
        />

        {/* DATE CONTACT */}
        <FormField
          control={form.control}
          name="date_contact"
          render={({ field }) => (
            <FormItem>
              <div className="rounded-xl bg-slate-900 p-4 border border-slate-700">
                <FormLabel className="text-sm font-medium text-slate-300">
                  Date du contact
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    className="mt-2 bg-slate-800 border-slate-700 text-white"
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />

        {/* COMMENTAIRES */}
        <FormField
          control={form.control}
          name="commentaires"
          render={({ field }) => (
            <FormItem>
              <div className="rounded-xl bg-slate-900 p-4 border border-slate-700">
                <FormLabel className="text-sm font-medium text-slate-300">
                  Commentaires
                </FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    rows={4}
                    placeholder="Notes internes, conditions particulières..."
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white resize-none focus:border-blue-500 focus:ring-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* ACTIONS */}
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-slate-950 border-t border-slate-700">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
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
