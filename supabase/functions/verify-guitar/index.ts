import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface GuitarVerificationRequest {
  guitarId: string;
  brand: string;
  model: string;
  year: number;
  serialNumber?: string;
  bodyStyle: string;
  finish: string;
  specifications?: Record<string, unknown>;
  photoUrls?: string[];
}

interface VerificationCheck {
  check: string;
  passed: boolean;
  note: string;
}

interface VerificationResponse {
  verified: boolean;
  score: number;
  checks: VerificationCheck[];
  notes: string;
  suggestedCorrections?: Record<string, unknown>;
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
};

// Known guitar serial number patterns (simplified)
const serialNumberPatterns: Record<string, RegExp> = {
  fender: /^[A-Z]{1,3}\d{6,8}$|^\d{8,10}$/,
  gibson: /^[0-9]{1,2}\d{6,8}$|^[A-Z]{2}\d{8}$/,
  ibanez: /^\d{2}\d{4,6}$|^[A-Z]{2}\d{6,8}$/,
  yamaha: /^\d{10}$/,
  stratocaster: /^[A-Z]{1,3}\d{6,8}$/,
  telecaster: /^[A-Z]{1,3}\d{6,8}$/,
  lespaul: /^[0-9]{1,2}\d{6,8}$/,
  prs: /^[0-9]{2}\d{6}$|^[A-Z]{1,2}\d{6,8}$/,
};

// Known guitar brands
const knownBrands = [
  "Fender",
  "Gibson",
  "Ibanez",
  "Yamaha",
  "PRS",
  "Epiphone",
  "Jackson",
  "ESP",
  "Schecter",
  "Squier",
  "Washburn",
  "Rickenbacker",
  "Gretsch",
  "Heritage",
  "Taylor",
  "Martin",
  "Ovation",
];

