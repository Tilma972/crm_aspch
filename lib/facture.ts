import { createClient } from '@/lib/supabase/server';

/**
 * Génère un numéro de facture via l'RPC Supabase
 * @returns ex: "FA-2025-0001"
 */
export async function generateFactureNumero(): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('next_facture_numero');

  if (error) {
    throw new Error(`Erreur génération numéro facture: ${error.message}`);
  }

  if (!data || typeof data !== 'string') {
    throw new Error('Numéro de facture invalide reçu de la DB');
  }

  return data;
}

/**
 * Met à jour le statut d'une qualification pour la facture
 */
export async function updateQualificationFactureStatus(
  qualificationId: string,
  status: 'generating' | 'ready' | 'error',
  updates?: {
    facture_numero?: string;
    facture_url?: string;
    facture_generated_at?: string;
    facture_error?: string;
  }
) {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {
    facture_status: status,
    ...updates,
  };

  const { error } = await supabase
    .from('qualification')
    .update(updateData)
    .eq('id', qualificationId);

  if (error) {
    throw new Error(`Erreur mise à jour qualification: ${error.message}`);
  }
}

/**
 * Crée ou met à jour une ligne document (type='facture')
 */
export async function createOrUpdateDocument(
  qualificationId: string,
  numero: string,
  url: string,
  storagePath: string
) {
  const supabase = await createClient();

  // Vérifier si existe déjà
  const { data: existing } = await supabase
    .from('document')
    .select('id')
    .eq('qualification_id', qualificationId)
    .eq('type', 'facture')
    .single();

  if (existing) {
    // Mettre à jour
    const { error } = await supabase
      .from('document')
      .update({
        numero,
        url,
        storage_path: storagePath,
      })
      .eq('id', existing.id);

    if (error) {
      throw new Error(`Erreur mise à jour document: ${error.message}`);
    }

    return existing.id;
  } else {
    // Créer
    const { data, error } = await supabase
      .from('document')
      .insert([
        {
          qualification_id: qualificationId,
          type: 'facture',
          numero,
          url,
          storage_path: storagePath,
        },
      ])
      .select('id')
      .single();

    if (error) {
      throw new Error(`Erreur création document: ${error.message}`);
    }

    return data.id;
  }
}

/**
 * Récupère les détails d'une qualification (avec entreprise)
 */
export async function getQualificationWithEntreprise(qualificationId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('qualification')
    .select(
      `
      id,
      statut,
      format_encart,
      prix_total,
      mois_parution,
      paiement_echelonne,
      mode_paiement,
      date_contact,
      commentaires,
      entreprise_id,
      entreprise:entreprise_id (
        id,
        nom,
        email,
        telephone,
        adresse,
        ville,
        cp
      )
    `
    )
    .eq('id', qualificationId)
    .single();

  if (error || !data) {
    throw new Error(`Qualification non trouvée: ${error?.message || 'Unknown'}`);
  }

  return data;
}

/**
 * Appelle le webhook n8n pour générer la facture
 */
export async function callN8nWebhook(payload: object): Promise<{ success: boolean; data?: Record<string, unknown> }> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const webhookAuth = process.env.N8N_WEBHOOK_AUTH;

  if (!webhookUrl) {
    throw new Error('N8N_WEBHOOK_URL non configurée');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Ajouter auth header si configuré
  if (webhookAuth) {
    headers['Authorization'] = webhookAuth;
  }

  // Créer un AbortController pour le timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Webhook retourna ${response.status}: ${text}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('WEBHOOK_TIMEOUT');
    }
    throw err;
  }
}

/**
 * Construit le payload pour le webhook n8n
 */
export function buildN8nPayload(
  qualification: Record<string, unknown>,
  factureNumero: string,
  status: 'emise' | 'acquittee',
  userId: string
) {
  const entreprise = qualification.entreprise;

  // Calculer date d'échéance (30 jours par défaut)
  const dateEcheance = new Date();
  dateEcheance.setDate(dateEcheance.getDate() + 30);

  return {
    event: 'facture.generate',
    timestamp: new Date().toISOString(),

    qualification: {
      id: qualification.id as string,
      statut: qualification.statut as string,
      format_encart: qualification.format_encart as string,
      prix_total: parseFloat(qualification.prix_total as string),
      mois_parution: qualification.mois_parution as string,
      paiement_echelonne: qualification.paiement_echelonne,
      mode_paiement: qualification.mode_paiement as string,
      date_contact: qualification.date_contact as string,
      commentaires: qualification.commentaires as string,
    },

    entreprise: {
      id: (entreprise as Record<string, unknown>).id as string,
      nom: (entreprise as Record<string, unknown>).nom as string,
      email: (entreprise as Record<string, unknown>).email as string,
      telephone: (entreprise as Record<string, unknown>).telephone as string,
      adresse: (entreprise as Record<string, unknown>).adresse as string,
      ville: (entreprise as Record<string, unknown>).ville as string,
      cp: (entreprise as Record<string, unknown>).cp as string,
    },

    facture: {
      numero: factureNumero,
      status,
      date_emission: new Date().toISOString().split('T')[0],
      date_echeance: dateEcheance.toISOString().split('T')[0],
      generated_by_user: userId,
    },

    options: {
      send_email: true,
      send_telegram: false,
      email_template: status === 'emise' ? 'facture_emise' : 'facture_acquittee',
    },

    storage: {
      bucket: 'documents',
      path: `factures/${factureNumero}.pdf`,
      visibility: 'private',
    },
  };
}
