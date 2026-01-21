import { serve } from "std/http/server.ts";
import { createClient } from "supabase";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

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

    const context = nodes && nodes.length > 0
        ? `LEDGER_DATA: ${JSON.stringify(nodes)}`
        : 'LEDGER_STATUS: EMPTY.';

    const systemPrompt = `
      ROLE: Titan OS Intelligence.
      CONTEXT: Analyzing web-scraped data.
      DATA: ${context}
      INSTRUCTION: Answer based on the data.
    `;

    const apiResp = await fetch(
      `${GEMINI_URL}?key=${Deno.env.get('GEMINI_API_KEY')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUSER: ${query}` }] }]
        }),
      },
    );

    const geminiData = await apiResp.json();
    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'FAIL: Neural Timeout.';

    if (job_id && aiResponse !== 'FAIL') {
      await supabase.from('ai_insights').insert({
        data_id: nodes?.[0]?.job_id || null,
        user_id: (await supabase.auth.getUser(req.headers.get('Authorization')?.split(' ')[1] || '')).data.user?.id,
        task_type: 'context_analysis',
        insight_text: aiResponse,
        confidence_score: 0.95,
      });
    }

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ response: `ERROR: ${err.message}` }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});