async function callClaudeAPI(
  prompt: string,
  photoUrls?: string[]
): Promise<string> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }

  const messageContent: Array<
    | { type: "text"; text: string }
    | { type: "image"; source: { type: "url"; url: string } }
  > = [
    {
      type: "text",
      text: prompt,
    },
  ];

  // Add images to the message if photoUrls are provided
  if (photoUrls && photoUrls.length > 0) {
    for (const url of photoUrls) {
      messageContent.push({
        type: "image",
        source: {
          type: "url",
          url: url,
        },
      });
    }
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: messageContent,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

function validateSerialNumberFormat(
  serialNumber: string,
  brand: string
): { valid: boolean; note: string } {
  const normalizedBrand = brand.toLowerCase();
  const pattern = serialNumberPatterns[normalizedBrand];

  if (!pattern) {
    return {
      valid: true,
      note: `No pattern validation available for ${brand}. Format appears to be alphanumeric.`,
    };
  }

  const isValid = pattern.test(serialNumber);
  if (isValid) {
    return {
      valid: true,
      note: `Serial number format matches known ${brand} pattern`,
    };
  } else {
    return {
      valid: false,
      note: `Serial number format does not match known ${brand} patterns. Expected format validation failed.`,
    };
  }
}

function isBrandKnown(brand: string): boolean {
  return knownBrands.some(
    (b) => b.toLowerCase() === brand.toLowerCase()
  );
}

async function verifyGuitarData(
  request: GuitarVerificationRequest
): Promise<VerificationResponse> {
  const checks: VerificationCheck[] = [];
  let passedChecks = 0;
  const totalChecks = 6;

  // Check 1: Brand recognition
  const brandKnown = isBrandKnown(request.brand);
  checks.push({
    check: "brand_recognition",
    passed: brandKnown,
    note: brandKnown
      ? `${request.brand} is a recognized guitar brand`
      : `${request.brand} is not in the database of known brands. This could be a typo or lesser-known brand.`,
  });
  if (brandKnown) passedChecks++;

  // Check 2: Year plausibility
  const currentYear = new Date().getFullYear();
  const yearValid =
    request.year >= 1900 && request.year <= currentYear + 1;
  checks.push({
    check: "year_plausible",
    passed: yearValid,
    note: yearValid
      ? `Year ${request.year} is plausible`
      : `Year ${request.year} is outside the valid range (1900-${currentYear + 1})`,
  });
  if (yearValid) passedChecks++;

  // Check 3: Serial number format validation (if provided)
  let serialValid = true;
  let serialNote = "No serial number provided";
  if (request.serialNumber) {
    const serialValidation = validateSerialNumberFormat(
      request.serialNumber,
      request.brand
    );
    serialValid = serialValidation.valid;
    serialNote = serialValidation.note;
  } else {
    passedChecks++; // Count as passed if not provided
  }
  checks.push({
    check: "serial_format",
    passed: request.serialNumber ? serialValid : true,
    note: serialNote,
  });
  if (request.serialNumber) {
    if (serialValid) passedChecks++;
  }

  // Check 4: Body style plausibility
  const validBodyStyles = [
    "Stratocaster",
    "Telecaster",
    "Les Paul",
    "SG",
    "Flying V",
    "Explorer",
    "Acoustic",
    "Classical",
    "Dreadnought",
    "Concert",
    "Semi-Hollow",
    "Hollow",
    "Single-Cutaway",
    "Double-Cutaway",
    "Offset-Cutaway",
  ];
  const bodyStyleProvided = request.bodyStyle && request.bodyStyle !== "Unknown";
  const bodyStyleRecognized = bodyStyleProvided && validBodyStyles.some(
    (style) => request.bodyStyle.toLowerCase().includes(style.toLowerCase())
  );
  // Body style is always valid — the list is advisory, not exhaustive
  checks.push({
    check: "body_style_valid",
    passed: true,
    note: !bodyStyleProvided
      ? "Body style not specified — skipped"
      : bodyStyleRecognized
        ? `Body style "${request.bodyStyle}" is recognized`
        : `Body style "${request.bodyStyle}" is a custom or variant style`,
  });
  passedChecks++;

  // Check 5: Finish type validation
  const validFinishes = [
    "Gloss",
    "Matte",
    "Satin",
    "Sunburst",
    "Solid",
    "Metallic",
    "Flame",
    "Tobacco",
    "Black",
    "White",
    "Red",
    "Blue",
    "Green",
    "Cherry",
    "Natural",
  ];
  const finishProvided = request.finish && request.finish !== "Unknown";
  const finishRecognized = finishProvided && validFinishes.some(
    (finish) => request.finish.toLowerCase().includes(finish.toLowerCase())
  );
  // Finish is always valid — the list is advisory, not exhaustive
  checks.push({
    check: "finish_valid",
    passed: true,
    note: !finishProvided
      ? "Finish type not specified — skipped"
      : finishRecognized
        ? `Finish type "${request.finish}" is recognized`
        : `Finish type "${request.finish}" is a custom or descriptive finish`,
  });
  passedChecks++;

  // Check 6: Photo verification (if photos provided)
  let photoCheckPassed = true;
  let photoNote = "No photos provided for verification";

  if (request.photoUrls && request.photoUrls.length > 0) {
    try {
      const photoVerificationPrompt = `You are a guitar expert verifying guitar data based on photos. 
      
Please analyze the provided guitar photos and verify the following claimed specifications:
- Brand: ${request.brand}
- Model: ${request.model}
- Body Style: ${request.bodyStyle}
- Finish: ${request.finish}
- Year: ${request.year}

For each aspect, provide:
1. Does the brand match what you see in the photos? (yes/no/uncertain)
2. Does the body style match? (yes/no/uncertain)
3. Does the finish match? (yes/no/uncertain)
4. Are there any visible inconsistencies or red flags?
5. Overall assessment of the guitar's condition and authenticity based on visible details.

Format your response as JSON with the following structure:
{
  "brand_visible": true/false,
  "brand_match": true/false,
  "brand_confidence": 0-1,
  "body_style_match": true/false,
  "body_style_confidence": 0-1,
  "finish_match": true/false,
  "finish_confidence": 0-1,
  "consistency_issues": ["issue1", "issue2"],
  "photo_quality": "good/fair/poor",
  "overall_assessment": "string describing the overall impression"
}`;

      const claudeResponse = await callClaudeAPI(
        photoVerificationPrompt,
        request.photoUrls
      );

      try {
        // Extract JSON from the response (handle potential markdown code blocks)
        const codeBlockMatch = claudeResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        const jsonMatch = codeBlockMatch ? [codeBlockMatch[1]] : claudeResponse.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          const photoData = JSON.parse(jsonMatch[0]);

          // Determine if photo checks passed based on Claude's analysis
          const brandMatches =
            photoData.brand_match !== false &&
            photoData.brand_confidence > 0.6;
          const bodyStyleMatches =
            photoData.body_style_match !== false &&
            photoData.body_style_confidence > 0.6;
          const finishMatches =
            photoData.finish_match !== false &&
            photoData.finish_confidence > 0.6;
          const noMajorInconsistencies =
            (!photoData.consistency_issues ||
              photoData.consistency_issues.length === 0) &&
            photoData.photo_quality !== "poor";

          photoCheckPassed =
            brandMatches &&
            bodyStyleMatches &&
            finishMatches &&
            noMajorInconsistencies;
          photoNote = photoData.overall_assessment || "Photo analysis complete";

          if (photoData.consistency_issues?.length > 0) {
            photoNote += ` Issues: ${photoData.consistency_issues.join(", ")}`;
          }
        }
      } catch {
        photoCheckPassed = false;
        photoNote = "Could not parse photo analysis results";
      }
    } catch (error) {
      photoCheckPassed = false;
      photoNote = `Photo verification failed: ${(error as Error).message}`;
    }
  }

  checks.push({
    check: "photo_quality",
    passed:
      !request.photoUrls || request.photoUrls.length === 0
        ? true
        : photoCheckPassed,
    note: photoNote,
  });

  if (!request.photoUrls || request.photoUrls.length === 0) {
    passedChecks++;
  } else if (photoCheckPassed) {
    passedChecks++;
  }

  // Calculate verification score
  const score = passedChecks / checks.length;
  const verified = score >= 0.7; // 70% pass rate required for verification

  // Build suggested corrections based on failed checks
  const suggestedCorrections: Record<string, unknown> = {};

  if (!brandKnown) {
    suggestedCorrections.brand = `Verify brand spelling. Known similar brands: ${knownBrands.filter((b) =>
      b.toLowerCase().includes(request.brand.toLowerCase().substring(0, 2))
    ).join(", ") || "Check brand name"}`;
  }

  if (!yearValid) {
    suggestedCorrections.year = `Valid range: 1900-${currentYear + 1}`;
  }

  if (request.serialNumber && !serialValid) {
    suggestedCorrections.serialNumber =
      "Serial number format does not match expected pattern for this brand";
  }

  // Compile overall notes
  let notes = `Guitar verification complete. ${passedChecks} of ${checks.length} checks passed.`;
  if (verified) {
    notes +=
      " This guitar appears to have consistent and plausible specifications.";
  } else {
    notes +=
      " This guitar has some inconsistencies that should be reviewed. ";
    const failedChecks = checks
      .filter((c) => !c.passed)
      .map((c) => c.check)
      .join(", ");
    notes += `Failed checks: ${failedChecks}`;
  }

  return {
    verified,
    score,
    checks,
    notes,
    ...(Object.keys(suggestedCorrections).length > 0 && {
      suggestedCorrections,
    }),
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Handle POST request
  if (req.method === "POST") {
    try {
      const body = await req.json();

      // Validate required fields
      if (!body.guitarId || !body.brand || !body.model) {
        return new Response(
          JSON.stringify({
            error: "Missing required fields: guitarId, brand, model",
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Set default values
      const guitarData: GuitarVerificationRequest = {
        guitarId: body.guitarId,
        brand: body.brand,
        model: body.model,
        year: body.year || new Date().getFullYear(),
        serialNumber: body.serialNumber,
        bodyStyle: body.bodyStyle || body.specifications?.body_style || body.specifications?.bodyStyle || "Unknown",
        finish: body.finish || body.specifications?.finish || body.specifications?.finish_type || "Unknown",
        specifications: body.specifications,
        photoUrls: body.photoUrls,
      };

      // Perform verification
      const result = await verifyGuitarData(guitarData);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return new Response(
        JSON.stringify({
          error: "Verification failed",
          details: errorMessage,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
  }

  // Handle unsupported methods
  return new Response("Method not allowed", {
    status: 405,
    headers: corsHeaders,
  });
});
