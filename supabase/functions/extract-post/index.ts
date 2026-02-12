import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

function ok(data: unknown) {
  return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders });
}
function err(msg: string, status = 400) {
  return new Response(JSON.stringify({ error: msg }), { status, headers: corsHeaders });
}

// ── Source detection ─────────────────────────────────────────────────────────
function detectSource(url: string): "reddit" | "instagram" | "facebook" | "other" {
  try {
    const h = new URL(url).hostname.toLowerCase();
    if (h.includes("reddit.com") || h.includes("redd.it")) return "reddit";
    if (h.includes("instagram.com")) return "instagram";
    if (h.includes("facebook.com") || h.includes("fb.com")) return "facebook";
    return "other";
  } catch {
    return "other";
  }
}

// ── Fetchers ─────────────────────────────────────────────────────────────────

async function fetchRedditPost(url: string) {
  // Normalize: strip tracking params, ensure .json suffix
  let cleanUrl = url.split("?")[0].replace(/\/$/, "");
  // Use www.reddit.com (old.reddit can also 503)
  cleanUrl = cleanUrl.replace("old.reddit.com", "www.reddit.com");
  const jsonUrl = cleanUrl + ".json";

  const resp = await fetch(jsonUrl, {
    headers: {
      // Reddit requires this specific User-Agent format for their JSON API
      "User-Agent": "web:twng-guitar-app:v1.0 (by /u/twng_platform)",
      "Accept": "application/json",
    },
  });

  if (!resp.ok) throw new Error(`Reddit returned ${resp.status}`);

  const json = await resp.json();
  // Reddit returns an array — first element is the post listing, second is comments
  const listing = Array.isArray(json) ? json[0] : json;
  const post = listing?.data?.children?.[0]?.data;
  if (!post) throw new Error("Could not parse Reddit post");

  // Build rich content from all available fields
  const parts: string[] = [];

  // Subreddit name is critical context (e.g. r/gibson → brand is Gibson)
  if (post.subreddit) parts.push(`Subreddit: r/${post.subreddit}`);
  // Flair often has model info
  if (post.link_flair_text) parts.push(`Flair: ${post.link_flair_text}`);
  // Title
  parts.push(`Title: ${post.title}`);
  // Self text (body) — only present on text posts
  if (post.selftext) parts.push(`Body: ${post.selftext}`);

  // Extract top comments for context (guitar specs often shared there)
  if (Array.isArray(json) && json[1]?.data?.children) {
    const comments = json[1].data.children
      .filter((c: any) => c.kind === "t1" && c.data?.body)
      .slice(0, 5)
      .map((c: any) => {
        const isOP = c.data.author === post.author;
        return `${isOP ? "[OP] " : ""}${c.data.author}: ${c.data.body.substring(0, 300)}`;
      });
    if (comments.length > 0) {
      parts.push(`\nTop comments:\n${comments.join("\n")}`);
    }
  }

  return {
    content: parts.join("\n"),
    author: post.author || "unknown",
    title: post.title || "",
    authorUrl: `https://reddit.com/u/${post.author}`,
  };
}

async function fetchInstagramPost(url: string) {
  // Instagram oEmbed API — doesn't require auth for public posts
  const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`;
  const resp = await fetch(oembedUrl);

  if (!resp.ok) throw new Error(`Instagram oEmbed returned ${resp.status}`);

  const data = await resp.json();
  return {
    content: data.title || "Instagram post",
    author: data.author_name || "unknown",
    title: data.title || "Instagram post",
    authorUrl: data.author_url || url,
  };
}

async function fetchGenericPost(url: string) {
  const resp = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; TWNG-Bot/1.0)",
    },
  });

  if (!resp.ok) throw new Error(`URL returned ${resp.status}`);

  const html = await resp.text();
  const descMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
  const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);

  return {
    content: `${titleMatch?.[1] || ""}\n\n${descMatch?.[1] || ""}`.trim() || "No content extracted",
    author: "unknown",
    title: titleMatch?.[1] || "Post",
    authorUrl: "",
  };
}

// ── Claude extraction ────────────────────────────────────────────────────────

interface GuitarInfo {
  brand?: string;
  model?: string;
  year?: string;
  color?: string;
  serial?: string;
  story?: string;
}

async function extractWithClaude(content: string, apiKey: string): Promise<GuitarInfo> {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `Extract guitar information from this social media post. Return ONLY a JSON object with these fields: brand, model, year, color, serial, story (1-2 sentence summary of the owner's connection to the guitar).

Rules:
- The subreddit name often indicates the brand (e.g. r/gibson = Gibson, r/fender = Fender, r/guitarporn = unknown brand)
- Look for model info in comments, flair, and body text
- If a field can be reasonably inferred from context, include it
- Only omit fields that truly cannot be determined
- The "story" field should always be filled — summarize the post's emotional context even if brief

Text:
${content}`,
      }],
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Claude API ${resp.status}: ${errText.substring(0, 200)}`);
  }

  const result = await resp.json();
  let text = result.content?.[0]?.text?.trim() || "";

  // Strip markdown code blocks
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Claude did not return valid JSON");
  }
}

// ── Outreach messages ────────────────────────────────────────────────────────

