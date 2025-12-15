// ═══════════════════════════════════════════════════════════
// 💰 TARIFICATION CALENDRIER ASPCH 2026
// ═══════════════════════════════════════════════════════════

export const FORMATS_ASPCH = {
  '6X4': {
    label: '6X4 (6cm × 4cm)',
    prix_unitaire: 350,
    description: 'Format compact standard',
    dimensions: '6cm × 4cm'
  },
  '6X8': {
    label: '6X8 (6cm × 8cm)',
    prix_unitaire: 500,
    description: 'Format rectangulaire étendu',
    dimensions: '6cm × 8cm'
  },
  '12X4': {
    label: '12X4 (12cm × 4cm)',
    prix_unitaire: 500,
    description: 'Format bannière large',
    dimensions: '12cm × 4cm'
  },
  '12PARUTIONS': {
    label: '12 Parutions annuelles',
    prix_unitaire: 1800,
    description: 'Présence permanente toute l\'année',
    dimensions: '6cm × 4cm (×12)',
    is_bundle: true
  }
} as const;

export type FormatEncart = keyof typeof FORMATS_ASPCH;

// ═══════════════════════════════════════════════════════════
// 📅 MOIS DE L'ANNÉE
// ═══════════════════════════════════════════════════════════

export const MOIS_CALENDRIER = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre'
] as const;

export type MoisCalendrier = typeof MOIS_CALENDRIER[number];

// ═══════════════════════════════════════════════════════════
// 💳 MODES DE PAIEMENT
// ═══════════════════════════════════════════════════════════

export const MODES_PAIEMENT = [
  { value: 'Chèque', label: 'Chèque' },
  { value: 'Virement', label: 'Virement bancaire' },
  { value: 'CB', label: 'Carte bancaire' },
  { value: 'Espèces', label: 'Espèces' }
] as const;

// ═══════════════════════════════════════════════════════════
// 🧮 LOGIQUE DE CALCUL PRIX
// ═══════════════════════════════════════════════════════════

interface CalculPrixParams {
  format: FormatEncart;
  nombreMois: number;
  remisePourcentage?: number; // Ex: 70 pour -70%
  isPompiers?: boolean;
}

export function calculerPrixTotal({
  format,
  nombreMois,
  remisePourcentage = 0,
  isPompiers = false
}: CalculPrixParams): number {
  const config = FORMATS_ASPCH[format];
  
  // Cas spécial : 12 PARUTIONS = prix fixe
  if (format === '12PARUTIONS') {
    const prixBase = config.prix_unitaire;
    const tauxRemise = isPompiers ? 70 : remisePourcentage;
    return prixBase * (1 - tauxRemise / 100);
  }
  
  // Formats standards : prix unitaire × nombre de mois
  const prixBase = config.prix_unitaire * nombreMois;
  const tauxRemise = isPompiers ? 70 : remisePourcentage;
  
  return prixBase * (1 - tauxRemise / 100);
}

// ═══════════════════════════════════════════════════════════
// 📊 HELPERS
// ═══════════════════════════════════════════════════════════

export function formatPrix(prix: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(prix);
}

export function getMoisParutionString(mois: MoisCalendrier[]): string {
  if (mois.length === 12) return 'Janvier à Décembre';
  if (mois.length === 1) return mois[0];
  return mois.join(', ');
}
