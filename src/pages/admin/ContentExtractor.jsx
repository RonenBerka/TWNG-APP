import { useState, useCallback, useRef } from "react";
import {
  Loader2,
  Check,
  X,
  AlertTriangle,
  Download,
  RefreshCw,
  MoreVertical,
} from "lucide-react";
import { T } from "../../theme/tokens";
import { supabase } from "../../lib/supabase/client";

// === PHASE 1: Identify guitars + capture full narrative ===
const PHASE1_SYSTEM = `You are a guitar identification API. Extract guitar identities from provided content (articles, social media posts, video descriptions, or user-pasted text).

RULES:
- Respond with ONLY valid JSON. No conversational text.
- If a URL is given and you cannot access it, use web_search to find info. If text content is also provided, USE THAT as the primary source.
- Capture the FULL narrative/story from the original content — every personal detail, anecdote, history, and emotional context matters.
- If no guitars found, return: {"guitars":[],"error":"reason"}

RESPOND WITH:
{
  "guitars": [
    {
      "brand": "Gibson",
      "model": "Les Paul Standard",
      "year": 1959,
      "year_range": "single year or production range like 2019-present",
      "serial_number": "",
      "finish": "",
      "category": "Les Paul",
      "production_status": "current|discontinued|limited_edition|custom_shop",
      "context": "THE COMPLETE NARRATIVE from the source — paste/summarize everything relevant the author wrote about this guitar. Personal stories, history of acquisition, playing experience, modifications, emotional connection. This is critical — do NOT summarize away the human story.",
      "_famous_owner": "",
      "_nickname": "",
      "_notable_events": [],
      "_ownership_history": [],
      "_modification_history": []
    }
  ],
  "source_type": "article|video|social_media|user_text|mixed",
  "original_text": "The full original text/post as provided, preserved verbatim",
  "summary": "one line summary"
}`;

// === PHASE 2: Factory specs + story writing ===
const PHASE2_SYSTEM = `You are a guitar specialist who writes compelling guitar stories AND finds complete technical specifications.

YOUR TWO JOBS:
1. STORY: Write a 150-500 word narrative that CENTERS the original owner's story. The personal narrative IS the story — specs and history enrich it but don't replace it.
2. SPECS: Search the web for complete factory specifications of this exact guitar model and year.

STORY WRITING RULES:
- The story MUST incorporate the original context/narrative provided. This is someone's real experience with their guitar.
- Open with what makes this guitar special TO ITS OWNER — not generic "the Les Paul is an iconic model" filler.
- Weave technical facts naturally into the personal narrative.
- If the owner describes playing experience, rehabilitation, emotional connection — that's the heart of the story.
- Include famous associations if relevant but don't let them overshadow the owner's story.
- If someone mentions other people, events, venues — include them, they're part of the guitar's history.
- Write in third person but with warmth. This is documentary, not clinical.
- End with something that captures why this guitar matters.

SPEC SEARCH STRATEGY:
1. Search "[brand] [model] [year] specifications" for factory specs
2. Search "[brand] [model] [year] review" for additional details
3. Prioritize: official manufacturer page > Sweetwater/dealers > Reverb > reviews > forums
4. Cross-reference across at least 2 sources
5. Note any modifications the owner mentioned — distinguish from factory specs

RESPOND WITH ONLY THIS JSON:
{
  "body_style": "solid|semi-hollow|hollow|acoustic|classical",
  "instrument_type": "electric|acoustic|classical|bass",
  "finish": "",
  "finish_options": ["array of known available finishes for this model"],
  "specifications": {
    "body_material": "",
    "top_material": "",
    "back_material": "",
    "side_material": "",
    "neck_material": "",
    "neck_joint": "",
    "neck_profile": "",
    "fretboard": "",
    "fretboard_radius": "",
    "fretboard_inlays": "",
    "num_frets": null,
    "fret_size": "",
    "scale_length": "",
    "nut_width": "",
    "nut_material": "",
    "pickups": "",
    "pickup_config": "",
    "pickup_type": "",
    "bridge": "",
    "bridge_type": "",
    "tailpiece": "",
    "tuners": "",
    "hardware_finish": "",
    "controls": "",
    "switching": "",
    "weight": "",
    "color": "",
    "finish_type": "",
    "country_of_origin": "",
    "msrp": "",
    "street_price": "",
    "case_included": "",
    "tags": [],
    "_confidence": {},
    "_extraction_notes": "",
    "_spec_sources": []
  },
  "story": "THE NARRATIVE STORY (150-500 words)",
  "_images": [
    {
      "url": "", "source_page": "", "description": "",
      "type": "product|detail|live|historical|other",
      "copyright": "public_domain|cc0|cc_by|cc_by_sa|cc_by_nc|fair_use|copyrighted|unknown",
      "attribution": "", "license_url": null, "usable_without_permission": false
    }
  ],
  "extraction_confidence": "high|medium|low",
  "fields_requiring_verification": []
}`;

