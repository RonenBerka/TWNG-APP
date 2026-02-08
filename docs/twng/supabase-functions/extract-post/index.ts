// TWNG Guitar Post Extractor - Supabase Edge Function
// שולף מידע מפוסטים ברדיט/אינסטגרם ומחלץ פרטי גיטרה

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Guitar detection patterns
const BRAND_MODEL_PATTERNS = [
  { pattern: /\bSG\s*(Standard|Special|Custom|Junior)?\b/i, brand: 'Gibson', model: 'SG' },
  { pattern: /\bES[-\s]?335\b/i, brand: 'Gibson', model: 'ES-335' },
  { pattern: /\bFlying\s*V\b/i, brand: 'Gibson', model: 'Flying V' },
  { pattern: /\bExplorer\b/i, brand: 'Gibson', model: 'Explorer' },
  { pattern: /\bFirebird\b/i, brand: 'Gibson', model: 'Firebird' },
  { pattern: /\bLes\s*Paul\s*(Standard|Custom|Junior|Special|Studio|Classic|Traditional)?\b/i, brand: 'Gibson', model: 'Les Paul' },
  { pattern: /\bStrat(ocaster)?\b/i, brand: 'Fender', model: 'Stratocaster' },
  { pattern: /\bTele(caster)?\b/i, brand: 'Fender', model: 'Telecaster' },
  { pattern: /\bJazzmaster\b/i, brand: 'Fender', model: 'Jazzmaster' },
  { pattern: /\bJaguar\b/i, brand: 'Fender', model: 'Jaguar' },
  { pattern: /\bMustang\b/i, brand: 'Fender', model: 'Mustang' },
  { pattern: /\bPrecision\s*Bass\b/i, brand: 'Fender', model: 'Precision Bass' },
  { pattern: /\bJazz\s*Bass\b/i, brand: 'Fender', model: 'Jazz Bass' },
  { pattern: /\bCustom\s*24\b/i, brand: 'PRS', model: 'Custom 24' },
  { pattern: /\bSilver\s*Sky\b/i, brand: 'PRS', model: 'Silver Sky' },
  { pattern: /\bJEM\s*\d*\b/i, brand: 'Ibanez', model: 'JEM' },
  { pattern: /\bRG\s*\d+\b/i, brand: 'Ibanez', model: 'RG' },
]

const COLOR_PATTERNS = [
  { pattern: /\bvintage\s*cherry\b/i, color: 'Vintage Cherry' },
  { pattern: /\bheritage\s*cherry\b/i, color: 'Heritage Cherry' },
  { pattern: /\b3[- ]?tone\s*sunburst\b/i, color: '3-Tone Sunburst' },
  { pattern: /\btobacco\s*(sun)?burst\b/i, color: 'Tobacco Burst' },
  { pattern: /\bcandy\s*apple\s*red\b/i, color: 'Candy Apple Red' },
  { pattern: /\blake\s*placid\s*blue\b/i, color: 'Lake Placid Blue' },
  { pattern: /\bsurf\s*green\b/i, color: 'Surf Green' },
  { pattern: /\bfiesta\s*red\b/i, color: 'Fiesta Red' },
  { pattern: /\bolympic\s*white\b/i, color: 'Olympic White' },
  { pattern: /\bsunburst\b/i, color: 'Sunburst' },
  { pattern: /\bgoldtop\b/i, color: 'Goldtop' },
  { pattern: /\bcherry\b/i, color: 'Cherry' },
  { pattern: /\bnatural\b/i, color: 'Natural' },
  { pattern: /\bwhite\b/i, color: 'White' },
  { pattern: /\bblack\b/i, color: 'Black' },
]

