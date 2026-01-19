import { serve } from "std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  try {
    const { url, target_schema, job_id } = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Fetch Page Content
    const response = await fetch(url);
    const html = await response.text();

    // 2. AI Extraction Logic
    const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY")!);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Extract data from this HTML matching this JSON schema: ${JSON.stringify(target_schema)}. Return ONLY valid JSON. HTML: ${html.substring(0, 20000)}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = JSON.parse(text.replace(/```json|```/g, ""));

    // 3. Update Database
    await supabase.from("extracted_data").insert({
      job_id,
      content_structured: cleanJson,
      metadata: { healed: false },
    });

    await supabase
      .from("scraping_jobs")
      .update({ status: "completed" })
      .eq("id", job_id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
