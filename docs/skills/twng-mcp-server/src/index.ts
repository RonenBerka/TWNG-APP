#!/usr/bin/env node
/**
 * TWNG MCP Server
 *
 * MCP server for TWNG Guitar Collection Platform.
 * Provides guitar identification, database lookup, design system tokens,
 * and collection management tools for integration with Lovable and other MCP clients.
 *
 * Brand: "Every Guitar Has a Story. Finally, a place to keep them."
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { z } from "zod";

// ============================================================================
// CONSTANTS & TYPES
// ============================================================================

const CHARACTER_LIMIT = 25000;

// Guitar pickup configurations
const PICKUP_CONFIGS = ["SSS", "HSS", "HSH", "HH", "SS", "S", "H", "P90", "P90x2", "P90x3", "HHH"] as const;

// Guitar body shapes
const BODY_SHAPES = [
  "Stratocaster", "Telecaster", "Les Paul", "SG", "Flying V", "Explorer",
  "Jazzmaster", "Jaguar", "Mustang", "Offset", "Semi-Hollow", "Hollow Body",
  "Superstrat", "PRS Style", "Dreadnought", "Jumbo", "Concert", "Parlor",
  "Classical", "Bass", "Other"
] as const;

// Major guitar brands
const GUITAR_BRANDS = [
  "Fender", "Gibson", "PRS", "Ibanez", "ESP", "Jackson", "Schecter",
  "Epiphone", "Squier", "Gretsch", "Rickenbacker", "Martin", "Taylor",
  "Guild", "Yamaha", "Music Man", "G&L", "Charvel", "Suhr", "Tom Anderson",
  "Collings", "Santa Cruz", "Bourgeois", "Custom/Boutique", "Other"
] as const;

// Design tokens for TWNG
const DESIGN_TOKENS = {
  colors: {
    primary: "#D4A574",
    primaryDark: "#B8956A",
    secondary: "#2C2C2C",
    background: "#1A1A1A",
    surface: "#2C2C2C",
    textPrimary: "#FFFFFF",
    textSecondary: "#A0A0A0",
    success: "#4CAF50",
    error: "#FF5252",
    warning: "#FFC107",
    confidenceHigh: "#4CAF50",
    confidenceMedium: "#FFC107",
    confidenceLow: "#FF5252"
  },
  typography: {
    fontHeading: "'Plus Jakarta Sans', sans-serif",
    fontBody: "'Inter', sans-serif",
    sizes: {
      xs: "12px",
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "24px",
      "2xl": "32px",
      "3xl": "48px"
    }
  },
  spacing: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "24px",
    6: "32px",
    7: "48px",
    8: "64px"
  },
  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "16px",
    xl: "24px",
    full: "9999px"
  },
  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.3)",
    md: "0 4px 6px rgba(0,0,0,0.4)",
    lg: "0 10px 15px rgba(0,0,0,0.5)",
    glow: "0 0 20px rgba(212, 165, 116, 0.3)"
  }
};

// Sample guitar database (in production, this would be an API call)
const GUITAR_DATABASE: GuitarModel[] = [
  {
    id: "fender-stratocaster",
    brand: "Fender",
    model: "Stratocaster",
    variants: ["American Professional II", "Player", "Vintera", "American Vintage", "Custom Shop"],
    years: "1954-present",
    bodyShape: "Stratocaster",
    pickupConfigs: ["SSS", "HSS", "HSH"],
    typicalColors: ["Sunburst", "Olympic White", "Black", "Candy Apple Red", "Lake Placid Blue"],
    countryOfOrigin: ["USA", "Mexico", "Japan"],
    identifyingFeatures: ["Contoured body", "3 single coils", "Tremolo bridge", "6-in-line tuners"]
  },
  {
    id: "fender-telecaster",
    brand: "Fender",
    model: "Telecaster",
    variants: ["American Professional II", "Player", "Vintera", "Deluxe", "Custom Shop"],
    years: "1950-present",
    bodyShape: "Telecaster",
    pickupConfigs: ["SS", "HS"],
    typicalColors: ["Butterscotch Blonde", "Black", "Sunburst", "Olympic White"],
    countryOfOrigin: ["USA", "Mexico", "Japan"],
    identifyingFeatures: ["Slab body", "Bridge pickup with metal cover", "3-way switch", "6-in-line tuners"]
  },
  {
    id: "gibson-les-paul",
    brand: "Gibson",
    model: "Les Paul",
    variants: ["Standard", "Custom", "Studio", "Junior", "Special", "Classic"],
    years: "1952-present",
    bodyShape: "Les Paul",
    pickupConfigs: ["HH", "P90x2", "H"],
    typicalColors: ["Cherry Sunburst", "Goldtop", "Black", "Heritage Cherry", "Tobacco Burst"],
    countryOfOrigin: ["USA"],
    identifyingFeatures: ["Carved maple top", "Mahogany body", "2 humbuckers", "Tune-o-matic bridge", "3+3 headstock"]
  },
  {
    id: "gibson-sg",
    brand: "Gibson",
    model: "SG",
    variants: ["Standard", "Special", "Junior", "Custom"],
    years: "1961-present",
    bodyShape: "SG",
    pickupConfigs: ["HH", "P90x2"],
    typicalColors: ["Cherry Red", "Ebony", "Walnut", "Heritage Cherry"],
    countryOfOrigin: ["USA"],
    identifyingFeatures: ["Double cutaway", "Devil horns shape", "Thin body", "2 humbuckers", "3+3 headstock"]
  },
  {
    id: "prs-custom-24",
    brand: "PRS",
    model: "Custom 24",
    variants: ["Core", "S2", "SE", "Wood Library", "Private Stock"],
    years: "1985-present",
    bodyShape: "PRS Style",
    pickupConfigs: ["HH", "HSH"],
    typicalColors: ["McCarty Sunburst", "Emerald Green", "Whale Blue", "Charcoal Burst", "Aquamarine"],
    countryOfOrigin: ["USA", "Korea", "Indonesia"],
    identifyingFeatures: ["Bird inlays", "24 frets", "Carved top", "Tremolo", "Pattern neck"]
  }
];

interface GuitarModel {
  id: string;
  brand: string;
  model: string;
  variants: string[];
  years: string;
  bodyShape: string;
  pickupConfigs: string[];
  typicalColors: string[];
  countryOfOrigin: string[];
  identifyingFeatures: string[];
}

interface IdentificationResult {
  confidence: number;
  brand: string;
  model: string;
  variant?: string;
  year?: string;
  bodyShape: string;
  pickupConfig: string;
  color?: string;
  countryOfOrigin?: string;
  identifyingFeatures: string[];
  suggestions?: string[];
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

const IdentifyGuitarInputSchema = z.object({
  imageDescription: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must not exceed 2000 characters")
    .describe("Detailed description of the guitar image including body shape, color, pickups, headstock, and any visible features"),
  additionalContext: z.string()
    .max(500)
    .optional()
    .describe("Any additional context like serial number, case candy, or known information")
}).strict();

const SearchGuitarsInputSchema = z.object({
  query: z.string()
    .min(2, "Query must be at least 2 characters")
    .max(200, "Query must not exceed 200 characters")
    .describe("Search query for guitar brand, model, or features"),
  brand: z.string()
    .optional()
    .describe("Filter by brand name"),
  bodyShape: z.enum(BODY_SHAPES)
    .optional()
    .describe("Filter by body shape"),
  pickupConfig: z.enum(PICKUP_CONFIGS)
    .optional()
    .describe("Filter by pickup configuration"),
  limit: z.number()
    .int()
    .min(1)
    .max(50)
    .default(10)
    .describe("Maximum results to return")
}).strict();

const GetGuitarDetailsInputSchema = z.object({
  guitarId: z.string()
    .min(1)
    .describe("Guitar model ID from search results or known ID")
}).strict();

const GetDesignTokensInputSchema = z.object({
  category: z.enum(["colors", "typography", "spacing", "borderRadius", "shadows", "all"])
    .default("all")
    .describe("Category of design tokens to retrieve")
}).strict();

const ValidateGuitarDataInputSchema = z.object({
  brand: z.string().describe("Guitar brand name"),
  model: z.string().describe("Guitar model name"),
  year: z.string().optional().describe("Year or year range"),
  pickupConfig: z.string().optional().describe("Pickup configuration"),
  color: z.string().optional().describe("Guitar color/finish"),
  serialNumber: z.string().optional().describe("Serial number for validation")
}).strict();

const GetBrandModelsInputSchema = z.object({
  brand: z.string()
    .min(1)
    .describe("Brand name to get models for")
}).strict();

const GenerateGuitarStoryPromptsInputSchema = z.object({
  guitarType: z.string()
    .describe("Type of guitar (e.g., 'vintage Stratocaster', 'acoustic', 'first electric')"),
  context: z.enum(["acquisition", "memorable_moment", "sentimental", "technical", "general"])
    .default("general")
    .describe("Context for story prompts")
}).strict();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function identifyGuitarFromDescription(description: string, context?: string): IdentificationResult {
  const descLower = description.toLowerCase();
  const contextLower = (context || "").toLowerCase();
  const combined = `${descLower} ${contextLower}`;

  let bestMatch: GuitarModel | null = null;
  let confidence = 0;
  let matchedFeatures: string[] = [];

  for (const guitar of GUITAR_DATABASE) {
    let score = 0;
    const features: string[] = [];

    // Check brand
    if (combined.includes(guitar.brand.toLowerCase())) {
      score += 30;
      features.push(`Brand: ${guitar.brand}`);
    }

    // Check model
    if (combined.includes(guitar.model.toLowerCase())) {
      score += 25;
      features.push(`Model: ${guitar.model}`);
    }

    // Check body shape
    if (combined.includes(guitar.bodyShape.toLowerCase())) {
      score += 15;
      features.push(`Body: ${guitar.bodyShape}`);
    }

    // Check identifying features
    for (const feature of guitar.identifyingFeatures) {
      if (combined.includes(feature.toLowerCase())) {
        score += 5;
        features.push(feature);
      }
    }

    // Check pickup configs
    for (const config of guitar.pickupConfigs) {
      if (combined.includes(config.toLowerCase()) ||
          (config === "SSS" && combined.includes("three single coil")) ||
          (config === "HH" && combined.includes("two humbucker"))) {
        score += 10;
        features.push(`Pickups: ${config}`);
        break;
      }
    }

    // Check colors
    for (const color of guitar.typicalColors) {
      if (combined.includes(color.toLowerCase())) {
        score += 5;
        features.push(`Color: ${color}`);
        break;
      }
    }

    if (score > confidence) {
      confidence = Math.min(score, 95); // Cap at 95%
      bestMatch = guitar;
      matchedFeatures = features;
    }
  }

  if (bestMatch && confidence >= 30) {
    // Extract color from description
    let detectedColor: string | undefined;
    for (const color of bestMatch.typicalColors) {
      if (combined.includes(color.toLowerCase())) {
        detectedColor = color;
        break;
      }
    }

    // Detect pickup config
    let detectedPickup = bestMatch.pickupConfigs[0];
    for (const config of bestMatch.pickupConfigs) {
      if (combined.includes(config.toLowerCase())) {
        detectedPickup = config;
        break;
      }
    }

    return {
      confidence,
      brand: bestMatch.brand,
      model: bestMatch.model,
      bodyShape: bestMatch.bodyShape,
      pickupConfig: detectedPickup,
      color: detectedColor,
      countryOfOrigin: bestMatch.countryOfOrigin[0],
      identifyingFeatures: matchedFeatures,
      suggestions: confidence < 70 ? [
        "Upload a clearer photo showing the headstock",
        "Check for serial number on the back of the headstock",
        "Look for model name on the headstock or truss rod cover"
      ] : undefined
    };
  }

  // Low confidence fallback
  return {
    confidence: 20,
    brand: "Unknown",
    model: "Unknown",
    bodyShape: "Other",
    pickupConfig: "Unknown",
    identifyingFeatures: ["Unable to identify specific model"],
    suggestions: [
      "Try describing the headstock shape and logo",
      "Mention the number and type of pickups",
      "Describe the body shape and color",
      "Include any visible text or serial numbers"
    ]
  };
}

function searchGuitars(
  query: string,
  brand?: string,
  bodyShape?: string,
  pickupConfig?: string,
  limit: number = 10
): GuitarModel[] {
  const queryLower = query.toLowerCase();

  return GUITAR_DATABASE
    .filter(guitar => {
      // Query match
      const matchesQuery =
        guitar.brand.toLowerCase().includes(queryLower) ||
        guitar.model.toLowerCase().includes(queryLower) ||
        guitar.variants.some(v => v.toLowerCase().includes(queryLower)) ||
        guitar.identifyingFeatures.some(f => f.toLowerCase().includes(queryLower));

      // Brand filter
      const matchesBrand = !brand || guitar.brand.toLowerCase() === brand.toLowerCase();

      // Body shape filter
      const matchesShape = !bodyShape || guitar.bodyShape === bodyShape;

      // Pickup config filter
      const matchesPickup = !pickupConfig || guitar.pickupConfigs.includes(pickupConfig);

      return matchesQuery && matchesBrand && matchesShape && matchesPickup;
    })
    .slice(0, limit);
}

function generateStoryPrompts(guitarType: string, context: string): string[] {
  const basePrompts: Record<string, string[]> = {
    acquisition: [
      `How did this ${guitarType} come into your life?`,
      `What made you choose this particular guitar?`,
      `Do you remember the day you got it?`,
      `Was this a gift, a find, or a long-saved-for purchase?`
    ],
    memorable_moment: [
      `What's the most memorable moment you've had with this ${guitarType}?`,
      `Has this guitar been on stage with you? Tell us about it.`,
      `What song sounds best on this guitar?`,
      `Any recording sessions with this one?`
    ],
    sentimental: [
      `What does this ${guitarType} mean to you?`,
      `Is there a person connected to this guitar's story?`,
      `Why will you never sell this one?`,
      `What memories flood back when you pick it up?`
    ],
    technical: [
      `What modifications have you made to this ${guitarType}?`,
      `How does it play compared to others in your collection?`,
      `What's the setup like? Any custom string gauge?`,
      `What amp does this guitar love?`
    ],
    general: [
      `What's the story behind this ${guitarType}?`,
      `How did you get it?`,
      `What does it mean to you?`,
      `Any memorable moments with this guitar?`,
      `Why is it special to your collection?`
    ]
  };

  return basePrompts[context] || basePrompts.general;
}

// ============================================================================
// MCP SERVER SETUP
// ============================================================================

const server = new McpServer({
  name: "twng-mcp-server",
  version: "1.0.0"
});

// ============================================================================
// TOOL: IDENTIFY GUITAR
// ============================================================================

server.registerTool(
  "twng_identify_guitar",
  {
    title: "Identify Guitar from Description",
    description: `Analyze a guitar description/image and identify the make, model, and specifications.

This is the core tool for TWNG's "Magic Add" feature. Given a description of a guitar
(or details extracted from an image), it returns identification results with confidence scores.

Args:
  - imageDescription (string): Detailed description of the guitar
  - additionalContext (string, optional): Extra info like serial numbers

Returns:
  {
    "confidence": number (0-100),
    "brand": string,
    "model": string,
    "variant": string (optional),
    "year": string (optional),
    "bodyShape": string,
    "pickupConfig": string,
    "color": string (optional),
    "countryOfOrigin": string (optional),
    "identifyingFeatures": string[],
    "suggestions": string[] (if confidence < 70)
  }

Examples:
  - "sunburst stratocaster with SSS pickups" → Fender Stratocaster, 85% confidence
  - "red double cutaway with humbuckers" → Gibson SG, 60% confidence`,
    inputSchema: IdentifyGuitarInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params: z.infer<typeof IdentifyGuitarInputSchema>) => {
    const result = identifyGuitarFromDescription(
      params.imageDescription,
      params.additionalContext
    );

    const output = {
      success: true,
      identification: result
    };

    return {
      content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
      structuredContent: output
    };
  }
);

// ============================================================================
// TOOL: SEARCH GUITARS
// ============================================================================

server.registerTool(
  "twng_search_guitars",
  {
    title: "Search Guitar Database",
    description: `Search the TWNG guitar database by brand, model, features, or free text.

Use this to find guitars in the database, get model information, or validate user selections.

Args:
  - query (string): Search text
  - brand (string, optional): Filter by brand
  - bodyShape (string, optional): Filter by body shape
  - pickupConfig (string, optional): Filter by pickup configuration
  - limit (number, optional): Max results (default 10)

Returns:
  {
    "total": number,
    "guitars": [{
      "id": string,
      "brand": string,
      "model": string,
      "variants": string[],
      "years": string,
      "bodyShape": string,
      "pickupConfigs": string[],
      "typicalColors": string[],
      "countryOfOrigin": string[]
    }]
  }`,
    inputSchema: SearchGuitarsInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params: z.infer<typeof SearchGuitarsInputSchema>) => {
    const results = searchGuitars(
      params.query,
      params.brand,
      params.bodyShape,
      params.pickupConfig,
      params.limit
    );

    const output = {
      total: results.length,
      guitars: results
    };

    return {
      content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
      structuredContent: output
    };
  }
);

// ============================================================================
// TOOL: GET DESIGN TOKENS
// ============================================================================

server.registerTool(
  "twng_get_design_tokens",
  {
    title: "Get TWNG Design Tokens",
    description: `Retrieve TWNG's design system tokens for consistent UI implementation.

Returns colors, typography, spacing, border radius, and shadow values used in TWNG's design system.

Args:
  - category (string): "colors" | "typography" | "spacing" | "borderRadius" | "shadows" | "all"

Returns design tokens object with CSS values for the requested category.

Brand Guidelines:
  - Primary color: Warm amber (#D4A574) for CTAs and accents
  - Dark theme: Background #1A1A1A, Surface #2C2C2C
  - Fonts: Plus Jakarta Sans (headings), Inter (body)`,
    inputSchema: GetDesignTokensInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params: z.infer<typeof GetDesignTokensInputSchema>) => {
    let output: Record<string, unknown>;

    if (params.category === "all") {
      output = {
        brand: {
          name: "TWNG",
          tagline: "Every Guitar Has a Story",
          subtitle: "Finally, a place to keep them."
        },
        tokens: DESIGN_TOKENS
      };
    } else {
      output = {
        category: params.category,
        tokens: DESIGN_TOKENS[params.category]
      };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
      structuredContent: output
    };
  }
);

// ============================================================================
// TOOL: GET BRAND MODELS
// ============================================================================

server.registerTool(
  "twng_get_brand_models",
  {
    title: "Get Models by Brand",
    description: `Get all guitar models available for a specific brand.

Use this to populate dropdowns or validate brand/model combinations.

Args:
  - brand (string): Brand name

Returns list of models with their variants and specifications.`,
    inputSchema: GetBrandModelsInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params: z.infer<typeof GetBrandModelsInputSchema>) => {
    const models = GUITAR_DATABASE.filter(
      g => g.brand.toLowerCase() === params.brand.toLowerCase()
    );

    const output = {
      brand: params.brand,
      modelCount: models.length,
      models: models.map(m => ({
        model: m.model,
        variants: m.variants,
        years: m.years,
        bodyShape: m.bodyShape
      }))
    };

    return {
      content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
      structuredContent: output
    };
  }
);

// ============================================================================
// TOOL: VALIDATE GUITAR DATA
// ============================================================================

server.registerTool(
  "twng_validate_guitar_data",
  {
    title: "Validate Guitar Data",
    description: `Validate guitar information for accuracy and completeness.

Use this to validate user-entered data before saving to collection.

Args:
  - brand (string): Guitar brand
  - model (string): Guitar model
  - year (string, optional): Year or range
  - pickupConfig (string, optional): Pickup configuration
  - color (string, optional): Color/finish
  - serialNumber (string, optional): Serial number

Returns validation results with any issues or suggestions.`,
    inputSchema: ValidateGuitarDataInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params: z.infer<typeof ValidateGuitarDataInputSchema>) => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let isValid = true;

    // Check if brand exists
    const brandMatch = GUITAR_DATABASE.find(
      g => g.brand.toLowerCase() === params.brand.toLowerCase()
    );

    if (!brandMatch) {
      suggestions.push(`Brand "${params.brand}" not in database - please verify spelling`);
    }

    // Check if model exists for brand
    if (brandMatch) {
      const modelMatch = GUITAR_DATABASE.find(
        g => g.brand.toLowerCase() === params.brand.toLowerCase() &&
             g.model.toLowerCase() === params.model.toLowerCase()
      );

      if (!modelMatch) {
        suggestions.push(`Model "${params.model}" not found for ${params.brand} - custom or rare model?`);
      } else {
        // Validate pickup config
        if (params.pickupConfig && !modelMatch.pickupConfigs.includes(params.pickupConfig)) {
          suggestions.push(`${params.pickupConfig} is unusual for ${params.brand} ${params.model}`);
        }
      }
    }

    // Year validation
    if (params.year) {
      const yearNum = parseInt(params.year);
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
        issues.push(`Year "${params.year}" seems invalid`);
        isValid = false;
      }
    }

    const output = {
      isValid,
      issues,
      suggestions,
      data: params
    };

    return {
      content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
      structuredContent: output
    };
  }
);

// ============================================================================
// TOOL: GENERATE STORY PROMPTS
// ============================================================================

server.registerTool(
  "twng_generate_story_prompts",
  {
    title: "Generate Story Prompts",
    description: `Generate personalized story prompts for a guitar.

Use this in the "story" step of Magic Add or when prompting users to add stories to their guitars.

Args:
  - guitarType (string): Description of the guitar
  - context (string): "acquisition" | "memorable_moment" | "sentimental" | "technical" | "general"

Returns array of story prompts tailored to the guitar and context.`,
    inputSchema: GenerateGuitarStoryPromptsInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params: z.infer<typeof GenerateGuitarStoryPromptsInputSchema>) => {
    const prompts = generateStoryPrompts(params.guitarType, params.context);

    const output = {
      guitarType: params.guitarType,
      context: params.context,
      prompts,
      voiceInputEnabled: true,
      voiceInputHint: "Tap the microphone to tell your story"
    };

    return {
      content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
      structuredContent: output
    };
  }
);

// ============================================================================
// TOOL: GET UI COPY
// ============================================================================

const GetUICopyInputSchema = z.object({
  screen: z.enum([
    "magic_add_capture",
    "magic_add_processing",
    "magic_add_results",
    "magic_add_story",
    "magic_add_complete",
    "empty_collection",
    "guitar_profile",
    "onboarding"
  ]).describe("Screen to get copy for")
}).strict();

server.registerTool(
  "twng_get_ui_copy",
  {
    title: "Get UI Copy",
    description: `Get UI copy and microcopy for TWNG screens.

Returns headlines, button labels, helper text, and error messages for specified screens.

Args:
  - screen (string): Screen identifier

Returns copy object with all text elements for the screen.`,
    inputSchema: GetUICopyInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params: z.infer<typeof GetUICopyInputSchema>) => {
    const copy: Record<string, Record<string, unknown>> = {
      magic_add_capture: {
        headline: "Let's see your guitar",
        helper: "Center your guitar in the frame",
        buttons: {
          capture: "Take Photo",
          gallery: "Choose from Gallery",
          cancel: "Cancel"
        }
      },
      magic_add_processing: {
        headline: "Hang tight...",
        sequence: [
          "Uploading...",
          "Analyzing...",
          "Identifying make and model...",
          "Almost there..."
        ]
      },
      magic_add_results: {
        headline: "We found your guitar!",
        confidence: {
          high: "We're confident about this one",
          medium: "This looks right, but verify below",
          low: "We need a little help"
        },
        buttons: {
          confirm: "Looks right!",
          edit: "Something wrong? Edit",
          retry: "Try another photo"
        }
      },
      magic_add_story: {
        headline: "Now for the best part...",
        subheadline: "What's the story behind this guitar?",
        placeholder: "How did you get it? What does it mean to you?",
        voiceHint: "Tap to tell your story",
        buttons: {
          save: "Save to Collection",
          skip: "Skip for now"
        }
      },
      magic_add_complete: {
        headline: "Added to your collection!",
        subheadline: "Your guitar is safe and sound",
        buttons: {
          view: "View Guitar",
          another: "Add Another"
        }
      },
      empty_collection: {
        headline: "Your collection is waiting",
        subheadline: "Add your first guitar to get started",
        cta: "Add a Guitar"
      },
      guitar_profile: {
        sections: {
          story: "The Story",
          specs: "Specifications",
          photos: "Photos",
          timeline: "Timeline"
        },
        emptyStory: "Every guitar has a story. What's yours?",
        addStoryButton: "Add Your Story"
      },
      onboarding: {
        screens: [
          {
            headline: "Every Guitar Has a Story",
            subheadline: "TWNG is your private place to keep them all"
          },
          {
            headline: "Magic Add",
            subheadline: "Snap a photo. We'll identify your guitar instantly."
          },
          {
            headline: "Tell Your Story",
            subheadline: "The memories, the moments, the meaning."
          },
          {
            headline: "Your Collection, Your Way",
            subheadline: "Private by default. Share only what you want."
          }
        ],
        buttons: {
          next: "Next",
          skip: "Skip",
          getStarted: "Get Started"
        }
      }
    };

    const output = {
      screen: params.screen,
      copy: copy[params.screen] || {}
    };

    return {
      content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
      structuredContent: output
    };
  }
);

// ============================================================================
// TOOL: GET SUPPORTED VALUES
// ============================================================================

const GetSupportedValuesInputSchema = z.object({
  type: z.enum(["brands", "body_shapes", "pickup_configs", "all"])
    .describe("Type of values to retrieve")
}).strict();

server.registerTool(
  "twng_get_supported_values",
  {
    title: "Get Supported Values",
    description: `Get lists of supported values for dropdowns and validation.

Returns arrays of valid options for brands, body shapes, pickup configurations, etc.

Args:
  - type (string): "brands" | "body_shapes" | "pickup_configs" | "all"`,
    inputSchema: GetSupportedValuesInputSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false
    }
  },
  async (params: z.infer<typeof GetSupportedValuesInputSchema>) => {
    const values: Record<string, readonly string[]> = {
      brands: GUITAR_BRANDS,
      body_shapes: BODY_SHAPES,
      pickup_configs: PICKUP_CONFIGS
    };

    let output: Record<string, unknown>;

    if (params.type === "all") {
      output = values;
    } else {
      output = {
        type: params.type,
        values: values[params.type]
      };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
      structuredContent: output
    };
  }
);

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function runStdio() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TWNG MCP server running via stdio");
}

async function runHTTP() {
  const app = express();
  app.use(express.json());

  app.post('/mcp', async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    });
    res.on('close', () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', server: 'twng-mcp-server', version: '1.0.0' });
  });

  const port = parseInt(process.env.PORT || '3000');
  app.listen(port, () => {
    console.error(`TWNG MCP server running on http://localhost:${port}/mcp`);
  });
}

// Choose transport based on environment
const transport = process.env.TRANSPORT || 'stdio';
if (transport === 'http') {
  runHTTP().catch(error => {
    console.error("Server error:", error);
    process.exit(1);
  });
} else {
  runStdio().catch(error => {
    console.error("Server error:", error);
    process.exit(1);
  });
}
