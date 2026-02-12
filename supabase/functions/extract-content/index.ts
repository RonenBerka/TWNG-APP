import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Types
interface GuitarIdentity {
  brand: string;
  model: string;
  year: number | null;
  year_range: string;
  serial_number: string;
  finish: string;
  category: string;
  production_status: "current" | "discontinued" | "limited_edition" | "custom_shop";
  context: string;
  _famous_owner?: string;
  _nickname?: string;
  _notable_events?: string[];
  _ownership_history?: string[];
  _modification_history?: string[];
}

interface IdentifyPhaseResponse {
  guitars: GuitarIdentity[];
  source_type: "article" | "video" | "social_media" | "user_text" | "mixed";
  original_text: string;
  summary: string;
  error?: string;
}

interface EnrichPhaseResponse {
  body_style: string;
  instrument_type: string;
  finish: string;
  finish_options: string[];
  specifications: Record<string, unknown>;
  story: string;
  _images: string[];
  extraction_confidence: "high" | "medium" | "low";
  fields_requiring_verification: string[];
}

interface SeedGuitarRow {
  brand: string;
  model: string;
  year: number | null;
  year_range: string;
  serial_number: string;
  finish: string;
  category: string;
  production_status: string;
  context: string;
  body_style: string;
  instrument_type: string;
  finish_options: string[];
  specifications: Record<string, unknown>;
  story: string;
  _images: string[];
  extraction_confidence: string;
  fields_requiring_verification: string[];
  dedup_fingerprint: string;
  source: string;
  _famous_owner?: string;
  _nickname?: string;
  _notable_events?: string[];
  _ownership_history?: string[];
  _modification_history?: string[];
}

interface RequestBody {
  url?: string;
  textContent?: string;
  phase: "full" | "identify" | "enrich";
  guitars?: GuitarIdentity[];
}

// Initialize Anthropic client
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
if (!ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY not set");
}

// Initialize Supabase client
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Supabase credentials not configured");
}

const supabase = createClient(SUPABASE_URL || "", SUPABASE_SERVICE_ROLE_KEY || "");

// Phase 1: Identify guitars in content
async function identifyGuitars(content: string): Promise<IdentifyPhaseResponse> {
  console.log("Starting Phase 1: Identify guitars");

  const systemPrompt = `You are a guitar identification API. Extract guitar identities from provided content.
RULES:
- Respond with ONLY valid JSON
- Capture the FULL narrative/story from the original content
- If no guitars found, return: {"guitars":[],"error":"reason"}

RESPOND WITH:
{
  "guitars": [
    {
      "brand": "", "model": "", "year": null, "year_range": "",
      "serial_number": "", "finish": "", "category": "",
      "production_status": "current|discontinued|limited_edition|custom_shop",
      "context": "THE COMPLETE NARRATIVE",
      "_famous_owner": "", "_nickname": "",
      "_notable_events": [], "_ownership_history": [], "_modification_history": []
    }
  ],
  "source_type": "article|video|social_media|user_text|mixed",
  "original_text": "preserved verbatim",
  "summary": "one line"
}`;

  const userPrompt = `Extract all guitars mentioned in this content:\n\n${content}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Anthropic API error:", error);
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();
  const textContent = data.content[0].text;

  // Parse JSON response
  const jsonMatch = textContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("Could not extract JSON from response:", textContent);
    throw new Error("Invalid JSON response from identification phase");
  }

  const result: IdentifyPhaseResponse = JSON.parse(jsonMatch[0]);
  console.log(`Identified ${result.guitars.length} guitars`);
  return result;
}

// Phase 2: Enrich guitar with specs and story
async function enrichGuitar(guitar: GuitarIdentity, originalContent: string): Promise<EnrichPhaseResponse> {
  console.log(`Enriching guitar: ${guitar.brand} ${guitar.model}`);

  const systemPrompt = `You are a guitar specialist with access to web search. For the provided guitar:
1. Search web for complete factory specifications
2. Write a 150-500 word narrative story centered on the owner's experience and the guitar's history

RESPOND WITH ONLY VALID JSON:
{
  "body_style": "", "instrument_type": "", "finish": "",
  "finish_options": [],
  "specifications": { full specs object with _confidence and _spec_sources fields },
  "story": "narrative",
  "_images": [],
  "extraction_confidence": "high|medium|low",
  "fields_requiring_verification": []
}`;

  const userPrompt = `Guitar to enrich:
Brand: ${guitar.brand}
Model: ${guitar.model}
Year: ${guitar.year || guitar.year_range}
Serial: ${guitar.serial_number}
Finish: ${guitar.finish}
Context: ${guitar.context}

Original content for reference:
${originalContent}

Search for factory specs and write the narrative based on the owner's experience mentioned in the content.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Anthropic API error in enrich:", error);
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();
  const textContent = data.content[0].text;

  // Parse JSON response
  const jsonMatch = textContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("Could not extract JSON from enrich response:", textContent);
    throw new Error("Invalid JSON response from enrichment phase");
  }

  const result: EnrichPhaseResponse = JSON.parse(jsonMatch[0]);
  console.log(`Enriched guitar: ${guitar.brand} ${guitar.model}`);
  return result;
}

// Generate dedup fingerprint
function generateDedupFingerprint(guitar: GuitarIdentity): string {
  const brand = (guitar.brand || "unknown").toLowerCase().trim();
  const model = (guitar.model || "unknown").toLowerCase().trim();
  const year = guitar.year ? guitar.year.toString() : (guitar.year_range || "unknown").toLowerCase().trim();
  return `${brand}|${model}|${year}`;
}

