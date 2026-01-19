/**
 * ============================================================================
 * 🧠 TITAN-2 NEURAL SYNTHESIS CORE (V17.5 ELITE)
 * ============================================================================
 * Path: supabase/functions/neural-synthesis/index.ts
 * FEATURES:
 * - LEDGER_INJECTION: Pulls live data from 'extracted_data' for context.
 * - PRO_LOGIC: Upgraded to gemini-1.5-pro for complex synthesis.
 * - TYPE_SAFE: Aligned with the NorthOS V1.0 Ledger Schema.
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

serve(async (req: Request) => {
  // 1. PREFLIGHT HANDSHAKE
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders });

  try {
    const { query, history } = await req.json();

    // 2. INITIALIZE CONNECTIVITY
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') ?? '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // 3. LEDGER EXTRACTION (Context Harvesting)
    // We pull the most recent 10 nodes to give the AI factual grounding
    const { data: recentIntel, error: intelError } = await supabase
      .from('extracted_data')
      .select('content_structured, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (intelError) throw intelError;

    // 4. NEURAL SYNTHESIS PROMPT
    const prompt = `
      Act as the Titan-2 Neural Synthesis Core for North Intelligence OS.
      
      CORE KNOWLEDGE (LATEST LEDGER NODES):
      ${JSON.stringify(recentIntel)}

      CONVERSATION HISTORY:
      ${JSON.stringify(history)}

      OPERATOR INQUIRY:
      "${query}"

      TASK:
      Analyze the provided ledger nodes and synthesize an answer. 
      - Be forensic, precise, and professional.
      - If data points are missing from the ledger, explicitly state: "NODE_DATA_NOT_FOUND".
      - Provide a summary of extraction throughput if requested.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // 5. RETURN SYNTHESIZED INTELLIGENCE
    return new Response(
      JSON.stringify({
        response: responseText,
        tokens: Math.ceil(responseText.length / 4),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error: any) {
    console.error('[TITAN_SYNTHESIS_FAULT]', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