function outreachEn(guitar: GuitarInfo, claimUrl: string): string {
  const desc = [guitar.brand, guitar.model, guitar.year].filter(Boolean).join(" ");
  return `Hi! We spotted your ${desc || "guitar"} post and loved it.

We're building TWNG — a platform where guitar owners document their instruments' stories, specs, and history. Think of it as a passport for your guitar.

We'd love to feature yours:
• Build your guitar's complete profile with photos & history
• Connect with other players who appreciate the same gear
• Preserve your instrument's story for the community

Claim your guitar here: ${claimUrl}

Cheers,
The TWNG Team`;
}

function outreachHe(guitar: GuitarInfo, claimUrl: string): string {
  const desc = [guitar.brand, guitar.model, guitar.year].filter(Boolean).join(" ");
  return `היי! ראינו את הפוסט שלך על ${desc || "הגיטרה"} ואהבנו.

אנחנו בונים את TWNG — פלטפורמה שבה בעלי גיטרות מתעדים את הסיפורים, המפרטים וההיסטוריה של הכלים שלהם. תחשוב על זה כמו דרכון לגיטרה שלך.

נשמח שתצטרף:
• בנה פרופיל מלא לגיטרה שלך עם תמונות והיסטוריה
• התחבר לנגנים אחרים שמעריכים את אותו ציוד
• שמור את סיפור הכלי שלך לקהילה

תביעת הגיטרה שלך כאן: ${claimUrl}

בברכה,
צוות TWNG`;
}

// ── Database storage ─────────────────────────────────────────────────────────

async function storeInDb(
  supabaseUrl: string,
  serviceKey: string,
  source: string,
  sourceUrl: string,
  author: string,
  authorUrl: string,
  title: string,
  guitar: GuitarInfo,
  msgEn: string,
  msgHe: string,
  claimToken: string,
) {
  const sb = createClient(supabaseUrl, serviceKey);
  const { data, error } = await sb.from("unclaimed_guitars").insert({
    brand: guitar.brand || null,
    model: guitar.model || null,
    year: guitar.year || null,
    color: guitar.color || null,
    serial: guitar.serial || null,
    story: guitar.story || null,
    images: [],
    source,
    source_url: sourceUrl,
    source_author: author,
    source_author_url: authorUrl,
    source_title: title,
    outreach_message_en: msgEn,
    outreach_message_he: msgHe,
    claim_token: claimToken,
    status: "unclaimed",
  }).select().single();

  if (error) throw new Error(`DB insert failed: ${error.message}`);
  return data;
}

// ── Main handler ─────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") return err("Method not allowed", 405);

  try {
    const body = await req.json();

    // Accept either { url } or { text, source_author?, source_url? }
    if (!body.url && !body.text) {
      return err("Provide 'url' to scrape or 'text' for manual extraction");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!supabaseUrl || !supabaseKey || !anthropicKey) {
      return err("Missing environment variables", 500);
    }

    let content: string;
    let source: string;
    let sourceUrl: string;
    let author: string;
    let authorUrl: string;
    let title: string;

    if (body.text) {
      // ── Manual text mode ──────────────────────────────────────────
      content = body.text;
      source = body.source || "manual";
      sourceUrl = body.source_url || "";
      author = body.source_author || "unknown";
      authorUrl = "";
      title = body.source_title || "Manual extraction";
    } else {
      // ── URL scrape mode ───────────────────────────────────────────
      sourceUrl = body.url;
      source = detectSource(body.url);
      let postData: { content: string; author: string; title: string; authorUrl: string };

      try {
        switch (source) {
          case "reddit":
            postData = await fetchRedditPost(body.url);
            break;
          case "instagram":
            postData = await fetchInstagramPost(body.url);
            break;
          default:
            postData = await fetchGenericPost(body.url);
            break;
        }
      } catch (fetchErr) {
        // Return scrape failure so frontend can offer manual paste
        return ok({
          success: false,
          scrapeError: true,
          error: `Could not scrape ${source}: ${fetchErr.message}. Paste the post text manually instead.`,
          source,
          sourceUrl: body.url,
        });
      }

      content = postData.content;
      author = postData.author;
      authorUrl = postData.authorUrl;
      title = postData.title;
    }

    // Extract guitar info with Claude
    const guitar = await extractWithClaude(content, anthropicKey);

    // Generate claim URL & outreach messages
    const claimToken = crypto.randomUUID();
    const siteUrl = Deno.env.get("SITE_URL") || "https://shiny-muffin-21f968.netlify.app";
    const claimUrl = `${siteUrl}/claim/${claimToken}`;
    const msgEn = outreachEn(guitar, claimUrl);
    const msgHe = outreachHe(guitar, claimUrl);

    // Store in DB
    const stored = await storeInDb(
      supabaseUrl, supabaseKey,
      source, sourceUrl, author, authorUrl, title,
      guitar, msgEn, msgHe, claimToken,
    );

    return ok({
      success: true,
      data: stored,
      guitarInfo: guitar,
      claimToken,
      outreach: { en: msgEn, he: msgHe },
    });

  } catch (e) {
    return err(e.message || "Internal error", 500);
  }
});
