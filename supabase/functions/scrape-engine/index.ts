import { serve } from "std/http/server.ts";
import { createClient } from "supabase";
import { GoogleGenerativeAI } from "google-ai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * APEXSCRAPE: TITAN-V60 EXTRACTION CORE
 * Purpose: Harvests raw web content, cleans DOM noise, and initiates AI translation.
 */
serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const { url, job_id, operator_id, target_schema } = await req.json();

    if (!url || !job_id) {
      throw new Error("Missing critical parameters: url or job_id");
    }

    // 1. DISPATCH LOG: Starting engagement
    await supabase.from("scraping_logs").insert({
      job_id,
      user_id: operator_id,
      level: "info",
      message: `[TITAN-V60] Engaging Target: ${url}`,
      metadata: { target_url: url }
    });

    // 2. STATUS UPDATE: Running
    await supabase.from("scraping_jobs").update({ status: "running" }).eq("id", job_id);

    // 3. DOM HARVESTING: Fetching content with browser-like headers
    const resp = await fetch(url, {
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) ApexScrape/1.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
      },
    });

    if (!resp.ok) throw new Error(`Target unreachable. Status: ${resp.status}`);
    
    const rawHtml = await resp.text();

    // 4. CLEANING: Remove scripts, styles, and comments to reduce AI token costs
    const cleanHtml = rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "") // Remove HTML comments
      .replace(/\s\s+/g, ' ')
      .substring(0, 50000); // Constraint for Gemini context limits

    // 5. NEURAL SYNTHESIS: Use Gemini to translate HTML to Structured JSON
    const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY")!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `
      ACT AS: Expert Web Data Extraction Engine.
      TASK: Extract data from the provided HTML into a valid JSON object.
      SCHEMA: ${JSON.stringify(target_schema)}
      SOURCE HTML: ${cleanHtml}
      
      RULES:
      1. Return ONLY raw JSON. No markdown backticks.
      2. If a field is not found, return null.
      3. Maintain strict data types as per schema.
    `;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    
    // Clean potential markdown blocks
    const cleanJsonString = textResponse.replace(/```json|```/g, "").trim();
    const structuredData = JSON.parse(cleanJsonString);

    // 6. PERSISTENCE & COMPLETION
    const { error: insertError } = await supabase
      .from("extracted_data")
      .insert({ 
        job_id, 
        content_structured: structuredData,
        metadata: { source: url, extraction_engine: "Titan-V60" }
      });

    if (insertError) throw insertError;

    await supabase
      .from("scraping_jobs")
      .update({ status: "completed", last_run_at: new Date().toISOString() })
      .eq("id", job_id);

    await supabase.from("scraping_logs").insert({
      job_id,
      user_id: operator_id,
      level: "success",
      message: `[TITAN] Node Sync Successful. Data extracted for ${url}`,
    });

    return new Response(JSON.stringify({ success: true, data: structuredData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    // Fail-safe Error Logging
    console.error("Scrape Engine Fault:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 200, // Return 200 to allow client-side error handling via response body
      headers: corsHeaders,
    });
  }
});