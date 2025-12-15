// ═══════════════════════════════════════════════════════════
// 📝 SCHÉMA VALIDATION QUALIFICATION
// ═══════════════════════════════════════════════════════════

import { z } from 'zod';
import { MOIS_CALENDRIER } from '@/lib/constants/pricing';

// ───────────────────────────────────────────────────────────
// Schema création qualification
// ───────────────────────────────────────────────────────────

export const createQualificationSchema = z.object({
  // ===== DONNÉES MÉTIER OBLIGATOIRES =====
  format_encart: z.enum(['6X4', '6X8', '12X4', '12PARUTIONS'], {
    required_error: 'Le format est obligatoire'
  }),
  
  mois_parution: z.array(z.enum(MOIS_CALENDRIER)).min(1, {
    message: 'Sélectionnez au moins un mois de parution'
  }),
  
  prix_total: z.number().positive({
    message: 'Le prix doit être positif'
  }),
  
  // ===== DONNÉES OPTIONNELLES =====
  mode_paiement: z.enum(['Chèque', 'Virement', 'CB', 'Espèces']).optional(),
  
  date_contact: z.string().optional(), // Format ISO 'YYYY-MM-DD'
  
  commentaires: z.string().max(2000, {
    message: 'Les commentaires ne peuvent dépasser 2000 caractères'
  }).optional(),
  
  // ===== TARIFS SPÉCIAUX =====
  remise_pourcentage: z.number().min(0).max(100).optional(),
  
  is_pompiers: z.boolean().default(false),
  
  // ===== PAIEMENT ÉCHELONNÉ =====
  paiement_echelonne: z.boolean().default(false),
  
  echeances: z.array(z.object({
    date: z.string(), // ISO date
    montant: z.number().positive()
  })).optional(),
  
  // ===== MÉTADONNÉES =====
  statut: z.enum([
    'Nouveau',
    'Qualifié',
    'BC envoyé',
    'Payé',
    'Terminé',
    'Annulé'
  ]).default('Nouveau')
});

export type CreateQualificationInput = z.infer<typeof createQualificationSchema>;

// ───────────────────────────────────────────────────────────
// Helper : Générer écheancier automatique
// ───────────────────────────────────────────────────────────

export function genererEcheancier(
  montantTotal: number,
  nombreEcheances: number,
  dateDebut: Date = new Date()
): Array<{ date: string; montant: number }> {
  const montantParEcheance = Math.round(montantTotal / nombreEcheances);
  const reste = montantTotal - (montantParEcheance * (nombreEcheances - 1));
  
  return Array.from({ length: nombreEcheances }, (_, index) => {
    const date = new Date(dateDebut);
    date.setMonth(date.getMonth() + index);
    
    return {
      date: date.toISOString().split('T')[0],
      montant: index === nombreEcheances - 1 ? reste : montantParEcheance
    };
  });
}
