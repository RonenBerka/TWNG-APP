---
name: animation-prompt-generator
description: Generate optimized AI prompts for animation creation tools (ChatGPT, Gemini, Claude, etc.) based on user-provided scripts, sketches, examples, and brand voice. Use when the user wants to (1) create prompts for animation generation from scripts or storyboards, (2) adapt existing animation examples into reusable prompts, (3) maintain brand consistency across animation projects, (4) generate prompts for motion graphics or 2D animations, (5) create prompts for short-form video content (banners, mobile), or (6) convert Hebrew/English mixed content into effective AI generation prompts.
---

## 📅 Dynamic Context

**Today**: !`date '+%A, %d %B %Y'`
**Session ID**: !`echo "Session-$(date '+%Y%m%d-%H%M%S')" | head -c 25`
**Version Tracking**: !`date '+Week %V of %Y'`

---

# Animation Prompt Generator

Generate high-quality, structured prompts for AI animation tools based on user's scripts, sketches, brand voice, and reference examples.

## Core Workflow

### Step 1: Gather Input Materials

Collect and analyze all available materials:

**Script/Storyboard Analysis:**
- Extract scene-by-scene breakdown
- Identify key visual moments
- Note timing and transitions
- Parse both Hebrew and English text naturally

**Sketches/Visual References:**
- Analyze visual style and composition
- Note color palettes and design elements
- Identify character or object styles
- Document layout patterns

**Brand Voice/Tone:**
- Extract personality traits (playful, professional, minimal, bold)
- Identify color schemes and typography preferences
- Note any brand-specific visual elements
- Document tone keywords (energetic, calm, sophisticated, fun)

**Example Analysis:**
- What worked well in past animations?
- What visual patterns repeat?
- What style consistency exists?

### Step 2: Create the Comprehensive Prompt

Generate a structured prompt with these sections:

#### Section A: Project Overview
```
Project Type: [Short-form video/Banner/Mobile content]
Duration: [Target length in seconds]
Platform: [Instagram/Facebook/Mobile App/Banner Ad]
Primary Goal: [Brand awareness/Product showcase/Engagement/Call-to-action]
```

#### Section B: Visual Style Specifications
```
Animation Style: [Motion graphics/2D animation/Kinetic typography/Mixed]
Visual Mood: [Energetic/Calm/Professional/Playful/Bold/Minimal]
Color Palette: [Primary colors, secondary colors, accents]
Typography: [Font styles, text treatment, animation approach]
Design Elements: [Icons, shapes, patterns, textures]
Reference Style: [Describe or reference similar visual styles]
```

#### Section C: Scene-by-Scene Breakdown
For each scene, provide:
```
Scene [N]: [Scene Title/Purpose]
- Timing: [Seconds from-to]
- Visual Elements: [What appears on screen]
- Text/Copy: [Exact text in Hebrew/English as needed]
- Animation Behavior: [How elements move, enter, exit]
- Transition: [How to move to next scene]
- Audio/SFX: [If relevant - music cues, sound effects]
```

#### Section D: Technical Specifications
```
Aspect Ratio: [16:9, 9:16, 1:1, etc.]
Resolution: [1080x1920, 1920x1080, etc.]
Frame Rate: [24fps, 30fps, 60fps]
File Format: [MP4, MOV, GIF]
Special Requirements: [Transparency, loops, subtitles]
```

#### Section E: Brand Consistency Guidelines
```
Must Include:
- [Logo placement and timing]
- [Brand colors usage]
- [Typography rules]
- [Visual elements that must appear]

Must Avoid:
- [Colors/styles that don't fit brand]
- [Visual elements that conflict with brand]
```

#### Section F: Call-to-Action & Closing
```
CTA: [Text and visual treatment]
Closing Frame: [Logo, tagline, contact info]
End Behavior: [Hold, fade, loop]
```

### Step 3: Generate AI Tool-Specific Variants

Create optimized versions for different platforms:

**For ChatGPT (DALL-E integration):**
- Emphasize visual descriptions and composition
- Break down into frame-by-frame still descriptions
- Focus on art direction and style keywords

**For Gemini:**
- Provide structured JSON-like format
- Include temporal sequencing
- Emphasize logical flow and relationships

**For Claude (Artifact creation):**
- Focus on code-first approach for web animations
- Include CSS/SVG/Canvas specifications
- Provide implementation details

**For Midjourney-style tools:**
- Convert to comma-separated style keywords
- Include artistic references and modifiers
- Emphasize aesthetic descriptors

### Step 4: Output Formats

Present results with:

1. **Master Prompt**: Complete, tool-agnostic version
2. **Tool-Specific Variants**: Optimized for selected platforms
3. **Quick Reference Card**: Key visual and brand elements
4. **Iteration Guide**: How to refine based on output

## Language Handling

- Handle Hebrew and English naturally without translation unless requested
- Preserve original language for copy/text elements
- Use English for technical specifications
- Mixed-language scripts are normal - maintain as-is in prompts

## Best Practices

**Specificity Over Generality:**
- Use precise color values (#HEX codes) not "blue"
- Specify exact timing (0.5s, 2s) not "quick" or "slow"
- Name specific animation types (ease-in-out, bounce, linear)

**Visual Consistency:**
- Maintain same style descriptors across all scenes
- Reference the same color palette throughout
- Keep typography treatment consistent

**Actionable Language:**
- "Logo scales up from 0.5x to 1x over 0.8s with ease-out"
- Not: "Logo appears nicely"

**Completeness:**
- Every visual element should be described
- Every transition should be specified
- No assumptions about "default" behavior

## Common Patterns

**Product Showcase:**
1. Hook: Visual grab (0-2s)
2. Problem: Show pain point (2-5s)
3. Solution: Introduce product (5-10s)
4. Benefits: Show key features (10-15s)
5. CTA: Call to action (15-18s)

**Brand Awareness:**
1. Pattern/Visual rhythm (0-3s)
2. Brand element reveal (3-6s)
3. Key message (6-12s)
4. Logo/Tagline (12-15s)

**Social Media Hook:**
1. Stop-scroll moment (0-1s)
2. Intrigue/Question (1-3s)
3. Payoff/Answer (3-8s)
4. CTA (8-10s)

## Quality Checklist

Before delivering prompts, verify:
- ✅ All scenes have timing specified
- ✅ Color palette is documented with values
- ✅ Brand voice is clearly described
- ✅ Technical specs match platform requirements
- ✅ Animation behaviors are specific not vague
- ✅ Transitions between scenes are defined
- ✅ Text/copy is exact (not paraphrased)
- ✅ Mixed Hebrew/English is preserved correctly
