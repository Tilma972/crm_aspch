import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASEROW_API_TOKEN = process.env.BASEROW_API_TOKEN;
const BASEROW_TABLE_ID = '486098'; // ID from n8n workflow

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !BASEROW_API_TOKEN) {
  console.error('❌ Missing environment variables. Please check .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fetchBaserowRows(tableId: string) {
  const rows = [];
  let nextUrl = `https://api.baserow.io/api/database/rows/table/${tableId}/?user_field_names=true&size=200`;

  while (nextUrl) {
    console.log(`Fetching Baserow page: ${nextUrl}`);
    const response = await fetch(nextUrl, {
      headers: {
        Authorization: `Token ${BASEROW_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Baserow API Error: ${response.statusText}`);
    }

    const data = await response.json();
    rows.push(...data.results);
    nextUrl = data.next;
  }

  return rows;
}

async function migrateQualifications() {
  console.log('🚀 Starting migration...');

  try {
    // 1. Fetch all companies from Supabase to create a lookup map (Baserow ID -> Supabase UUID)
    console.log('📥 Fetching companies from Supabase...');
    const { data: companies, error: companyError } = await supabase
      .from('entreprise')
      .select('id, baserow_id');

    if (companyError) throw companyError;

    const companyMap = new Map(
      companies
        .filter((c) => c.baserow_id)
        .map((c) => [c.baserow_id, c.id])
    );

    console.log(`✅ Found ${companies.length} companies in Supabase.`);

    // 2. Fetch qualifications from Baserow
    console.log('📥 Fetching qualifications from Baserow...');
    const baserowRows = await fetchBaserowRows(BASEROW_TABLE_ID);
    console.log(`✅ Found ${baserowRows.length} qualifications in Baserow.`);

    // 3. Transform and Insert
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    if (baserowRows.length > 0) {
      console.log('🔍 DEBUG: First row structure:', JSON.stringify(baserowRows[0], null, 2));
    }

    for (const row of baserowRows) {
      // Correct mapping based on debug output
      const baserowEntrepriseId = Array.isArray(row.entreprise_id) 
        ? row.entreprise_id[0]?.id 
        : row.entreprise_id?.id || row.entreprise_id; 

      if (!baserowEntrepriseId) {
        console.warn(`⚠️ Skipping row ${row.id}: No linked enterprise.`);
        skippedCount++;
        continue;
      }

      const supabaseEntrepriseId = companyMap.get(String(baserowEntrepriseId));

      if (!supabaseEntrepriseId) {
        console.warn(`⚠️ Skipping row ${row.id}: Enterprise ID ${baserowEntrepriseId} not found in Supabase.`);
        skippedCount++;
        continue;
      }

      // Map fields
      const moisList = parseMonths(row.mois_parution);

      const qualificationData = {
        baserow_id: String(row.id),
        entreprise_id: supabaseEntrepriseId,
        statut: mapStatus(row['Statut Suivi']?.value),
        format_encart: row.format_encart?.value || null,
        // Keep backward compatibility for now, but also populate new table
        mois_parution: moisList.join(', '),
        prix_total: parseFloat(row.prix_total) || 0,
        mode_paiement: mapPaymentMode(row.mode_paiement?.value),
        date_contact: row.date_contact || null,
        commentaires: row.commentaires || null,
        paiement_echelonne: row.echeancier_actif || false,
        created_at: row.created_on ? new Date(row.created_on).toISOString() : new Date().toISOString(),
      };

      // 1. Upsert Qualification
      const { data: qData, error: qError } = await supabase
        .from('qualification')
        .upsert(qualificationData, { onConflict: 'baserow_id' })
        .select('id')
        .single();

      if (qError) {
        console.error(`❌ Error inserting qualification ${row.id}:`, qError.message);
        errorCount++;
        continue;
      }

      const qualificationId = qData.id;

      // 2. Insert Documents (BC)
      if (row.bon_commande_url) {
        const { error: docError } = await supabase.from('document').upsert({
          qualification_id: qualificationId,
          type: 'bon_commande',
          url: row.bon_commande_url,
          status: 'ready'
        }, { onConflict: 'qualification_id, type' }); // Requires unique constraint on (qualification_id, type)

        if (docError) console.error(`   ⚠️ Error inserting BC for ${row.id}:`, docError.message);
      }

      // 3. Insert Documents (Facture)
      if (row.facture_url) {
        const { error: docError } = await supabase.from('document').upsert({
          qualification_id: qualificationId,
          type: 'facture',
          url: row.facture_url,
          status: 'ready',
          numero: row.facture_numero || null
        }, { onConflict: 'qualification_id, type' });

        if (docError) console.error(`   ⚠️ Error inserting Facture for ${row.id}:`, docError.message);
      }

      // 4. Insert Months
      for (const [index, mois] of moisList.entries()) {
        const { error: moisError } = await supabase.from('qualification_mois').upsert({
          qualification_id: qualificationId,
          mois: mois,
          ordre: index + 1,
          format: row.format_encart?.value || null
        }, { onConflict: 'qualification_id, mois' }); // Requires unique constraint on (qualification_id, mois)

        if (moisError) console.error(`   ⚠️ Error inserting Month ${mois} for ${row.id}:`, moisError.message);
      }

      successCount++;
    }

    console.log('🏁 Migration completed!');
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`⚠️ Skipped: ${skippedCount}`);

  } catch (error) {
    console.error('🔥 Fatal error:', error);
  }
}

function mapStatus(baserowStatus: string): string {
  // Map Baserow status to Supabase enum
  // 'Nouveau', 'Qualifié', 'BC envoyé', 'Payé', 'Terminé', 'Annulé'
  if (!baserowStatus) return 'Nouveau';
  
  const status = baserowStatus.toLowerCase();
  if (status.includes('nouveau')) return 'Nouveau';
  if (status.includes('qualif')) return 'Qualifié';
  if (status.includes('bc') || status.includes('envoy')) return 'BC envoyé';
  if (status.includes('pay')) return 'Payé';
  if (status.includes('termin')) return 'Terminé';
  if (status.includes('annul')) return 'Annulé';
  
  return 'Nouveau'; // Default
}

function parseMonths(input: any): string[] {
  const validMonths = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  let rawList: string[] = [];

  if (Array.isArray(input)) {
    rawList = input.map(i => i.value || i);
  } else if (typeof input === 'string') {
    // Split by comma, 'et', '+', '/', or just spaces if it looks like a list
    // Also handle "Janvier à Mars" ranges? For now, just split separators.
    rawList = input.split(/,| et | \+ | \/ | - /).map(s => s.trim());
  } else {
    return [];
  }

  const result: string[] = [];

  for (const raw of rawList) {
    if (!raw) continue;
    
    // Normalize: remove accents, lowercase
    const normalized = raw.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // e.g. "fevrier"
    
    // Find matching valid month
    const match = validMonths.find(m => {
      const mNorm = m.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return mNorm === normalized || (normalized.length >= 3 && mNorm.startsWith(normalized));
    });

    if (match) {
      result.push(match);
    } else {
      // console.warn(`⚠️ Could not parse month: "${raw}"`);
    }
  }

  return [...new Set(result)]; // Unique
}

function mapPaymentMode(mode: string | null): string | null {
  if (!mode) return null;
  const m = mode.toLowerCase();
  if (m.includes('cheque') || m.includes('chèque')) return 'Chèque';
  if (m.includes('virement')) return 'Virement';
  if (m.includes('cb') || m.includes('carte')) return 'CB';
  if (m.includes('espece') || m.includes('espèces')) return 'Espèces';
  return null;
}

migrateQualifications();
