/**
 * ============================================================================
 * 🧠 TITAN-2 NEURAL EXTRACTION CORE (V19.0 INDUSTRIAL)
 * ============================================================================
 * Path: supabase/functions/scrape-engine/index.ts
 * FIXES:
 * - IMPORT_MAP_SYNC: Replaced HTTPS URLs with bare specifiers.
 * - LINT_STABILITY: Removed 'any' types for Deno compliance.
 * - MEMORY_LEAK: Added explicit error handling for DOM harvesting.
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

// Define explicit type to replace 'any'
interface ScraperError {
  message: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const { url, job_id, operator_id, target_schema } = await req.json();

    // 1. Ignition Log
    await supabase.from('scraping_logs').insert({
      job_id,
      user_id: operator_id,
      level: 'info',
      message: `[TITAN] Igniting: ${url}`,
    });

    // 2. Fetch and Clean DOM
    const resp = await fetch(url);
    const rawHtml = await resp.text();
    const cleanHtml = rawHtml
      .replace(/<script.*?<\/script>|<style.*?<\/style>/gs, '')
      .substring(0, 40000);

    // 3. Neural Synthesis
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const prompt = `Return ONLY JSON matching schema: ${JSON.stringify(target_schema)}. SOURCE: ${cleanHtml}`;

    const result = await model.generateContent(prompt);
    const structuredData = JSON.parse(
      result.response.text().replace(/```json|```/g, ''),
    );

    // 4. Ledger Commitment
    await supabase
      .from('extracted_data')
      .insert({ job_id, content_structured: structuredData });
    await supabase
      .from('scraping_jobs')
      .update({ status: 'completed' })
      .eq('id', job_id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const error = err as ScraperError;
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
