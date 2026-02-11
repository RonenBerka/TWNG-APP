// supabase/functions/analyze-guitar/index.ts
// Supabase Edge Function — Analyzes guitar photos using Claude Vision API
// Deploy: supabase functions deploy analyze-guitar
// Secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ANALYSIS_PROMPT = `You are a world-class guitar identification expert with encyclopedic knowledge of electric, acoustic, and bass guitars from every era and manufacturer — including boutique builders, small-batch makers, and relic/reproduction specialists.

Analyze the provided guitar photo(s) and identify the instrument as precisely as possible.

## CRITICAL: HEADSTOCK TEXT IS THE #1 IDENTIFIER

STOP and carefully read ANY text on the headstock FIRST. The headstock logo/text is the single most reliable identifier and OVERRIDES all body shape assumptions. Many boutique builders deliberately replicate classic body shapes (Strat, Tele, Les Paul, SG, etc.) — the headstock text is what distinguishes them from the original brands.

TEXT READING INSTRUCTIONS: Headstock text may be oriented vertically, diagonally, upside down, or along the edge of the neck. Some brands (notably Nash/Nashguitars) print their logo VERTICALLY along the headstock face or running down the side. Look at ALL text in ALL orientations — not just horizontal. If you see text that reads "Nashguitars", "Nash", "Suhr", "Anderson", "K-Line", or any other brand name, that IS the brand — regardless of how similar the body looks to a Fender or Gibson. Zoom into the headstock area and read every character carefully.

IDENTIFICATION PRIORITY ORDER:
1. **HEADSTOCK TEXT/LOGO** — Read EVERY word. If the headstock says "Nashguitars", the brand is Nash, NOT Fender. If it says "Suhr", the brand is Suhr, NOT Fender. The headstock text is ALWAYS the definitive brand identifier.
2. **HEADSTOCK SHAPE** — Even without readable text, headstock shape narrows the brand (6-in-line vs 3+3, pointed vs rounded, etc.)
3. **BODY SHAPE** — Use ONLY to identify the model style (Strat-style, LP-style, Tele-style, etc.), NEVER to assume the brand.
4. **PICKUPS & HARDWARE** — Pickup types, bridge style, control layout, knobs.
5. **FINISH & AGING** — Color, burst pattern, binding, aging/relicing (heavy relicing may indicate boutique builder).
6. **SERIAL NUMBER** — If visible, note it for verification.

## BOUTIQUE / REPRODUCTION BUILDERS — MUST RECOGNIZE

These builders make guitars that closely resemble Fender, Gibson, or other classic designs. If headstock text matches ANY of these, use the correct brand — NEVER default to Fender/Gibson:

**Fender-style builders (Strat/Tele/Jazzmaster shapes):**
- Nash Guitars (headstock reads "Nashguitars" or "Nash") — Olympia, WA. Models: S-63, S-57, T-63, T-52, JM-63, etc. Known for heavy aging/relicing.
- Suhr — Lake Elsinore, CA. Models: Classic S, Classic T, Standard, Modern.
- Tom Anderson — Newbury Park, CA. Models: Drop Top, Classic, Hollow Drop Top.
- K-Line — Springfield, MO. Models: Springfield, Springfield S, Truxton.
- LSL Instruments — Los Angeles, CA. Models: Saticoy, Silverlake.
- Haar Guitars — Netherlands. Traditional S and T style.
- Danocaster — Nashville, TN. Strat and Tele style reproductions.
- Melancon — Thibodaux, LA. Models: Pro Artist, Custom Artist.
- Don Grosh — Broomfield, CO. Models: ElectraJet, NOS Retro, Bent Top.
- RS Guitarworks — Winchester, KY. Models: Slab, Tele, Old Friend.
- Fano — Fleetwood, PA. Models: SP6, JM6, TC6. Known for alt-design aesthetic.
- Novo — Dennis Fano's newer brand. Models: Serus S, Serus T, Solus.
- Asher Guitars — Los Angeles, CA. T-style guitars.
- Palir — Pennsylvania. Strat and Tele reproductions.
- Macmull — Portugal. S-Classic, T-Classic.
- Mario Guitars — Nashville, TN. S and T style.
- Waterslide Guitars — Budget relic Strat/Tele style.

**Gibson-style builders (LP/SG/335 shapes):**
- Heritage — Kalamazoo, MI (original Gibson factory). Models: H-150, H-535, H-530.
- Knaggs — Greensboro, MD. Models: Kenai, Severn, Chesapeake.
- Nik Huber — Rodgau, Germany. Models: Dolphin, Orca, Krautster.
- Collings — Austin, TX. Models: City Limits, CL, I-35, 290.
- Eastman — Beijing/Pomona. Models: SB59, T486, AR372CE.

**Other boutique makers to recognize:**
- PRS (Paul Reed Smith), Kiesel/Carvin, Reverend, Rivolta, Duesenberg, Hagstrom, Italia, Gordon Smith, Patrick James Eggle, Vigier, Caparison, Mayones, Strandberg.

