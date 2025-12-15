"use server";

// ═══════════════════════════════════════════════════════════
// 🔧 SERVER ACTION - UPDATE QUALIFICATION
// ═══════════════════════════════════════════════════════════

import { createClient } from "@/lib/supabase/server";
import { createQualificationSchema, type CreateQualificationInput } from "@/lib/schemas/qualification";
import { getMoisParutionString } from "@/lib/constants/pricing";
import { revalidatePath } from "next/cache";

interface UpdateQualificationResult {
  success: boolean;
  error?: string;
}

export async function updateQualification(
  qualificationId: string,
  entrepriseId: string,
  input: CreateQualificationInput
): Promise<UpdateQualificationResult> {
  try {
    // ───────────────────────────────────────────────────────────
    // 1. VALIDATION
    // ───────────────────────────────────────────────────────────
    const validated = createQualificationSchema.parse(input);

    // ───────────────────────────────────────────────────────────
    // 2. TRANSFORMATION DONNÉES
    // ───────────────────────────────────────────────────────────
    const moisParutionString = getMoisParutionString(validated.mois_parution);

    // ───────────────────────────────────────────────────────────
    // 3. UPDATE SUPABASE
    // ───────────────────────────────────────────────────────────
    const supabase = await createClient();

    const { error } = await supabase
      .from("qualification")
      .update({
        // Données métier
        format_encart: validated.format_encart,
        mois_parution: moisParutionString,
        prix_total: validated.prix_total,
        statut: validated.statut,
        
        // Optionnels
        mode_paiement: validated.mode_paiement || null,
        date_contact: validated.date_contact || null,
        commentaires: validated.commentaires || null,
        
        // Tarifs spéciaux
        remise_pourcentage: validated.remise_pourcentage || 0,
        // is_pompiers n'est pas stocké en base pour l'instant, c'est une logique UI/Calcul
        
        // Paiement échelonné
        paiement_echelonne: validated.paiement_echelonne,
        echeances: validated.echeances ? validated.echeances : null,
      })
      .eq("id", qualificationId)
      .eq("entreprise_id", entrepriseId);

    if (error) {
      console.error("Supabase error:", error);
      return {
        success: false,
        error: "Erreur lors de la mise à jour de la qualification"
      };
    }

    // ───────────────────────────────────────────────────────────
    // 4. REVALIDATION
    // ───────────────────────────────────────────────────────────
    revalidatePath(`/entreprises/${entrepriseId}`);
    revalidatePath(`/entreprises/${entrepriseId}/qualifications/${qualificationId}`);

    return {
      success: true
    };

  } catch (error) {
    console.error("Update qualification error:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: false,
      error: "Erreur inconnue lors de la mise à jour"
    };
  }
}
