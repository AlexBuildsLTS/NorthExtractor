/**
 * ============================================================================
 * ⚡ TITAN-2 HEURISTIC EXTRACTION ENGINE (V8.5)
 * ============================================================================
 * Path: supabase/functions/scrape-engine/index.ts
 * FIXES:
 * - Resolved 'google-ai' resolver error by aligning with import_map.json.
 * - Standardized Deno imports using bare specifiers.
 * - Implemented high-fidelity log broadcasting for the System Terminal.
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
  target_schema: Record<string, string>;
  job_id: string;
  operator_id: string;
}

serve(async (req: Request) => {
  // 1. Handshake Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // 2. Environment Configuration
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const geminiKey = Deno.env.get('GEMINI_API_KEY') ?? '';

  const supabase = createClient(supabaseUrl, supabaseKey);

  let jobId: string | null = null;
  let userId: string | null = null;

  try {
    const body: ExtractionPayload = await req.json();
    jobId = body.job_id;
    userId = body.operator_id;

    // 3. BROADCAST: Initialization
    await supabase.from('scraping_logs').insert({
      job_id: jobId,
      user_id: userId,
      level: 'info',
      message: `Titan-2 Engine Active: Establishing link to ${body.url}...`,
    });

    // 4. FETCH & SANITIZE HTML
    const response = await fetch(body.url, {
      headers: {
        'User-Agent': 'NorthExtractor/1.0 (Enterprise Suite)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(
        `CONNECTION_FAILED: Target host returned status ${response.status}`,
      );
    }

    const rawHtml = await response.text();

    // Broadcast Payload Size
    await supabase.from('scraping_logs').insert({
      job_id: jobId,
      user_id: userId,
      level: 'success',
      message: `Payload received: ${Math.round(rawHtml.length / 1024)}KB of source HTML.`,
    });

    // Optimization: Strip heavy DOM nodes before AI processing
    const cleanHtml = rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
      .substring(0, 18000);

    // 5. AI SYNTHESIS (TITAN-2 CORE)
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    await supabase.from('scraping_logs').insert({
      job_id: jobId,
      user_id: userId,
      level: 'warn',
      message: `Running neural extraction on cleaned DOM...`,
    });

    const prompt = `
      Act as an elite data extraction agent. 
      Analyze the HTML and return a JSON object matching this schema: ${JSON.stringify(body.target_schema)}.
      
      RULES:
      - Return ONLY raw JSON.
      - Use null for missing fields.
      - Do not include markdown blocks.

      HTML SOURCE:
      ${cleanHtml}
    `;

    const result = await model.generateContent(prompt);
    const jsonOutput = result.response
      .text()
      .replace(/```json|```/g, '')
      .trim();
    const structuredData = JSON.parse(jsonOutput);

    // 6. PERSISTENCE LAYER
    const { error: dbError } = await supabase.from('extracted_data').insert({
      job_id: jobId,
      content_structured: structuredData,
      metadata: { engine: 'Titan-2', ver: '8.5' },
    });

    if (dbError) throw new Error(`LEDGER_COMMIT_FAILURE: ${dbError.message}`);

    // 7. STATUS FINALIZATION
    await supabase
      .from('scraping_jobs')
      .update({ status: 'completed', last_run_at: new Date().toISOString() })
      .eq('id', jobId);

    await supabase.from('scraping_logs').insert({
      job_id: jobId,
      user_id: userId,
      level: 'success',
      message: `Extraction successful. Data committed to Core Ledger.`,
    });

    return new Response(
      JSON.stringify({ success: true, data: structuredData }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : 'Internal Node Fault';
    console.error('[TITAN_CRASH]', err);

    if (jobId) {
      await supabase.from('scraping_logs').insert({
        job_id: jobId,
        user_id: userId,
        level: 'error',
        message: `SYSTEM FAULT: ${err}`,
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
