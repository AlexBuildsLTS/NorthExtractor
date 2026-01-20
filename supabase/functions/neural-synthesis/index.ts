/**
 * ============================================================================
 * 🧠 TITAN-2 NEURAL SYNTHESIS CORE (V19.9 ELITE)
 * ============================================================================
 * Path: supabase/functions/neural-synthesis/index.ts
 * REPAIRS:
 * - Aligned with User's REST-style architecture.
 * - Added "Ledger Injection" to analyze scraped data.
 * - Enforced 200-OK Error handling for clean UI display.
 * ============================================================================
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  try {
    const { query, history } = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) throw new Error('MISSING_GEMINI_API_KEY_IN_VAULT');

    // 1. DATA HARVESTING: Pull the scraped intelligence from your ledger
    const { data: ledgerNodes } = await supabase
      .from('extracted_data')
      .select('content_structured, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    // 2. CONSTRUCT THE INTELLIGENCE PROMPT
    const systemInstructions = `
      You are the Titan-2 Intelligence Core. You have forensic access to the operator's extraction ledger.
      
      CURRENT LEDGER DATA:
      ${JSON.stringify(ledgerNodes)}

      Analyze the ledger objectively. Provide forensic insights. 
      If no data exists in the ledger, state: "NODE_DATA_NOT_FOUND".
    `;

    // 3. REST-STYLE FETCH (Matched to your preferred style)
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: `SYSTEM: ${systemInstructions}\n\nUSER_QUERY: ${query}` },
            ],
          },
        ],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
      }),
    });

    const data = await response.json();
    const aiText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || 'ANALYSIS_ABORTED';

    return new Response(
      JSON.stringify({ response: aiText, tokens: aiText.length / 4 }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Edge Error';
    return new Response(JSON.stringify({ response: `CORE_FAULT: ${msg}` }), {
      status: 200, // Return 200 so your chat UI doesn't crash but shows the error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
