import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

interface TranscriptionRequest {
  audio?: string; // base64 encoded audio
  mimeType?: string;
}

interface TranscriptionResponse {
  text: string;
  duration?: number;
}

interface OpenAIResponse {
  text: string;
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function handleFormDataTranscription(formData: FormData): Promise<TranscriptionResponse> {
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No audio file provided in form data");
  }

  // Create a new FormData for OpenAI API
  const openaiFormData = new FormData();
  openaiFormData.append("model", "whisper-1");
  openaiFormData.append("file", file);
  openaiFormData.append("language", "en");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: openaiFormData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const result: OpenAIResponse = await response.json();

  if (!result || !result.text) {
    throw new Error("Whisper API returned empty transcription");
  }

  return {
    text: result.text,
  };
}

async function handleBase64Transcription(
  base64Audio: string,
  mimeType: string = "audio/webm"
): Promise<TranscriptionResponse> {
  if (!base64Audio) {
    throw new Error("No audio data provided");
  }

  // Decode base64 to Uint8Array
  const binaryString = atob(base64Audio);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Determine file extension from mime type
  const mimeToExt: Record<string, string> = {
    "audio/webm": "webm",
    "audio/mp3": "mp3",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
    "audio/flac": "flac",
    "audio/m4a": "m4a",
  };

  const ext = mimeToExt[mimeType] || "webm";
  const filename = `audio.${ext}`;

  // Create a Blob and then a File
  const blob = new Blob([bytes], { type: mimeType });
  const file = new File([blob], filename, { type: mimeType });

  // Create FormData for OpenAI API
  const openaiFormData = new FormData();
  openaiFormData.append("model", "whisper-1");
  openaiFormData.append("file", file);
  openaiFormData.append("language", "en");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: openaiFormData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const result: OpenAIResponse = await response.json();

  return {
    text: result.text,
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    let transcriptionResult: TranscriptionResponse;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData with audio file
      const formData = await req.formData();
      transcriptionResult = await handleFormDataTranscription(formData);
    } else if (contentType.includes("application/json")) {
      // Handle JSON body with base64 audio
      const body: TranscriptionRequest = await req.json();
      transcriptionResult = await handleBase64Transcription(
        body.audio || "",
        body.mimeType || "audio/webm"
      );
    } else {
      throw new Error(
        "Unsupported content type. Use multipart/form-data or application/json"
      );
    }

    return new Response(JSON.stringify(transcriptionResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Transcription error:", errorMessage);

    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
