import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/qualifications/[id]/facture
 * Déclenche le workflow n8n pour générer une facture
 * 
 * ⚠️ IMPORTANT: Cette route NE met PAS à jour la DB
 * C'est le rôle du workflow n8n de gérer:
 * - qualification.facture_status
 * - qualification.facture_numero
 * - document.status
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: qualificationId } = await params;

    // 1. Vérifier authentification
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          code: 'AUTH_REQUIRED',
          message: 'Vous devez être connecté pour générer une facture',
        },
        { status: 401 }
      );
    }

    // 2. Parser le body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          code: 'INVALID_JSON',
          message: 'Le corps de la requête doit être du JSON valide',
        },
        { status: 400 }
      );
    }

    // 3. Paramètres optionnels
    const sendEmail = (body.sendEmail !== undefined) ? !!body.sendEmail : false;

    // 4. Vérifier que la qualification existe
    const { data: qualification, error: qualError } = await supabase
      .from('qualification')
      .select('id, entreprise_id, date_paiement, reference_paiement')
      .eq('id', qualificationId)
      .single();

    if (qualError || !qualification) {
      return NextResponse.json(
        {
          success: false,
          code: 'QUALIFICATION_NOT_FOUND',
          message: 'Qualification introuvable',
        },
        { status: 404 }
      );
    }

    // 4.5 Mettre à jour les infos de paiement si fournies (pour facture acquittée)
    let finalDatePaiement = qualification.date_paiement;
    let finalReferencePaiement = qualification.reference_paiement;

    if (body.is_paid === true) {
      const updateData: {
        date_paiement?: string;
        reference_paiement?: string;
        statut: string;
      } = {
        statut: 'Payé',
      };

      if (body.date_paiement) {
        updateData.date_paiement = body.date_paiement as string;
        finalDatePaiement = body.date_paiement as string;
      }
      if (body.reference_paiement) {
        updateData.reference_paiement = body.reference_paiement as string;
        finalReferencePaiement = body.reference_paiement as string;
      }

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('qualification')
          .update(updateData)
          .eq('id', qualificationId);

        if (updateError) {
          console.error('Error updating payment info:', updateError);
          return NextResponse.json(
            {
              success: false,
              code: 'UPDATE_ERROR',
              message: 'Erreur lors de la mise à jour des informations de paiement',
            },
            { status: 500 }
          );
        }
      }
    }

    // 5. Récupérer config webhook n8n
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    const n8nWebhookSecret = process.env.N8N_WEBHOOK_SECRET;

    if (!n8nWebhookUrl) {
      console.error('N8N_WEBHOOK_URL not configured');
      return NextResponse.json(
        {
          success: false,
          code: 'CONFIG_ERROR',
          message: 'Serveur mal configuré: N8N_WEBHOOK_URL manquant',
        },
        { status: 500 }
      );
    }

    // 6. Construire le payload minimal pour n8n
    const n8nPayload = {
      qualification_id: qualificationId,
      send_email: sendEmail,
      is_paid: body.is_paid || false,
      date_paiement: finalDatePaiement,
      reference_paiement: finalReferencePaiement
    };

    // 7. Appeler le webhook n8n avec timeout de 35 secondes
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    let n8nResponse;
    try {
      n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(n8nWebhookSecret && { 'x-webhook-secret': n8nWebhookSecret }),
        },
        body: JSON.stringify(n8nPayload),
        signal: controller.signal,
      });
    } catch (e) {
      clearTimeout(timeoutId);
      console.error('n8n webhook call failed:', e);

      // ⚠️ IMPORTANT: Ne pas mettre à jour la DB ici
      // Si le webhook timeout, le workflow n8n n'a même pas démarré
      // Le frontend continuera de poller et affichera "timeout"
      
      return NextResponse.json(
        {
          success: false,
          code: 'WEBHOOK_TIMEOUT',
          message: 'Timeout ou erreur de connexion au workflow',
        },
        { status: 503 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    // 8. Vérifier la réponse n8n
    if (!n8nResponse.ok) {
      const errorData = await n8nResponse.text();
      console.error('n8n error response:', errorData);

      // ⚠️ IMPORTANT: Ne pas mettre à jour la DB ici
      // Le workflow n8n gère les erreurs via son Error Handler
      // Il mettra à jour document.status='error' et qualification.facture_status='error'
      
      return NextResponse.json(
        {
          success: false,
          code: 'WORKFLOW_ERROR',
          message: 'Le workflow a échoué',
          details: errorData,
        },
        { status: 500 }
      );
    }

    // 9. Parser la réponse n8n
    const n8nResult = await n8nResponse.json();

    // 10. Répondre au client
    // Le statut sera mis à jour par n8n:
    // - qualification.facture_status = 'generating' puis 'ready'
    // - qualification.facture_numero = 'FA-2026-XXXX'
    // - document.status = 'generating' puis 'ready'
    
    return NextResponse.json({
      success: true,
      message: 'Génération de facture en cours...',
      qualificationId,
      jobId: qualificationId,
      factureNumero: (n8nResult as Record<string, unknown>).facture_numero || null,
    });
  } catch (e) {
    console.error('Facture generation error:', e);
    return NextResponse.json(
      { error: 'Failed to generate facture' },
      { status: 500 }
    );
  }
}


/**
 * GET /api/qualifications/[id]/facture/status
 * Récupère le statut actuel de la facture
 * 
 * Cette route est pollée par le frontend toutes les 2 secondes
 * pour détecter quand le workflow n8n a terminé
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: qualificationId } = await params;

    // Vérifier authentification
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Récupérer le statut
    const { data, error } = await supabase
      .from('qualification')
      .select('facture_status, facture_numero, facture_url, facture_generated_at, facture_error, date_paiement, reference_paiement')
      .eq('id', qualificationId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    // Générer une URL signée si la facture est prête
    let finalUrl = data.facture_url;
    if (data.facture_url && data.facture_status === 'ready') {
      const { data: signedData, error: signedError } = await supabase.storage
        .from('documents')
        .createSignedUrl(data.facture_url, 600); // 10 minutes
      
      if (!signedError && signedData) {
        finalUrl = signedData.signedUrl;
      }
    }

    return NextResponse.json({
      facture_status: data.facture_status || null,
      facture_numero: data.facture_numero,
      facture_url: finalUrl,
      facture_generated_at: data.facture_generated_at,
      facture_error: data.facture_error,
      date_paiement: data.date_paiement,
      reference_paiement: data.reference_paiement,
    });
  } catch (err) {
    console.error('Erreur GET status:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
