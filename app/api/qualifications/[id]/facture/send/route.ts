import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/qualifications/[id]/facture/send
 * Déclenche l'envoi d'une facture déjà générée par email
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: qualificationId } = await params;
    const body = await request.json();

    // 1. Vérifier authentification
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Auth required' }, { status: 401 });
    }

    // 2. Récupérer config n8n
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_SEND_EMAIL_URL; // Nouveau webhook dédié
    if (!n8nWebhookUrl) {
      return NextResponse.json({ success: false, message: 'N8N Send Email Webhook not configured' }, { status: 500 });
    }

    // 3. Appeler n8n pour l'envoi
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        qualification_id: qualificationId,
        facture_numero: body.factureNumero,
        facture_url: body.factureUrl,
      }),
    });

    if (!n8nResponse.ok) {
      throw new Error('n8n send email failed');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