// === seed_guitars CSV schema ===
const CSV_HEADERS = [
  "id", "brand", "model", "year", "year_range", "serial_number_pattern",
  "body_style", "instrument_type", "category", "production_status",
  "finish_options", "specifications", "dedup_fingerprint", "tags",
  "source", "source_urls", "confidence", "story", "created_at"
];

const STATUS = { PENDING: "pending", PROCESSING: "processing", ENRICHING: "enriching", DONE: "done", ERROR: "error", REVIEW: "review" };
const genId = () => crypto.randomUUID?.() || "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16); });

function makeFingerprint(brand, model, yearOrRange) {
  const b = (brand || "").toLowerCase().trim();
  const m = (model || "").toLowerCase().trim().replace(/^the\s+/, "");
  const y = (yearOrRange || "").toString().toLowerCase().trim();
  return `${b}|${m}|${y}`;
}

function buildCsvRow(guitar, enrichment, sourceUrl, story) {
  const now = new Date().toISOString();
  const specs = { ...enrichment.specifications || {} };
  // Add provenance to specs
  if (guitar._famous_owner) specs._famous_owner = guitar._famous_owner;
  if (guitar._nickname) specs._nickname = guitar._nickname;
  if (guitar._notable_events?.length) specs._notable_events = guitar._notable_events;
  if (guitar._ownership_history?.length) specs._ownership_history = guitar._ownership_history;
  if (guitar._modification_history?.length) specs._modification_history = guitar._modification_history;
  specs._images = enrichment._images || [];
  // Merge source URLs
  const allUrls = [sourceUrl, ...(specs._spec_sources || [])].filter(Boolean);
  delete specs._spec_sources;
  specs._source_urls = allUrls;

  const yearRange = guitar.year_range || (guitar.year ? String(guitar.year) : "");
  const fp = makeFingerprint(guitar.brand, guitar.model, yearRange);

  return {
    id: genId(),
    brand: guitar.brand || "",
    model: guitar.model || "",
    year: guitar.year || "",
    year_range: yearRange,
    serial_number_pattern: "",
    body_style: enrichment.body_style || "",
    instrument_type: enrichment.instrument_type || "",
    category: guitar.category || "",
    production_status: guitar.production_status || "current",
    finish_options: JSON.stringify(enrichment.finish_options || []),
    specifications: JSON.stringify(specs),
    dedup_fingerprint: fp,
    tags: JSON.stringify(specs.tags || []),
    source: "content_extraction",
    source_urls: JSON.stringify(allUrls),
    confidence: enrichment.extraction_confidence || "medium",
    story: story || "",
    created_at: now,
  };
}

function escapeCsv(val) {
  const s = String(val ?? "");
  return (s.includes(",") || s.includes('"') || s.includes("\n")) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function exportCsv(rows) {
  const lines = [CSV_HEADERS.join(",")];
  rows.forEach(r => lines.push(CSV_HEADERS.map(h => escapeCsv(r[h])).join(",")));
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = `seed_extract_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
}

function exportStories(items) {
  const md = items.filter(i => i.story).map(i => {
    const g = i.guitar; const imgs = i.enrichment?._images || [];
    let imgTable = imgs.length > 0 ? "\n## Images\n| # | Description | Link | Copyright | Attribution |\n|---|-------------|------|-----------|-------------|\n" +
      imgs.map((im, idx) => `| ${idx + 1} | ${im.description || ""} | [Link](${im.url}) | ${im.copyright || "unknown"} | ${im.attribution || ""} |`).join("\n") + "\n" : "";
    return `# ${g.brand} ${g.model}${g.year ? ` (${g.year})` : ""}\n\n${i.story}\n${imgTable}\n## Sources\n- ${i.sourceUrl || "User-provided text"}\n\n## Extraction Confidence\n- Overall: ${i.confidence}\n- Fingerprint: \`${i.csvRow?.dedup_fingerprint || ""}\`\n\n---\n`;
  }).join("\n");
  const blob = new Blob([md], { type: "text/markdown" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = `seed_stories_${new Date().toISOString().slice(0, 10)}.md`; a.click();
}

function extractJson(text) {
  if (!text?.trim()) return null;
  try { return JSON.parse(text); } catch { }
  const fenced = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  try { return JSON.parse(fenced); } catch { }
  const start = fenced.indexOf("{"); if (start === -1) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < fenced.length; i++) {
    const c = fenced[i];
    if (esc) { esc = false; continue; } if (c === "\\") { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; } if (inStr) continue;
    if (c === "{") depth++; if (c === "}") { depth--; if (depth === 0) { try { return JSON.parse(fenced.substring(start, i + 1)); } catch { return null; } } }
  }
  return null;
}