## RELICING / AGING AWARENESS

If a guitar shows heavy wear/aging but looks "too perfect" in its distressing pattern, it's likely a BOUTIQUE RELIC BUILD (Nash, Fano, Danocaster, etc.) rather than a genuinely old vintage instrument. Note this in the "notes" field.

## SPEC KNOWLEDGE

After identifying the guitar, use your knowledge of that specific brand and model to fill in ALL specification fields — not just what's visible in the photo. For example:
- Nash S-63: alder body, maple neck, rosewood fretboard, SSS pickups (Lollar or similar), vintage tremolo, 25.5" scale, 21 frets
- Heritage H-150: mahogany body with maple top, mahogany neck, rosewood fretboard, HH pickups, 24.75" scale, 22 frets, TonePros bridge
- Suhr Classic S: alder or ash body, maple neck, various fretboard woods, SSS/HSS pickups, 25.5" scale, 22 frets

Fill in known specs with appropriate confidence levels based on how certain you are of the specific model variant.

Return ONLY a valid JSON object (no markdown, no backticks, no explanation) with this exact structure:
{
  "confidence": <overall confidence 0.0-1.0>,
  "brand": { "value": "<brand name>", "confidence": <0.0-1.0> },
  "model": { "value": "<specific model name>", "confidence": <0.0-1.0> },
  "year": { "value": "<year or year range like 2020-2024>", "confidence": <0.0-1.0> },
  "country": { "value": "<country of manufacture>", "confidence": <0.0-1.0> },
  "bodyType": { "value": "<Solid Body|Semi-Hollow|Hollow Body|Acoustic|Classical|Bass|12-String>", "confidence": <0.0-1.0> },
  "finish": { "value": "<finish/color description>", "confidence": <0.0-1.0> },
  "color": { "value": "<primary color name>", "confidence": <0.0-1.0> },
  "topWood": { "value": "<top wood or N/A>", "confidence": <0.0-1.0> },
  "bodyWood": { "value": "<body wood>", "confidence": <0.0-1.0> },
  "neckWood": { "value": "<neck wood>", "confidence": <0.0-1.0> },
  "fretboardWood": { "value": "<fretboard/fingerboard wood>", "confidence": <0.0-1.0> },
  "neckProfile": { "value": "<neck profile shape, e.g. C, D, V, slim taper, 60s>", "confidence": <0.0-1.0> },
  "scaleLength": { "value": "<scale length in inches, e.g. 24.75, 25.5>", "confidence": <0.0-1.0> },
  "frets": { "value": "<number of frets, e.g. 22, 24>", "confidence": <0.0-1.0> },
  "pickupConfig": { "value": "<pickup configuration, e.g. HH, HSS, SSS, HSH, P90>", "confidence": <0.0-1.0> },
  "pickups": { "value": "<specific pickup names/models>", "confidence": <0.0-1.0> },
  "controls": { "value": "<controls description, e.g. 2V 2T 3-way toggle>", "confidence": <0.0-1.0> },
  "bridge": { "value": "<bridge type/model>", "confidence": <0.0-1.0> },
  "bridgeType": { "value": "<Fixed|Tremolo|Bigsby|Floyd Rose|Wrap-around|Tune-o-matic>", "confidence": <0.0-1.0> },
  "tuners": { "value": "<tuner type/brand>", "confidence": <0.0-1.0> },
  "nutMaterial": { "value": "<nut material, e.g. Bone, TUSQ, Plastic, Graph Tech>", "confidence": <0.0-1.0> },
  "hardwareFinish": { "value": "<Chrome|Nickel|Gold|Black|Aged Nickel|Satin>", "confidence": <0.0-1.0> },
  "notes": "<detailed paragraph explaining identification reasoning: what visual cues were used, headstock text reading, body shape analysis, hardware details, finish characteristics, and any caveats about the identification>",
  "alternatives": [
    {
      "brand": "<alternative brand>",
      "model": "<alternative model>",
      "confidence": <0.0-1.0>,
      "reason": "<why this could also be the guitar>"
    }
  ]
}

## ALTERNATIVES — REQUIRED

