# TWNG MCP Server

MCP (Model Context Protocol) server for **TWNG Guitar Collection Platform**.

> "Every Guitar Has a Story. Finally, a place to keep them."

## Overview

This MCP server provides tools for guitar identification, database lookup, design system tokens, and UI copy for building TWNG features. It's designed to integrate with Lovable or any MCP-compatible client.

## Tools

| Tool | Description |
|------|-------------|
| `twng_identify_guitar` | Identify guitar from image description (Magic Add core) |
| `twng_search_guitars` | Search guitar database by brand, model, features |
| `twng_get_design_tokens` | Get TWNG design system tokens (colors, typography, spacing) |
| `twng_get_brand_models` | Get all models for a specific brand |
| `twng_validate_guitar_data` | Validate guitar information before saving |
| `twng_generate_story_prompts` | Generate personalized story prompts |
| `twng_get_ui_copy` | Get UI copy for specific screens |
| `twng_get_supported_values` | Get lists of valid options (brands, body shapes, pickups) |

## Installation

```bash
# Clone or copy the server
cd twng-mcp-server

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run the server
npm start
```

## Configuration for Lovable

Add this to your Lovable Personal Connectors:

### For Local Development (stdio)

```json
{
  "mcpServers": {
    "twng": {
      "command": "node",
      "args": ["/path/to/twng-mcp-server/dist/index.js"]
    }
  }
}
```

### For Remote/HTTP

```json
{
  "mcpServers": {
    "twng": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

To run in HTTP mode:

```bash
TRANSPORT=http npm start
```

## Example Usage

### Magic Add Flow

```typescript
// 1. User uploads photo → extract description
const description = "sunburst stratocaster with white pickguard, three single coils, rosewood fretboard";

// 2. Identify guitar
const result = await twng_identify_guitar({
  imageDescription: description,
  additionalContext: "serial number starts with Z1"
});
// Returns: { confidence: 85, brand: "Fender", model: "Stratocaster", ... }

// 3. Get story prompts
const prompts = await twng_generate_story_prompts({
  guitarType: "Fender Stratocaster",
  context: "acquisition"
});
// Returns: ["How did this Fender Stratocaster come into your life?", ...]
```

### Design Tokens

```typescript
const tokens = await twng_get_design_tokens({ category: "colors" });
// Returns: { primary: "#D4A574", background: "#1A1A1A", ... }
```

### Validation

```typescript
const validation = await twng_validate_guitar_data({
  brand: "Gibson",
  model: "Les Paul",
  year: "1959",
  pickupConfig: "HH"
});
// Returns: { isValid: true, issues: [], suggestions: [] }
```

## Design System

TWNG uses a warm, dark theme optimized for displaying guitars:

### Colors
- **Primary**: `#D4A574` (Warm amber - CTAs, accents)
- **Background**: `#1A1A1A` (Deep dark)
- **Surface**: `#2C2C2C` (Cards, modals)
- **Text Primary**: `#FFFFFF`
- **Text Secondary**: `#A0A0A0`

### Typography
- **Headings**: Plus Jakarta Sans
- **Body**: Inter

### Brand Voice
- Warm, personal, guitar-enthusiast-friendly
- "Keep" instead of "document"
- Stories > specs
- Private by default

## Development

```bash
# Watch mode
npm run dev

# Build
npm run build

# Clean
npm run clean
```

## License

Proprietary - TWNG