// === SUPABASE EDGE FUNCTION CALL ===
async function callEdgeFunction(system, userMsg, addLog, label) {
  addLog(`[${label}] Calling Edge Function...`);
  try {
    const { data, error } = await supabase.functions.invoke('extract-content', {
      body: {
        system,
        user_message: userMsg,
      }
    });

    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);

    const parsed = data?.result || data;
    if (!parsed) throw new Error("No result from Edge Function");

    addLog(`[${label}] ✓ Success`);
    return parsed;
  } catch (err) {
    addLog(`[${label}] ✗ ${err.message}`);
    throw err;
  }
}

async function phase1Extract(url, textContent, addLog) {
  let prompt = "";
  if (url && textContent) {
    prompt = `Source URL: ${url}\n\nThe content from this source (copied by user because the URL may not be directly accessible):\n\n---\n${textContent}\n---\n\nExtract all guitars from this content. Preserve the FULL narrative — every personal detail matters for the story. Also determine the category (model family like "Les Paul", "SG", "Stratocaster", "Dreadnought") and production_status for each guitar.`;
  } else if (textContent) {
    prompt = `Extract all guitars from this text content (no URL — user pasted directly):\n\n---\n${textContent}\n---\n\nPreserve the FULL narrative — every personal detail, anecdote, name mention, and emotional context matters. Also determine the category and production_status for each guitar.`;
  } else {
    prompt = `Extract all guitar identities from this URL: ${url}\n\nUse web_search to access the content. Capture the FULL narrative from the source. Also determine the category (model family) and production_status for each guitar.`;
  }
  return await callEdgeFunction(PHASE1_SYSTEM, prompt, addLog, "Phase 1 · Identify");
}

async function phase2Enrich(guitar, originalText, sourceUrl, addLog) {
  const label = `Phase 2 · ${guitar.brand} ${guitar.model}`;
  const yearStr = guitar.year ? ` ${guitar.year}` : "";
  const contextBlock = guitar.context ? `\n\nORIGINAL NARRATIVE (this is the heart of the story — weave it in):\n"${guitar.context}"` : "";
  const origTextBlock = originalText ? `\n\nFULL ORIGINAL POST:\n"${originalText}"` : "";
  const modsStr = guitar._modification_history?.length ? `\nKnown modifications: ${guitar._modification_history.join("; ")}` : "";
  const ownerStr = guitar._famous_owner ? `\nNotable owner: ${guitar._famous_owner}` : "";
  const nickStr = guitar._nickname ? `\nNickname: ${guitar._nickname}` : "";
  const eventsStr = guitar._notable_events?.length ? `\nNotable events: ${guitar._notable_events.join("; ")}` : "";

  return await callEdgeFunction(PHASE2_SYSTEM,
    `Guitar: ${guitar.brand} ${guitar.model}${yearStr}
Serial: ${guitar.serial_number || "unknown"}
Finish: ${guitar.finish || "unknown"}
Category: ${guitar.category || "unknown"}${ownerStr}${nickStr}${modsStr}${eventsStr}${contextBlock}${origTextBlock}

SEARCH FOR:
1. "${guitar.brand} ${guitar.model}${yearStr} specifications" — factory specs
2. "${guitar.brand} ${guitar.model}${yearStr} review" — more details
3. Any specific history of this guitar if notable
4. Also return finish_options — all known finishes available for this model

STORY REQUIREMENTS:
- The original narrative/post IS the core of the story. Don't replace it with generic model history.
- Start with what makes this guitar special to its owner.
- Weave in technical specs naturally.
- If the owner mentions people, events, venues, personal experiences — INCLUDE THEM.
- Source URL: ${sourceUrl || "user-provided text"}`, addLog, label);
}

// === UI COMPONENTS ===

