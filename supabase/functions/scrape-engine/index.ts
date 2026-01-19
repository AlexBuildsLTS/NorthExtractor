/**
 * ============================================================================
 * 🧠 TITAN-2 NEURAL EXTRACTION CORE (V15.5 UNIFIED)
 * ============================================================================
 * Path: supabase/functions/scrape-engine/index.ts
 * FEATURES:
 * - PRO-TIER SYNTHESIS: Upgraded to gemini-1.5-pro for complex array mapping.
 * - HIGH-FIDELITY LOGS: Restored level-based broadcasting (info/success/warn).
 * - IMPORT ALIGNMENT: 100% synchronized with your locked import_map.json.
 * - TOKEN OPTIMIZATION: High-capacity 45k fragment processing.
 * ============================================================================
 */

import { serve } from 'std/http/server.ts';
import { createClient } from 'supabase';
import { GoogleGenerativeAI } from 'google-ai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface ExtractionPayload {
  url: string;
  target_schema: Record<string, any>;
  job_id: string;
  operator_id: string;
  config?: any;
}

serve(async (req: Request) => {
  // 1. Handshake Preflight
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders });

  // 2. Initialize Core Handshake
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  let jobId: string | null = null;
  let userId: string | null = null;

  try {
    const body: ExtractionPayload = await req.json();
    jobId = body.job_id;
    userId = body.operator_id;

    const logEvent = async (message: string, level = 'info') => {
      await supabase.from('scraping_logs').insert({
        job_id: jobId,
        user_id: userId,
        level,
        message: `[TITAN-CORE] ${message}`,
      });
    };

    await logEvent(`Ignition sequence started for node: ${body.url}`);

    // 3. DOM HARVESTING
    const response = await fetch(body.url, {
      headers: {
        'User-Agent': 'NorthExtractor/2.0 (Titan-PRO Enterprise)',
      },
    });

    if (!response.ok)
      throw new Error(`NODE_UNREACHABLE: Status ${response.status}`);

    const rawHtml = await response.text();

    // High-capacity cleaning for gemini-1.5-pro
    const sanitizedHtml = rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .substring(0, 45000);

    await logEvent(
      `DOM Harvested: ${Math.round(rawHtml.length / 1024)}KB processed.`,
      'success',
    );

    // 4. NEURAL SYNTHESIS (GEMINI-1.5-PRO)
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') ?? '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    await logEvent('Activating Pro-tier Neural Mapping...', 'warn');

    const prompt = `
      Act as the Titan-2 Extraction Engine. 
      Analyze the HTML and return a valid JSON object matching this schema: ${JSON.stringify(body.target_schema)}.
      
      RULES:
      - Return ONLY raw JSON.
      - Map data points to keys accurately.
      - If missing, use null.
      - For arrays, extract all repeating elements.

      HTML SOURCE:
      ${sanitizedHtml}
    `;

    const result = await model.generateContent(prompt);
    const jsonString = result.response
      .text()
      .replace(/```json|```/g, '')
      .trim();
    const structuredData = JSON.parse(jsonString);

    // 5. LEDGER COMMITMENT
    const { error: dbError } = await supabase.from('extracted_data').insert({
      job_id: jobId,
      content_structured: structuredData,
      metadata: {
        engine: 'Titan-2',
        ver: '15.5',
        tokens: sanitizedHtml.length / 4,
      },
    });

    if (dbError) throw new Error(`LEDGER_FAULT: ${dbError.message}`);

    // 6. STATUS FINALIZATION
    await supabase
      .from('scraping_jobs')
      .update({ status: 'completed', last_run_at: new Date().toISOString() })
      .eq('id', jobId);

    await logEvent('Session successful. Data committed to ledger.', 'success');

    return new Response(
      JSON.stringify({ success: true, data: structuredData }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error: any) {
    const err = error.message;
    console.error('[TITAN_CRASH]', err);

    if (jobId) {
      await supabase
        .from('scraping_logs')
        .insert({
          job_id: jobId,
          user_id: userId,
          level: 'error',
          message: `CORE_FAULT: ${err}`,
        });
      await supabase
        .from('scraping_jobs')
        .update({ status: 'failed' })
        .eq('id', jobId);
    }

    return new Response(JSON.stringify({ error: err }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