// Insert guitar into seed_guitars table
async function insertSeedGuitar(guitarRow: SeedGuitarRow): Promise<void> {
  console.log(`Inserting guitar: ${guitarRow.brand} ${guitarRow.model}`);

  const { data, error } = await supabase.from("seed_guitars").insert([guitarRow]).select();

  if (error) {
    console.error("Supabase insert error:", error);
    throw new Error(`Failed to insert guitar: ${error.message}`);
  }

  console.log("Successfully inserted guitar:", data);
}

// Main handler
serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    const body = await req.json();
    console.log("Request received:", { hasPhase: !!body.phase, hasSystem: !!body.system, hasUrl: !!body.url, hasText: !!body.textContent });

    // === PROXY MODE: Frontend sends {system, user_message} → call Claude and return response ===
    if (body.system && body.user_message) {
      console.log("Proxy mode: forwarding to Claude API");

      if (!ANTHROPIC_API_KEY) {
        return new Response(
          JSON.stringify({ error: "ANTHROPIC_API_KEY not configured. Set it in Supabase Edge Functions secrets." }),
          { status: 500, headers: { "content-type": "application/json", ...corsHeaders } }
        );
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: body.system,
          messages: [{ role: "user", content: body.user_message }],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Claude API error (proxy):", errText);
        return new Response(
          JSON.stringify({ error: `Claude API error: ${response.statusText}`, details: errText }),
          { status: 502, headers: { "content-type": "application/json", ...corsHeaders } }
        );
      }

      const data = await response.json();
      const textContent = data.content?.[0]?.text || "";

      // Try to parse JSON from Claude's response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return new Response(JSON.stringify(parsed), {
            status: 200,
            headers: { "content-type": "application/json", ...corsHeaders },
          });
        } catch {
          // Return raw text if JSON parse fails
          return new Response(JSON.stringify({ result: textContent }), {
            status: 200,
            headers: { "content-type": "application/json", ...corsHeaders },
          });
        }
      }

      return new Response(JSON.stringify({ result: textContent }), {
        status: 200,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    // === STRUCTURED MODE: {phase, url, textContent, guitars} ===

    // Validate input
    if (!body.textContent && !body.url) {
      return new Response(
        JSON.stringify({ error: "Either textContent or url must be provided" }),
        {
          status: 400,
          headers: { "content-type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!["full", "identify", "enrich"].includes(body.phase)) {
      return new Response(JSON.stringify({ error: "Invalid phase. Must be 'full', 'identify', or 'enrich'" }), {
        status: 400,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    // Prepare content
    let contentToAnalyze = "";
    if (body.textContent) {
      contentToAnalyze += body.textContent;
    }
    if (body.url) {
      contentToAnalyze += `\n\nURL Source: ${body.url}`;
    }

    let identifiedGuitars: GuitarIdentity[] = [];
    let identifyResult: IdentifyPhaseResponse | null = null;

    // Phase 1: Identify
    if (body.phase === "full" || body.phase === "identify") {
      identifyResult = await identifyGuitars(contentToAnalyze);
      identifiedGuitars = identifyResult.guitars || [];

      if (body.phase === "identify") {
        return new Response(JSON.stringify(identifyResult), {
          status: 200,
          headers: { "content-type": "application/json", ...corsHeaders },
        });
      }
    } else if (body.phase === "enrich") {
      if (!body.guitars || body.guitars.length === 0) {
        return new Response(JSON.stringify({ error: "guitars array required for enrich phase" }), {
          status: 400,
          headers: { "content-type": "application/json", ...corsHeaders },
        });
      }
      identifiedGuitars = body.guitars;
    }

    // Phase 2: Enrich and insert
    if (body.phase === "full" || body.phase === "enrich") {
      const results: SeedGuitarRow[] = [];
      let insertedCount = 0;

      for (const guitar of identifiedGuitars) {
        try {
          const enriched = await enrichGuitar(guitar, contentToAnalyze);

          const seedRow: SeedGuitarRow = {
            brand: guitar.brand,
            model: guitar.model,
            year: guitar.year,
            year_range: guitar.year_range,
            serial_number: guitar.serial_number,
            finish: guitar.finish,
            category: guitar.category,
            production_status: guitar.production_status,
            context: guitar.context,
            body_style: enriched.body_style,
            instrument_type: enriched.instrument_type,
            finish_options: enriched.finish_options,
            specifications: enriched.specifications,
            story: enriched.story,
            _images: enriched._images,
            extraction_confidence: enriched.extraction_confidence,
            fields_requiring_verification: enriched.fields_requiring_verification,
            dedup_fingerprint: generateDedupFingerprint(guitar),
            source: "content_extraction",
            _famous_owner: guitar._famous_owner,
            _nickname: guitar._nickname,
            _notable_events: guitar._notable_events,
            _ownership_history: guitar._ownership_history,
            _modification_history: guitar._modification_history,
          };

          results.push(seedRow);

          // Insert into database
          await insertSeedGuitar(seedRow);
          insertedCount++;
        } catch (error) {
          console.error(`Error enriching guitar ${guitar.brand} ${guitar.model}:`, error);
          // Continue with next guitar on error
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          guitars: results,
          inserted: insertedCount,
        }),
        {
          status: 200,
          headers: { "content-type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid phase" }), {
      status: 400,
      headers: { "content-type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Handler error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An error occurred",
      }),
      {
        status: 500,
        headers: { "content-type": "application/json", ...corsHeaders },
      }
    );
  }
});
