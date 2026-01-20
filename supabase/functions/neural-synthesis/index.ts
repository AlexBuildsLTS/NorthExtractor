import { serve } from "std/http/server.ts";
import { createClient } from "supabase";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

/**
 * APEXSCRAPE: NEURAL SYNTHESIS CORE
 * Purpose: Aggregates harvested nodes and provides context-aware AI intelligence.
 */
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const { query, job_id } = await req.json();

    // 1. DATA AGGREGATION: Pull context from the ledger
    // If job_id is provided, focus on that job. Otherwise, pull latest 5 nodes.
    let queryBuilder = supabase
      .from('extracted_data')
      .select('content_structured, created_at, job_id')
      .order('created_at', { ascending: false });

    if (job_id) {
      queryBuilder = queryBuilder.eq('job_id', job_id);
    } else {
      queryBuilder = queryBuilder.limit(10);
    }

    const { data: nodes, error: nodeError } = await queryBuilder;

    if (nodeError) throw nodeError;

    const context =
      nodes && nodes.length > 0
        ? `LEDGER_DATA: ${JSON.stringify(nodes)}`
        : 'LEDGER_STATUS: EMPTY. No recent extractions found.';

    // 2. AI PROCESSING: Engage Google Gemini
    const systemPrompt = `
      ROLE: Titan OS Core Intelligence.
      CONTEXT: You are analyzing a ledger of web-scraped data harvested by the Scrape Engine.
      DATA_SET: ${context}
      
      INSTRUCTIONS:
      - Provide insights based strictly on the LEDGER_DATA.
      - If data is missing, explain what kind of scrape is needed.
      - Use a precise, technical, yet helpful tone.
    `;

    const apiResp = await fetch(
      `${GEMINI_URL}?key=${Deno.env.get('GEMINI_API_KEY')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUSER_QUERY: ${query}` }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      },
    );

    const geminiData = await apiResp.json();

    if (geminiData.error) {
      throw new Error(`Gemini API Error: ${geminiData.error.message}`);
    }

    const aiResponse =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      'FAIL: Neural link timed out.';

    // 3. PERSIST INSIGHT: Store the generated intelligence
    if (job_id && aiResponse !== 'FAIL') {
      await supabase.from('ai_insights').insert({
        data_id: nodes?.[0]?.job_id || null, // Link to newest node
        user_id: (
          await supabase.auth.getUser(
            req.headers.get('Authorization')?.split(' ')[1] || '',
          )
        ).data.user?.id,
        task_type: 'context_analysis',
        insight_text: aiResponse,
        confidence_score: 0.95,
      });
    }

    return new Response(
      JSON.stringify({ response: aiResponse, tokens: aiResponse.length / 4 }),
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

