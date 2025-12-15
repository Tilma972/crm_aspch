"use server";

// ═══════════════════════════════════════════════════════════
// 🔧 SERVER ACTION - CREATE QUALIFICATION
// ═══════════════════════════════════════════════════════════

import { createClient } from "@/supabase/server";
import { createQualificationSchema, type CreateQualificationInput } from "@/lib/schemas/qualification";
import { getMoisParutionString } from "@/lib/constants/pricing";
import { revalidatePath } from "next/cache";

interface CreateQualificationResult {
  success: boolean;
  data?: {
    id: string;
    qualification_id: string;
  };
  error?: string;
}

export async function createQualification(
  entrepriseId: string,
  input: CreateQualificationInput
): Promise<CreateQualificationResult> {
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
    // 3. INSERTION SUPABASE
    // ───────────────────────────────────────────────────────────
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("qualification")
      .insert({
        entreprise_id: entrepriseId,
        
        // Données métier
        format_encart: validated.format_encart,
        mois_parution: moisParutionString,
        prix_total: validated.prix_total,
        statut: validated.statut,
        
        // Optionnels
        mode_paiement: validated.mode_paiement || null,
        date_contact: validated.date_contact || null,
        commentaires: validated.commentaires || null,
        
        // Paiement échelonné
        paiement_echelonne: validated.paiement_echelonne,
        echeances: validated.echeances ? JSON.stringify(validated.echeances) : null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return {
        success: false,
        error: "Erreur lors de la création de la qualification"
      };
    }

    // ───────────────────────────────────────────────────────────
    // 4. REVALIDATION & RETURN
    // ───────────────────────────────────────────────────────────
    revalidatePath(`/entreprises/${entrepriseId}`);

    return {
      success: true,
      data: {
        id: data.id,
        qualification_id: `QUAL-${data.id.substring(0, 8)}`
      }
    };

  } catch (error) {
    console.error("Create qualification error:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: false,
      error: "Erreur inconnue lors de la création"
    };
  }
}