const ConfBadge = ({ level }) => {
  const c = { high: T.success, medium: T.amber, low: T.error };
  return <span style={{ background: c[level] || T.txt2, color: T.txt, padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>{level || "?"}</span>;
};

const CopyBadge = ({ cr }) => {
  const ok = ["public_domain", "cc0", "cc_by", "cc_by_sa"];
  const warn = ["cc_by_nc", "fair_use"];
  const color = ok.includes(cr) ? T.success : warn.includes(cr) ? T.amber : T.error;
  return <span style={{ background: color + "18", color, padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{cr}</span>;
};

const FpBadge = ({ fp }) => (
  <span style={{ background: T.bgCard, color: T.txt2, padding: "2px 6px", borderRadius: 4, fontSize: 9, fontFamily: "'JetBrains Mono', monospace", wordBreak: "break-all" }}>{fp}</span>
);

export default function ContentExtractor() {
  const [activeTab, setActiveTab] = useState("input");
  const [queue, setQueue] = useState([]);
  const [results, setResults] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [log, setLog] = useState([]);
  const [phaseInfo, setPhaseInfo] = useState("");
  const abortRef = useRef(false);
  const [inputUrl, setInputUrl] = useState("");
  const [inputText, setInputText] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkUrls, setBulkUrls] = useState("");

  const addLog = useCallback((msg) => setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]), []);

  const addSingle = () => {
    if (!inputUrl.trim() && !inputText.trim()) return;
    setQueue(prev => [...prev, { id: genId(), url: inputUrl.trim() || null, textContent: inputText.trim() || null, label: inputUrl.trim() || inputText.trim().substring(0, 80) + "...", status: STATUS.PENDING }]);
    setInputUrl(""); setInputText("");
  };

  const addBulk = () => {
    const urls = bulkUrls.split("\n").map(u => u.trim()).filter(u => u.startsWith("http"));
    if (!urls.length) return;
    setQueue(prev => [...prev, ...urls.map(u => ({ id: genId(), url: u, textContent: null, label: u, status: STATUS.PENDING }))]);
    setBulkUrls("");
  };

  const startProcessing = async () => {
    abortRef.current = false; setProcessing(true); setActiveTab("status");
    const pending = queue.filter(q => q.status === STATUS.PENDING);
    addLog(`=== Batch: ${pending.length} items ===`);

    for (const item of pending) {
      if (abortRef.current) break;
      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: STATUS.PROCESSING, phase: "Phase 1: Identifying..." } : q));
      setPhaseInfo(`Phase 1: ${item.label.substring(0, 60)}`);

      try {
        const p1 = await phase1Extract(item.url, item.textContent, addLog);
        if (p1.error && (!p1.guitars?.length)) {
          setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: STATUS.ERROR, error: p1.error } : q)); continue;
        }
        if (!p1.guitars?.length) {
          setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: STATUS.DONE, count: 0 } : q));
          addLog(`No guitars found`); continue;
        }

        addLog(`Found ${p1.guitars.length} guitar(s). Enriching...`);
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: STATUS.ENRICHING } : q));
        let enriched = 0;

        for (const guitar of p1.guitars) {
          if (abortRef.current) break;
          const gLabel = `${guitar.brand} ${guitar.model}`;
          setPhaseInfo(`Phase 2: ${gLabel} — searching specs...`);
          setQueue(prev => prev.map(q => q.id === item.id ? { ...q, phase: `Enriching ${enriched + 1}/${p1.guitars.length}: ${gLabel}` } : q));

          try {
            const enrichment = await phase2Enrich(guitar, p1.original_text || item.textContent, item.url, addLog);
            const story = enrichment.story || "";
            const csvRow = buildCsvRow(guitar, enrichment, item.url || "user-provided-text", story);
            setResults(prev => [...prev, {
              id: genId(), guitar, enrichment, story, csvRow,
              sourceUrl: item.url || "user-text",
              confidence: enrichment.extraction_confidence || "medium",
              fieldsToVerify: enrichment.fields_requiring_verification || [],
              status: STATUS.REVIEW,
            }]);
            enriched++;
          } catch (e) {
            addLog(`⚠ Enrichment failed for ${gLabel}: ${e.message}`);
            const fallbackEnrichment = { body_style: "", instrument_type: "electric", finish_options: [], specifications: { _confidence: {}, _extraction_notes: "Enrichment failed", _source_urls: [] }, _images: [], extraction_confidence: "low", fields_requiring_verification: ["all"] };
            const csvRow = buildCsvRow(guitar, fallbackEnrichment, item.url || "", guitar.context || "");
            setResults(prev => [...prev, {
              id: genId(), guitar, enrichment: fallbackEnrichment, story: guitar.context || "", csvRow,
              sourceUrl: item.url || "user-text", confidence: "low", fieldsToVerify: ["all"], status: STATUS.REVIEW,
            }]);
            enriched++;
          }
        }
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: STATUS.DONE, count: enriched } : q));
      } catch (e) {
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: STATUS.ERROR, error: e.message } : q));
        addLog(`✗ ${e.message}`);
      }
    }
    setProcessing(false); setPhaseInfo("");
    if (!abortRef.current) setActiveTab("results");
  };

  const stopProcessing = () => { abortRef.current = true; };
  const removeFromQueue = (id) => setQueue(prev => prev.filter(q => q.id !== id));
  const retryItem = (id) => setQueue(prev => prev.map(q => q.id === id ? { ...q, status: STATUS.PENDING, error: undefined, phase: undefined } : q));
  const approveResult = (id) => setResults(prev => prev.map(r => r.id === id ? { ...r, status: STATUS.DONE } : r));
  const rejectResult = (id) => setResults(prev => prev.filter(r => r.id !== id));

  const approved = results.filter(r => r.status === STATUS.DONE);
  const review = results.filter(r => r.status === STATUS.REVIEW);
  const pendingQ = queue.filter(q => q.status === STATUS.PENDING);
  const errorQ = queue.filter(q => q.status === STATUS.ERROR);

  const tabs = [
    { id: "input", label: "הזנה" },
    { id: "status", label: "עיבוד", count: queue.length || null },
    { id: "results", label: "תוצאות", count: results.length || null },
    { id: "log", label: "לוג" },
  ];

  const S = {
    card: { background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16 },
    label: { fontSize: 11, color: T.txt2, fontWeight: 500, display: "block", marginBottom: 6 },
    input: { width: "100%", background: T.bgDeep, border: `1px solid ${T.border}`, borderRadius: 8, color: T.txt, padding: 12, fontSize: 13, fontFamily: "'DM Sans', sans-serif", resize: "vertical", lineHeight: 1.6 },
    btn: { border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
    amber: { background: T.warm, color: T.bgDeep },
    green: { background: T.success, color: T.txt },
    ghost: { background: T.bgElev, color: T.txt, border: `1px solid ${T.border}` },
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bgDeep, color: T.txt, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&family=JetBrains+Mono:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:${T.bgCard}}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}
        textarea:focus,button:focus,input:focus{outline:none}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${T.border}`, padding: "16px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${T.warm}, ${T.amber})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎸</div>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: T.txt }}>TWNG Content Extractor</h1>
          <p style={{ fontSize: 11, color: T.txt2, marginTop: 2 }}>Identify → Enrich specs → Write the story → seed_guitars</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {approved.length > 0 && (
            <>
              <button onClick={() => exportCsv(approved.map(r => r.csvRow))} style={{ ...S.btn, ...S.amber }}>⬇ seed CSV ({approved.length})</button>
              <button onClick={() => exportStories(approved)} style={{ ...S.btn, ...S.ghost }}>⬇ Stories</button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, padding: "0 24px" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            background: "none", border: "none", borderBottom: activeTab === t.id ? `2px solid ${T.warm}` : "2px solid transparent",
            color: activeTab === t.id ? T.txt : T.txt2, padding: "12px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6,
          }}>{t.label}{t.count && <span style={{ background: T.warm + "22", color: T.warm, padding: "1px 7px", borderRadius: 9999, fontSize: 11 }}>{t.count}</span>}</button>
        ))}
      </div>

      <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>

        {/* === INPUT TAB === */}
        {activeTab === "input" && (
          <div style={{ animation: "slideIn .2s ease" }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
              <button onClick={() => setBulkMode(false)} style={{ ...S.btn, ...(bulkMode ? S.ghost : S.amber), padding: "6px 14px", fontSize: 11 }}>URL + טקסט</button>
              <button onClick={() => setBulkMode(true)} style={{ ...S.btn, ...(bulkMode ? S.amber : S.ghost), padding: "6px 14px", fontSize: 11 }}>Batch URLs</button>
            </div>

            {!bulkMode ? (
              <div style={S.card}>
                <div style={{ marginBottom: 14 }}>
                  <label style={S.label}>URL (אופציונלי)</label>
                  <input type="text" value={inputUrl} onChange={e => setInputUrl(e.target.value)} placeholder="https://www.instagram.com/p/..." style={{ ...S.input, resize: "none", height: 40, padding: "8px 12px" }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={S.label}>טקסט מהפוסט/כתבה <span style={{ color: T.warm }}>— הדבק כאן אם ה-URL לא נגיש</span></label>
                  <textarea value={inputText} onChange={e => setInputText(e.target.value)} rows={6}
                    placeholder={`Principal Skinner 9-1951 my favorite Gibson Les Paul...\n\nאו:\n\nI always played strat or tele... This axe saved me...`} style={S.input} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: T.txtM }}>
                    {inputUrl && inputText ? "URL + text → best results" : inputUrl ? "URL only → will search" : inputText ? "Text only → will identify" : ""}
                  </span>
                  <button onClick={addSingle} disabled={!inputUrl.trim() && !inputText.trim()} style={{ ...S.btn, ...S.amber, opacity: (!inputUrl.trim() && !inputText.trim()) ? 0.4 : 1 }}>הוסף לתור →</button>
                </div>
              </div>
            ) : (
              <div style={S.card}>
                <label style={S.label}>URLs — כל כתובת בשורה נפרדת</label>
                <textarea value={bulkUrls} onChange={e => setBulkUrls(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); addBulk(); } }}
                  rows={6} placeholder={"https://www.guitarworld.com/news/...\nhttps://reverb.com/news/..."} style={S.input} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                  <span style={{ fontSize: 11, color: T.txtM }}>{bulkUrls.split("\n").filter(u => u.trim().startsWith("http")).length} URLs · ⌘+Enter</span>
                  <button onClick={addBulk} style={{ ...S.btn, ...S.amber }}>הוסף לתור →</button>
                </div>
              </div>
            )}

            <div style={{ marginTop: 12, padding: "10px 16px", ...S.card, fontSize: 11, color: T.txt2, lineHeight: 1.8 }}>
              <span style={{ color: T.warm, fontWeight: 600 }}>Output → seed_guitars table</span><br />
              <b style={{ color: T.txt }}>Phase 1</b> — מזהה גיטרות + שומר נרטיב מלא<br />
              <b style={{ color: T.txt }}>Phase 2</b> — מפרט מפעל + כותב סיפור + fingerprint לדדופליקציה<br />
              <span style={{ color: T.txtM }}>💡 Instagram/Reddit — העתק טקסט לשדה הטקסט</span>
            </div>

            {queue.length > 0 && (
              <div style={{ ...S.card, marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.txt }}>תור ({pendingQ.length} ממתינים)</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {errorQ.length > 0 && <button onClick={() => errorQ.forEach(q => retryItem(q.id))} style={{ ...S.btn, ...S.ghost, fontSize: 11 }}>↻ retry</button>}
                    <button onClick={startProcessing} disabled={processing || !pendingQ.length} style={{ ...S.btn, ...S.green, opacity: (processing || !pendingQ.length) ? 0.4 : 1 }}>
                      {processing ? "מעבד..." : "▶ Start"}
                    </button>
                  </div>
                </div>
                {queue.map(q => (
                  <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: `1px solid ${T.border}`, fontSize: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: q.status === STATUS.DONE ? T.success : q.status === STATUS.ERROR ? T.error : (q.status === STATUS.PROCESSING || q.status === STATUS.ENRICHING) ? T.warm : T.border, animation: (q.status === STATUS.PROCESSING || q.status === STATUS.ENRICHING) ? "pulse 1.5s infinite" : "none" }} />
                    <span style={{ color: T.txt, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.url || "📝 " + (q.textContent || "").substring(0, 60) + "..."}</span>
                    {q.textContent && q.url && <span style={{ fontSize: 10, color: T.txtM, flexShrink: 0 }}>+text</span>}
                    {q.count != null && <span style={{ color: T.success, fontSize: 11 }}>{q.count} 🎸</span>}
                    {q.error && <span style={{ color: T.error, fontSize: 11 }} title={q.error}>error</span>}
                    {(q.status === STATUS.PENDING || q.status === STATUS.ERROR) && <button onClick={() => removeFromQueue(q.id)} style={{ background: "none", border: "none", color: T.txtM, cursor: "pointer", fontSize: 14 }}>×</button>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === STATUS TAB === */}
        {activeTab === "status" && (
          <div style={{ animation: "slideIn .2s ease" }}>
            {processing && (
              <div style={{ background: T.warm + "0a", border: `1px solid ${T.warm}22`, borderRadius: 8, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: T.warm, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "inline-block", width: 14, height: 14, border: `2px solid ${T.warm}`, borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
                  {phaseInfo}
                </span>
                <button onClick={stopProcessing} style={{ ...S.btn, background: T.error, color: T.txt }}>⏹ Stop</button>
              </div>
            )}
            {queue.length === 0 ? <div style={{ textAlign: "center", padding: 60, color: T.txt2 }}>התור ריק</div> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {queue.map(q => (
                  <div key={q.id} style={{ ...S.card, border: `1px solid ${q.status === STATUS.ERROR ? T.error + "44" : T.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0,
                      background: q.status === STATUS.DONE ? T.success : q.status === STATUS.ERROR ? T.error + "22" : (q.status === STATUS.PROCESSING || q.status === STATUS.ENRICHING) ? T.warm + "22" : T.bgElev,
                      color: q.status === STATUS.DONE ? T.txt : q.status === STATUS.ERROR ? T.error : (q.status === STATUS.PROCESSING || q.status === STATUS.ENRICHING) ? T.warm : T.txt2,
                    }}>{q.status === STATUS.DONE ? "✓" : q.status === STATUS.ERROR ? "✗" : (q.status === STATUS.PROCESSING || q.status === STATUS.ENRICHING) ? "⟳" : "·"}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: T.txt, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.url || "📝 " + (q.textContent || "").substring(0, 60) + "..."}</div>
                      <div style={{ fontSize: 11, color: q.status === STATUS.ERROR ? T.error : q.status === STATUS.ENRICHING ? T.warm : T.txt2, marginTop: 2 }}>
                        {q.phase || (q.status === STATUS.DONE ? `Done — ${q.count || 0} guitar(s)` : q.status === STATUS.ERROR ? q.error : q.status === STATUS.PENDING ? "Queued" : "...")}
                      </div>
                    </div>
                    {q.status === STATUS.ERROR && <button onClick={() => retryItem(q.id)} style={{ ...S.btn, ...S.ghost, fontSize: 11 }}>↻</button>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === RESULTS TAB === */}
        {activeTab === "results" && (
          <div style={{ animation: "slideIn .2s ease" }}>
            {results.length === 0 ? <div style={{ textAlign: "center", padding: 60, color: T.txt2 }}>עדיין אין תוצאות</div> : (
              <>
                {review.length > 0 && (
                  <div style={{ background: T.warm + "12", border: `1px solid ${T.warm}33`, borderRadius: 8, padding: "10px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: T.warm }}>⚠ {review.length} pending review</span>
                    <button onClick={() => review.forEach(r => approveResult(r.id))} style={{ ...S.btn, ...S.green, fontSize: 11 }}>Approve all</button>
                  </div>
                )}
                <div style={{ overflowX: "auto", border: `1px solid ${T.border}`, borderRadius: 10 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead><tr style={{ background: T.bgCard, textAlign: "left" }}>
                      {["", "", "Brand", "Model", "Year", "Cat.", "Type", "Conf.", "Specs", "Story", ""].map((h, i) => (
                        <th key={i} style={{ padding: "10px 10px", color: T.txt2, fontWeight: 500, whiteSpace: "nowrap", borderBottom: `1px solid ${T.border}`, fontSize: 11 }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {results.map((r, idx) => {
                        const sp = r.enrichment?.specifications || {};
                        const imgs = r.enrichment?._images || [];
                        const specCount = Object.keys(sp).filter(k => !k.startsWith("_") && k !== "tags" && sp[k]).length;
                        const isExp = expandedRow === r.id;
                        const hasStory = (r.story || "").length > 20;
                        return (
                          <>
                            <tr key={r.id} onClick={() => setExpandedRow(isExp ? null : r.id)} style={{ cursor: "pointer", background: idx % 2 ? T.bgCard : T.bgDeep, borderBottom: `1px solid ${T.border}` }}
                              onMouseEnter={e => e.currentTarget.style.background = T.bgElev} onMouseLeave={e => e.currentTarget.style.background = idx % 2 ? T.bgCard : T.bgDeep}>
                              <td style={{ padding: "10px", color: T.txt2 }}>{isExp ? "▾" : "▸"}</td>
                              <td style={{ padding: "10px" }}><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: r.status === STATUS.DONE ? T.success : T.warm }} /></td>
                              <td style={{ padding: "10px", fontWeight: 600, color: T.txt }}>{r.guitar.brand}</td>
                              <td style={{ padding: "10px", color: T.txt }}>{r.guitar.model}</td>
                              <td style={{ padding: "10px", color: T.txt2 }}>{r.guitar.year || "—"}</td>
                              <td style={{ padding: "10px", color: T.txt2, fontSize: 11 }}>{r.guitar.category || "—"}</td>
                              <td style={{ padding: "10px", color: T.txt2 }}>{r.enrichment?.instrument_type || "—"}</td>
                              <td style={{ padding: "10px" }}><ConfBadge level={r.confidence} /></td>
                              <td style={{ padding: "10px" }}><span style={{ color: specCount > 8 ? T.success : specCount > 3 ? T.amber : T.error, fontSize: 11 }}>{specCount}</span></td>
                              <td style={{ padding: "10px" }}>{hasStory ? <span style={{ color: T.success, fontSize: 11 }}>✓</span> : <span style={{ color: T.error, fontSize: 11 }}>—</span>}</td>
                              <td style={{ padding: "10px" }} onClick={e => e.stopPropagation()}>
                                {r.status === STATUS.REVIEW ? (
                                  <div style={{ display: "flex", gap: 4 }}>
                                    <button onClick={() => approveResult(r.id)} style={{ ...S.btn, ...S.green, padding: "4px 8px", fontSize: 11 }}>✓</button>
                                    <button onClick={() => rejectResult(r.id)} style={{ ...S.btn, background: T.error, color: T.txt, padding: "4px 8px", fontSize: 11 }}>✗</button>
                                  </div>
                                ) : <span style={{ color: T.success, fontSize: 11 }}>✓</span>}
                              </td>
                            </tr>
                            {isExp && (
                              <tr key={r.id + "-e"} style={{ background: T.bgElev }}>
                                <td colSpan={11} style={{ padding: 0 }}>
                                  <div style={{ padding: "16px 24px", animation: "slideIn .15s ease" }}>
                                    {/* Fingerprint */}
                                    <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                                      <span style={{ fontSize: 10, color: T.txt2 }}>Fingerprint:</span>
                                      <FpBadge fp={r.csvRow?.dedup_fingerprint || ""} />
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                                      {/* Left: Specs */}
                                      <div>
                                        <h4 style={{ fontSize: 12, fontWeight: 600, color: T.warm, marginBottom: 10, fontFamily: "'Playfair Display', serif" }}>Factory Specifications</h4>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 16px", fontSize: 11 }}>
                                          {Object.entries(sp).filter(([k, v]) => !k.startsWith("_") && k !== "tags" && v && typeof v !== "object").map(([k, v]) => (
                                            <div key={k} style={{ display: "flex", gap: 6 }}>
                                              <span style={{ color: T.txt2, minWidth: 90 }}>{k.replace(/_/g, " ")}:</span>
                                              <span style={{ color: T.txt }}>{String(v)}</span>
                                              {sp._confidence?.[k] && <ConfBadge level={sp._confidence[k]} />}
                                            </div>
                                          ))}
                                        </div>
                                        {sp.tags?.length > 0 && <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>{sp.tags.map((t, i) => <span key={i} style={{ background: T.bgElev, color: T.txt2, padding: "2px 8px", borderRadius: 4, fontSize: 10 }}>{t}</span>)}</div>}
                                        {sp._extraction_notes && <div style={{ marginTop: 10, padding: 10, background: T.bgDeep, borderRadius: 6, fontSize: 11, color: T.txt2, lineHeight: 1.5 }}>{sp._extraction_notes}</div>}
                                        {(r.guitar._famous_owner || r.guitar._nickname) && (
                                          <div style={{ marginTop: 10, padding: 10, background: T.warm + "0a", border: `1px solid ${T.warm}22`, borderRadius: 6, fontSize: 11 }}>
                                            {r.guitar._nickname && <div style={{ color: T.warm, fontWeight: 600 }}>"{r.guitar._nickname}"</div>}
                                            {r.guitar._famous_owner && <div style={{ color: T.txt, marginTop: 2 }}>Owner: {r.guitar._famous_owner}</div>}
                                            {r.guitar._notable_events?.map((ev, i) => <div key={i} style={{ color: T.txt2, marginTop: 2 }}>• {ev}</div>)}
                                          </div>
                                        )}
                                      </div>
                                      {/* Right: Story + Images */}
                                      <div>
                                        <h4 style={{ fontSize: 12, fontWeight: 600, color: T.warm, marginBottom: 10, fontFamily: "'Playfair Display', serif" }}>Story</h4>
                                        <div style={{ fontSize: 12, color: T.txt, lineHeight: 1.8, maxHeight: 280, overflowY: "auto", paddingRight: 8, whiteSpace: "pre-wrap" }}>{r.story || "No story generated."}</div>
                                        {imgs.length > 0 && (
                                          <div style={{ marginTop: 14 }}>
                                            <h4 style={{ fontSize: 12, fontWeight: 600, color: T.warm, marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>Images ({imgs.length})</h4>
                                            {imgs.map((im, i) => (
                                              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, padding: "5px 8px", background: T.bgDeep, borderRadius: 6, marginBottom: 4 }}>
                                                <CopyBadge cr={im.copyright} />
                                                <span style={{ color: T.txt2, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{im.description}</span>
                                                <a href={im.url} target="_blank" rel="noopener noreferrer" style={{ color: T.warm, textDecoration: "none" }}>⬇</a>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div style={{ marginTop: 12, fontSize: 10, color: T.txtM }}>Source: {r.sourceUrl || "user-provided text"}</div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 16, fontSize: 11, color: T.txt2 }}>
                  <span>Total: {results.length}</span><span>·</span>
                  <span style={{ color: T.success }}>{approved.length} approved</span><span>·</span>
                  <span style={{ color: T.warm }}>{review.length} pending</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* === LOG TAB === */}
        {activeTab === "log" && (
          <div style={{ animation: "slideIn .2s ease" }}>
            <div style={{ ...S.card, fontSize: 11, color: T.txt2, lineHeight: 2, maxHeight: 500, overflowY: "auto" }}>
              {log.length === 0 ? <span style={{ color: T.txtM }}>No activity.</span> : log.map((l, i) => <div key={i} style={{ color: l.includes("✓") ? T.success : l.includes("✗") || l.includes("⚠") ? T.error : l.includes("===") ? T.warm : T.txt2 }}>{l}</div>)}
            </div>
            {log.length > 0 && <button onClick={() => setLog([])} style={{ ...S.btn, ...S.ghost, marginTop: 8, fontSize: 11 }}>Clear</button>}
          </div>
        )}
      </div>
    </div>
  );
}
