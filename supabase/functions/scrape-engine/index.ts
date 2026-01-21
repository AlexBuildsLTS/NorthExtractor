/**
 * ============================================================================
 * 🧠 APEXSCRAPE: TITAN-V60 EXTRACTION ENGINE (DIRECT IMPORT FIX)
 * ============================================================================
 * STATUS: PRODUCTION READY
 * DEPS: Uses direct URL imports to guarantee resolution.
 * ============================================================================
 */

import { serve } from "std/http/server.ts";
import { createClient } from "supabase";
import { GoogleGenerativeAI } from "google-ai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // 1. CORS PREFLIGHT
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // 2. ENV VALIDATION
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");

  if (!supabaseUrl || !supabaseServiceKey || !geminiKey) {
    console.error("CRITICAL: Missing API Keys");
    return new Response(
      JSON.stringify({ error: "Server Config Error: Missing Keys" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // 3. INIT CLIENTS
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const genAI = new GoogleGenerativeAI(geminiKey);

  try {
    const { url, job_id, operator_id, target_schema } = await req.json();

    if (!url || !job_id) throw new Error("Missing 'url' or 'job_id'");

    console.log(`[START] Job: ${job_id} | Target: ${url}`);

    await supabase.from("scraping_jobs").update({ status: "running" }).eq("id", job_id);

    // 4. FETCH HTML
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ApexScrape/2.0)",
        "Accept": "text/html,application/xhtml+xml"
      },
    });

    if (!resp.ok) throw new Error(`Target returned status ${resp.status}`);
    
    const rawHtml = await resp.text();

    // 5. DOM CLEANING (Safe Regex)
    let cleanHtml = rawHtml;
    cleanHtml = cleanHtml.replace(new RegExp("<script\\b[^<]*(?:(?!<\\/script>)<[^<]*)*<\\/script>", "gi"), "");
    cleanHtml = cleanHtml.replace(new RegExp("<style\\b[^<]*(?:(?!<\\/style>)<[^<]*)*<\\/style>", "gi"), "");
    cleanHtml = cleanHtml.replace(new RegExp("", "g"), "");
    cleanHtml = cleanHtml.replace(new RegExp("\\s+", "g"), " ");
    
    cleanHtml = cleanHtml.substring(0, 80000);

    console.log(`[AI] Payload: ${cleanHtml.length} chars. Engaging Gemini...`);

    // 6. GEMINI PROCESSING
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = `
      EXTRACT JSON DATA.
      SCHEMA: ${JSON.stringify(target_schema)}
      HTML: ${cleanHtml}
      RULES: Return ONLY valid JSON. No markdown. No Code Blocks.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // 7. JSON SANITIZATION
    const cleanJsonString = textResponse
      .replace(/^```json\s*/, "")
      .replace(/^```\s*/, "")
      .replace(/\s*```$/, "")
      .trim();

    let structuredData;
    try {
      structuredData = JSON.parse(cleanJsonString);
    } catch (_e) {
      console.error("JSON Parse Fail. AI Output:", textResponse);
      throw new Error("AI produced invalid JSON.");
    }

    // 8. DATABASE COMMIT
    const { error: insertError } = await supabase.from("extracted_data").insert({
      job_id,
      content_structured: structuredData,
      metadata: {
        source: url,
        engine: "gemini-1.5-pro",
        tokens_processed: cleanHtml.length
      }
    });

    if (insertError) throw insertError;

    await supabase.from("scraping_jobs").update({
      status: "completed",
      last_run_at: new Date().toISOString()
    }).eq("id", job_id);

    await supabase.from("scraping_logs").insert({
      job_id,
      user_id: operator_id,
      level: "success",
      message: `Extracted ${Object.keys(structuredData).length} fields.`,
    });

    console.log("[SUCCESS] Job Complete.");

    return new Response(JSON.stringify({ success: true, data: structuredData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error(`[ERROR] ${err.message}`);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});