You MUST always provide 2-4 alternative identifications in the "alternatives" array, even if you are very confident in the primary ID. Think about:
- Similar models from the same brand (e.g., if main is "Custom Shop 1951 Nocaster", alternatives could be "Custom Shop 1952 Telecaster Heavy Relic")
- Same body style from boutique builders (e.g., if main is "Fender Telecaster", an alternative could be "Nash Guitars T-52")
- Different year ranges or variants of the same model
- If the guitar is clearly a Fender/Gibson, still consider boutique builders that replicate the style
- Order alternatives by confidence (highest first)
- Each alternative should be meaningfully different from the primary identification`;

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  if (!ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { photoUrls, photoBase64 } = body;

    const hasUrls = photoUrls && Array.isArray(photoUrls) && photoUrls.length > 0;
    const hasBase64 = photoBase64 && Array.isArray(photoBase64) && photoBase64.length > 0;

    if (!hasUrls && !hasBase64) {
      return new Response(
        JSON.stringify({ error: "No photos provided (send photoUrls or photoBase64)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build image content for Claude Vision
    const imageContent: Array<{
      type: "image";
      source: { type: "base64"; media_type: string; data: string };
    }> = [];

    // Method 1: Fetch from URLs
    if (hasUrls) {
      for (const url of photoUrls.slice(0, 5)) {
        try {
          const imgResponse = await fetch(url);
          if (!imgResponse.ok) continue;

          const imgBuffer = await imgResponse.arrayBuffer();
          const bytes = new Uint8Array(imgBuffer);

          let binary = "";
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64 = btoa(binary);
          const contentType = imgResponse.headers.get("content-type") || "image/jpeg";

          imageContent.push({
            type: "image",
            source: { type: "base64", media_type: contentType, data: base64 },
          });
        } catch (imgErr) {
          console.error(`Failed to fetch image: ${url}`, imgErr);
        }
      }
    }

    // Method 2: Use base64 data directly (fallback when Storage is unavailable)
    if (hasBase64 && imageContent.length === 0) {
      for (const b64str of photoBase64.slice(0, 5)) {
        try {
          // b64str format: "data:image/jpeg;base64,/9j/4AAQ..."
          const match = b64str.match(/^data:(image\/\w+);base64,(.+)$/);
          if (match) {
            imageContent.push({
              type: "image",
              source: { type: "base64", media_type: match[1], data: match[2] },
            });
          }
        } catch (b64Err) {
          console.error("Failed to parse base64 image:", b64Err);
        }
      }
    }

    if (imageContent.length === 0) {
      return new Response(
        JSON.stringify({ error: "Could not load any of the provided images" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PASS 1: Headstock text reading — fast, focused pass to read brand text
    const HEADSTOCK_PROMPT = `Look at the guitar photo(s). Focus ONLY on the headstock area (top of the neck where tuners are). Read ALL text visible on the headstock — brand name, model name, any words. Text may be oriented vertically, diagonally, curved, or sideways. Common headstock brand texts include: Fender, Gibson, Nash, Nashguitars, Suhr, PRS, Tom Anderson, K-Line, LSL, Haar, Danocaster, Heritage, Epiphone, Squier, Gretsch, Ibanez, etc. Return ONLY a JSON object: {"headstock_text": ["word1", "word2"], "brand_read": "the brand name you read"}. If you cannot read any text, return {"headstock_text": [], "brand_read": "unknown"}.`;

    let headstockBrand = "unknown";
    try {
      const hsResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 256,
          messages: [{ role: "user", content: [...imageContent, { type: "text", text: HEADSTOCK_PROMPT }] }],
        }),
      });
      const hsResult = await hsResponse.json();
      const hsText = hsResult.content?.[0]?.text || "";
      try {
        const hsJson = JSON.parse(hsText.match(/\{[\s\S]*\}/)?.[0] || "{}");
        if (hsJson.brand_read && hsJson.brand_read !== "unknown") {
          headstockBrand = hsJson.brand_read;
          console.log("Headstock pass detected brand:", headstockBrand);
        }
      } catch { /* ignore parse errors */ }
    } catch (hsErr) {
      console.warn("Headstock pre-pass failed:", hsErr);
    }

    // PASS 2: Full analysis — include headstock reading result to anchor brand identification
    const brandHint = headstockBrand !== "unknown"
      ? `\n\nIMPORTANT: A preliminary headstock text scan detected the brand as "${headstockBrand}". Use this as your PRIMARY brand identification unless you have very strong evidence it is wrong. Do NOT override this with a body-shape guess.`
      : "";

    // Call Claude Vision API for full analysis
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 3000,
        messages: [
          {
            role: "user",
            content: [
              ...imageContent,
              { type: "text", text: ANALYSIS_PROMPT + brandHint },
            ],
          },
        ],
      }),
    });

    const claudeResult = await claudeResponse.json();

    if (claudeResult.error) {
      throw new Error(claudeResult.error.message || "Claude API error");
    }

    // Extract the text response
    const responseText = claudeResult.content?.[0]?.text;
    if (!responseText) {
      throw new Error("No response from Claude");
    }

    // Parse JSON from response — handle potential markdown wrapping
    let analysis;
    try {
      // Try direct parse first
      analysis = JSON.parse(responseText);
    } catch {
      // Try extracting JSON from markdown code block
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[1].trim());
      } else {
        // Try finding JSON object in the text
        const objMatch = responseText.match(/\{[\s\S]*\}/);
        if (objMatch) {
          analysis = JSON.parse(objMatch[0]);
        } else {
          throw new Error("Could not parse AI response as JSON");
        }
      }
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-guitar error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