// Fetch Reddit post
async function fetchRedditPost(url: string) {
  const jsonUrl = url.replace(/\/$/, '') + '.json'

  const response = await fetch(jsonUrl, {
    headers: {
      'User-Agent': 'TWNG Guitar Extractor/1.0'
    }
  })

  if (!response.ok) {
    throw new Error(`Reddit fetch failed: ${response.status}`)
  }

  const data = await response.json()
  const post = data[0]?.data?.children?.[0]?.data

  if (!post) {
    throw new Error('Post not found')
  }

  // Extract images
  const images: string[] = []
  if (post.media_metadata) {
    for (const [id, media] of Object.entries(post.media_metadata as Record<string, any>)) {
      if (media.s?.u) {
        images.push(media.s.u.replace(/&amp;/g, '&'))
      }
    }
  } else if (post.url && /\.(jpg|jpeg|png|gif|webp)/i.test(post.url)) {
    images.push(post.url)
  }

  return {
    source: 'reddit',
    source_url: `https://reddit.com${post.permalink}`,
    author: post.author,
    author_url: `https://reddit.com/u/${post.author}`,
    title: post.title,
    text: post.selftext,
    images,
    subreddit: post.subreddit,
    created_at: new Date(post.created_utc * 1000).toISOString(),
  }
}

// Extract guitar info from text
function extractGuitarInfo(title: string, text: string) {
  const fullText = `${title} ${text}`

  // Detect brand & model
  let brand = ''
  let model = ''

  for (const { pattern, brand: b, model: m } of BRAND_MODEL_PATTERNS) {
    if (pattern.test(fullText)) {
      brand = b
      model = m
      break
    }
  }

  // Detect year
  const yearMatch = fullText.match(/\b(19[5-9]\d|20[0-2]\d)\b/)
  const year = yearMatch ? yearMatch[1] : null

  // Detect color
  let color = ''
  for (const { pattern, color: c } of COLOR_PATTERNS) {
    if (pattern.test(fullText)) {
      color = c
      break
    }
  }

  // Detect serial
  const serialMatch = fullText.match(/serial[:\s#]*([A-Z0-9]+)/i) || fullText.match(/\b([A-Z]\d{5,10})\b/)
  const serial = serialMatch ? serialMatch[1] : null

  return { brand, model, year, color, serial }
}

// Generate outreach message
function generateOutreach(author: string, brand: string, model: string) {
  return {
    en: `Hey ${author}! 👋

I came across your post about your ${brand} ${model} and loved the story behind it.

I'm building TWNG (twng.com) - a platform where guitarists document and preserve their guitars' stories.

I'd love to feature your ${brand} on TWNG. I've already started creating a profile based on your post - you can claim it and add more details.

Interested? I can send you a direct link to claim your guitar's profile.

🎸 Every guitar has a story. Let's make sure yours is preserved.`,

    he: `היי ${author}! 👋

נתקלתי בפוסט שלך על ה-${brand} ${model} ואהבתי את הסיפור.

אני בונה את TWNG (twng.com) - פלטפורמה לתיעוד סיפורי גיטרות.

אשמח לארח את ה-${brand} שלך. כבר יצרתי פרופיל - תוכל לתבוע אותו ולהוסיף פרטים.

מעניין? אשלח לינק לתביעת הפרופיל.

🎸 לכל גיטרה יש סיפור.`
  }
}

// Main handler
serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()

    if (!url) {
      throw new Error('URL is required')
    }

    let postData

    // Detect source and fetch
    if (url.includes('reddit.com')) {
      postData = await fetchRedditPost(url)
    } else if (url.includes('instagram.com')) {
      throw new Error('Instagram not supported yet - API restrictions')
    } else if (url.includes('facebook.com')) {
      throw new Error('Facebook not supported yet - API restrictions')
    } else {
      throw new Error('Unsupported source')
    }

    // Extract guitar info
    const guitarInfo = extractGuitarInfo(postData.title || '', postData.text || '')

    // Generate outreach messages
    const outreach = generateOutreach(
      postData.author,
      guitarInfo.brand || 'guitar',
      guitarInfo.model || ''
    )

    // Generate claim token
    const claimToken = crypto.randomUUID()

    // Build response
    const result = {
      success: true,
      post: postData,
      guitar: {
        ...guitarInfo,
        story: postData.text,
        images: postData.images,
      },
      outreach,
      claim_token: claimToken,
      extracted_at: new Date().toISOString(),
      status: 'unclaimed',
    }

    return new Response(JSON.stringify(result, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
