# TWNG Marketing Automation Systems — Implementation Guide

## Overview

**5 interconnected automation systems** designed to drive user acquisition, engagement, and retention for TWNG.

- **Total Estimated Cost**: $200-250/month
- **Tech Stack**: Apify (web scraping) + Make.com (orchestration) + Claude API (AI) + Supabase (database) + Resend (email)
- **Launch Timeline**: Week 1-4 (phased rollout)
- **Development Effort**: ~80 hours (includes templates, configuration, testing)

---

## System A: Featured Content Pipeline

**Status**: Blueprint Ready
**Launch**: Week 1
**Complexity**: High
**Monthly Cost**: $50-80 (Apify $50 + Make scenarios $20-30)

### Concept

Automatically discover high-engagement guitar content from Instagram → qualify with AI → generate SEO-optimized articles → publish to TWNG blog → drive traffic back to platform.

### Flow Diagram

```
Daily 7 AM UTC
  ↓
Apify Instagram Hashtag Scraper
  ↓ (50 posts per hashtag × 15 hashtags = 750 posts)
Make Webhook Trigger
  ↓
Module 1: Format Data
  ↓
Module 2: Batch 750 posts (process in chunks of 10)
  ↓
Module 3: Claude API - is_guitar_post classifier
  ↓ (filter to ~50-100 genuine guitar posts)
Module 4: Claude API - qualification scorer
  ↓ (select top 5-10 by score)
Module 5: Google Sheets - Append to Featured_Content_Queue
  ↓
Module 6: Slack notification (daily digest)
  ↓
[Manual Review - Editor picks 1-2 for article generation]
  ↓
Module 7: Claude API - article generator
  ↓
Module 8: Supabase insert (featured_posts table)
  ↓
Module 9: Trigger blog publishing workflow
```

### Detailed Make.com Scenario Steps

#### Step 1: Apify Trigger (Scheduled)
- **Module Type**: Webhooks > Custom Webhook
- **Trigger Time**: Daily at 7:00 AM UTC (use Make scheduling)
- **Payload**: `{ "run": true }`

#### Step 2: Call Apify Actor
- **Module Type**: HTTP > Make a request
- **URL**: `https://api.apify.com/v2/actor-tasks/{{apifyTaskId}}/run-sync-get-dataset-items`
- **Method**: POST
- **Headers**:
  - `Authorization: Bearer {{APIFY_API_KEY}}`
- **Body**:
  ```json
  {
    "timeout": 3600
  }
  ```
- **Note**: Replace `{{apifyTaskId}}` with your Apify task ID for Instagram hashtag scraper

#### Step 3: Parse Apify Results
- **Module Type**: Set multiple variables (or use Array > Create Iterator)
- **Variables**:
  - `total_posts` = `length(data.items)`
  - `raw_posts` = `data.items`

#### Step 4: Batch Posts for AI Classification
- **Module Type**: Array > Create Iterator
- **Array**: `raw_posts`
- **Notes**: Creates loop for each post

#### Step 5: Format Post Data
- **Module Type**: Text > Compose
- **Output**:
  ```json
  {
    "id": "{{item.id}}",
    "caption": "{{item.caption}}",
    "likes": {{item.likes}},
    "comments": {{item.comments}},
    "user": "{{item.author.username}}",
    "avatar": "{{item.author.avatar_url}}",
    "image_url": "{{item.image.url}}",
    "posted_at": "{{item.timestamp}}",
    "url": "{{item.url}}"
  }
  ```

#### Step 6: Claude API - is_guitar_post Classifier
- **Module Type**: HTTP > Make a request
- **URL**: `https://api.anthropic.com/v1/messages`
- **Method**: POST
- **Headers**:
  - `Content-Type: application/json`
  - `x-api-key: {{CLAUDE_API_KEY}}`
  - `anthropic-version: 2023-06-01`
- **Body**:
  ```json
  {
    "model": "claude-opus-4-6",
    "max_tokens": 100,
    "messages": [
      {
        "role": "user",
        "content": "You are an expert guitar identifier. Analyze this Instagram post and determine if it features a guitar.\n\nCaption: {{caption}}\nLikes: {{likes}}\nComments: {{comments}}\n\nRespond with ONLY a JSON object: {\"is_guitar_post\": true/false, \"confidence\": 0-100, \"reasoning\": \"brief reason\"}"
      }
    ]
  }
  ```
- **Output Mapping**: Extract JSON from `content[0].text`

#### Step 7: Filter Non-Guitar Posts
- **Module Type**: Router or Filter
- **Condition**: `is_guitar_post == true AND confidence >= 75`
- **If False**: Skip to next post

#### Step 8: Claude API - Qualification Scorer
- **Module Type**: HTTP > Make a request
- **URL**: `https://api.anthropic.com/v1/messages`
- **Method**: POST
- **Body**:
  ```json
  {
    "model": "claude-opus-4-6",
    "max_tokens": 200,
    "messages": [
      {
        "role": "user",
        "content": "You are a guitar content expert scoring Instagram posts for feature worthiness.\n\nPost Details:\n- Caption: {{caption}}\n- Likes: {{likes}}\n- Comments: {{comments}}\n- Username: {{user}}\n\nScore this post on:\n1. Guitar Interest (1-10): How interesting/rare is the guitar?\n2. Story Quality (1-10): Does the caption tell a compelling story?\n3. Engagement (1-10): Is this likely to drive clicks?\n\nRespond with ONLY JSON: {\"guitar_interest\": X, \"story_quality\": X, \"engagement\": X, \"overall_score\": X, \"tags\": [\"tag1\", \"tag2\"], \"story_angle\": \"brief summary\"}"
      }
    ]
  }
  ```
- **Output Mapping**: Parse JSON response

#### Step 9: Filter by Score
- **Module Type**: Filter
- **Condition**: `overall_score >= 60`
- **Keep Top 50**: Use Array > Sort and limit

#### Step 10: Google Sheets - Append Queue Entry
- **Module Type**: Google Sheets > Add a row
- **Spreadsheet**: TWNG Marketing (create if needed)
- **Sheet**: `Featured_Content_Queue`
- **Columns**:
  | Column | Value |
  |--------|-------|
  | Date | {{NOW()}} |
  | Instagram URL | {{url}} |
  | Username | {{user}} |
  | Guitar Interest | {{guitar_interest}} |
  | Story Quality | {{story_quality}} |
  | Overall Score | {{overall_score}} |
  | Story Angle | {{story_angle}} |
  | Tags | {{tags}} |
  | Image URL | {{image_url}} |
  | Caption | {{caption}} |
  | Status | "Pending Review" |
  | Article Generated | "No" |

#### Step 11: Slack Notification
- **Module Type**: Slack > Post a Message
- **Channel**: `#content-pipeline`
- **Message**:
  ```
  📊 Featured Content Pipeline Daily Run
  ✅ Total posts analyzed: {{total_posts}}
  🎸 Guitar posts identified: {{count_guitar_posts}}
  ⭐ High-quality candidates: {{count_high_score}}

  📈 Top post:
  {{top_score_story_angle}}
  By @{{top_user}} ({{top_likes}} likes)

  👉 Review in Google Sheets: [Featured_Content_Queue](link)
  ```

---

### Apify Configuration

**Actor**: Instagram Hashtag Scraper (use established actor like `jalakoo/instagram-hashtag-scraper`)

**Input Configuration**:
```json
{
  "hashtags": [
    "guitarcollection",
    "guitarcollector",
    "vintageguitar",
    "guitarporn",
    "NGD",
    "newguitarday",
    "guitarsofinstagram",
    "telecaster",
    "stratocaster",
    "lespaul",
    "gibsonguitar",
    "fenderguitar",
    "guitarrig",
    "pedalboard",
    "guitarlove"
  ],
  "minLikes": 100,
  "minComments": 5,
  "resultsPerHashtag": 50,
  "sortBy": "most_likes",
  "proxy": "APIFY_PROXY_RESIDENTIAL"
}
```

**Schedule**: Daily at 6:00 AM UTC (runs 1 hour before Make pipeline at 7 AM)

**Output Fields**:
- `id`: Post ID
- `caption`: Full caption text
- `likes`: Like count
- `comments`: Comment count
- `author.username`: Creator username
- `author.avatar_url`: Creator profile picture
- `image.url`: Post image URL
- `timestamp`: Post date
- `url`: Instagram post URL

---

### Claude API Prompts (Production-Ready)

#### Prompt 1: is_guitar_post Classifier

```
You are an expert guitar identifier with 20+ years of experience. Your task is to analyze Instagram post captions and metadata to determine if they feature guitars.

Post Caption: {{caption}}
Likes: {{likes}}
Comments: {{comments}}

Consider:
1. Does the caption mention guitars, guitar brands, models, or guitar-related terms?
2. Common hashtags: #guitar, #guitarporn, #ngd, #newguitarday, #guitarcollection, etc.
3. Guitar brand keywords: Fender, Gibson, PRS, Ibanez, Epiphone, Telecaster, Stratocaster, Les Paul, etc.
4. Even if caption is vague, high likes+comments on guitar-focused account suggests guitar content.

Respond with ONLY valid JSON (no markdown):
{
  "is_guitar_post": true/false,
  "confidence": 0-100,
  "reasoning": "2-3 sentence explanation"
}
```

#### Prompt 2: Post Qualification Scorer

```
You are a content editor for TWNG (The Next New Guitar), a platform celebrating guitar culture. Your task is to score Instagram posts for feature-worthiness on our blog.

Post Metadata:
- Caption: {{caption}}
- Likes: {{likes}}
- Comments: {{comments}}
- Creator: @{{user}}
- Image: [visual reference]

Score on these dimensions (1-10 scale):

1. GUITAR_INTEREST (1-10): How interesting/rare/desirable is the featured guitar?
   - 10: Rare vintage, custom shop, or historically significant instrument
   - 7-9: Well-known classic model or interesting variation
   - 4-6: Common model, decent condition
   - 1-3: Generic or low visual appeal

2. STORY_QUALITY (1-10): Does the caption tell a compelling narrative?
   - 10: Compelling origin story, emotional connection, technical detail
   - 7-9: Good context, some personality, interesting angle
   - 4-6: Basic description, some personality
   - 1-3: Minimal caption, unclear context

3. ENGAGEMENT (1-10): Is this likely to drive clicks and shares?
   - 10: High engagement (200+ likes, 20+ comments for non-famous user)
   - 7-9: Strong engagement metrics
   - 4-6: Moderate engagement
   - 1-3: Low engagement

4. NARRATIVE_ANGLE: What's the headline angle for this feature?
   - Examples: "Vintage 1959 Les Paul Rescue", "DIY Telecaster Build Journey", "Family Heirloom Plays Better Than Ever"

Calculate OVERALL_SCORE = (GUITAR_INTEREST × 0.35) + (STORY_QUALITY × 0.40) + (ENGAGEMENT × 0.25)

Generate 2-3 relevant tags from this list: vintage, modern, custom, restoration, collection, rare, budget-friendly, handmade, signature-model, left-handed, acoustic, electric, bass, pedal-rig, gear, player-feature

Respond with ONLY valid JSON:
{
  "guitar_interest": 1-10,
  "story_quality": 1-10,
  "engagement": 1-10,
  "overall_score": 0-100,
  "narrative_angle": "Headline-ready story angle",
  "tags": ["tag1", "tag2", "tag3"],
  "editor_notes": "2-3 sentences about why this post stands out"
}
```

#### Prompt 3: SEO-Optimized Article Generator

```
You are a SEO-expert music journalist writing for TWNG (The Next New Guitar), a platform celebrating guitar culture and musicians. Your task is to generate a compelling, SEO-optimized blog article based on an Instagram post.

Source Post:
- Creator: @{{user}}
- Caption: {{caption}}
- Image: [visual]
- Engagement: {{likes}} likes, {{comments}} comments
- Story Angle: {{narrative_angle}}
- Guitar Details: {{guitar_interest_summary}}

Requirements:
1. TITLE (50-60 chars): Catchy, keyword-rich, includes guitar type or brand
   - Good: "Vintage 1959 Gibson Les Paul Rescue: A $4K Gem Found at Estate Sale"
   - Bad: "Cool Guitar"
   - Include primary keyword naturally

2. SUBTITLE (80-100 chars): Teaser that makes reader want to click

3. BODY (800-1000 words):
   - Intro paragraph: Hook with story angle (100 words)
   - 3-4 middle sections with headers:
     * The Guitar: Specs, year, condition, significance (200 words)
     * The Story: How they found/acquired it, emotional connection (250 words)
     * The Impact: Why this guitar matters to them, playability, sound (250 words)
     * [Optional] The Community: Call-to-action to share similar stories (150 words)
   - Conclusion: Inspire readers, link to TWNG community (100 words)

4. SEO OPTIMIZATION:
   - Include primary keyword (brand + model) in title, subtitle, first 100 words
   - Natural secondary keywords: "guitar collection", "vintage guitar", "gear", specific brand names
   - Write for humans first, SEO second
   - Use H2 headers for sections
   - Short paragraphs (2-4 sentences)

5. METADATA:
   - Meta description (150 chars): Summary that sells the article
   - Focus keyword: "Brand Model Vintage Year" (e.g., "Gibson Les Paul 1959")
   - Tags: 5-7 relevant tags

6. FOOTER:
   - Credit line: "Feature courtesy of @{{user}} on Instagram"
   - Call-to-action: "Have a similar guitar story? Claim your guitar on TWNG and join {{username}} in our growing collection."

Respond with ONLY valid JSON:
{
  "title": "Your catchy title here",
  "subtitle": "Your engaging subtitle",
  "body": "Full HTML article body with <h2> headers, <p> tags, <strong> emphasis",
  "meta_description": "150 chars describing the article",
  "focus_keyword": "primary keyword phrase",
  "tags": ["tag1", "tag2", "tag3"],
  "credit_line": "Feature courtesy of @username",
  "cta": "Have a similar story? Claim on TWNG",
  "estimated_read_time_minutes": 4
}
```

---

### Supabase Integration

**Tables to Create/Update**:

```sql
-- featured_posts: Published articles
CREATE TABLE featured_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  subtitle VARCHAR(255),
  body TEXT,
  image_url VARCHAR(500),
  instagram_username VARCHAR(100),
  instagram_post_url VARCHAR(500),
  guitar_brand VARCHAR(100),
  guitar_model VARCHAR(100),
  guitar_year INT,
  tags VARCHAR[] DEFAULT '{}',
  meta_description VARCHAR(160),
  focus_keyword VARCHAR(100),
  read_time_minutes INT,
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
  views INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- featured_content_queue: Raw queue before article generation
CREATE TABLE featured_content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_post_url VARCHAR(500),
  instagram_username VARCHAR(100),
  guitar_interest_score INT,
  story_quality_score INT,
  overall_score INT,
  narrative_angle TEXT,
  tags VARCHAR[] DEFAULT '{}',
  image_url VARCHAR(500),
  caption TEXT,
  status VARCHAR(20) DEFAULT 'pending_review', -- pending_review, selected, article_generated, published, archived
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  article_id UUID REFERENCES featured_posts(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_featured_content_status ON featured_content_queue(status, created_at);
```

**Data Flow Mapping**:
- Apify output → featured_content_queue (raw posts)
- Editor selects 1-2 per day → Article generator → featured_posts (drafts)
- Draft approval → featured_posts.status = 'published' + triggers blog publishing

---

### Google Sheets Structure

**Spreadsheet**: TWNG Marketing (shared with team)

**Sheet 1: Featured_Content_Queue**
| Column | Type | Purpose |
|--------|------|---------|
| Date | Date | When added |
| Instagram URL | URL | Direct link to post |
| Username | Text | Creator handle |
| Guitar Interest | Number 1-10 | Rarity/interest |
| Story Quality | Number 1-10 | Narrative quality |
| Engagement | Number 1-10 | Likes/comments quality |
| Overall Score | Number 0-100 | Weighted score |
| Story Angle | Text | Article headline idea |
| Tags | Text | Comma-separated |
| Status | Dropdown | "Pending Review", "Selected", "Article Generated", "Published" |
| Editor Notes | Text | Internal feedback |
| Image URL | URL | Post image link |

**Sheet 2: Processed_Posts** (Audit/Analytics)
| Column | Type |
|--------|------|
| Date | Date |
| Total Posts Analyzed | Number |
| Guitar Posts Found | Number |
| High-Score Candidates | Number |
| Top Score | Number |
| Top Username | Text |

---

### Slack Notification Format

**Channel**: #content-pipeline
**Frequency**: Daily at 7:30 AM UTC
**Format**:

```
📊 Featured Content Pipeline — Daily Digest

📈 **Run Metrics**
✅ Total posts analyzed: 750
🎸 Guitar posts identified: 87 (11.6%)
⭐ High-quality candidates (score 60+): 23

🏆 **Top Candidate**
"Vintage 1959 Gibson Les Paul Rescue: Found at Estate Sale"
👤 @vintageguitardad | 🔥 847 likes | 💬 62 comments | ⭐ 85/100

🥈 **Runners-Up**
2. @customshopbuild (82/100)
3. @retroguitarcollector (79/100)

👉 **[Review Full Queue](Google Sheets Link)** → Select posts for article generation

📝 Next Steps: Editor reviews top 5 by EOD for article generation
```

---

## System B: Pre-Built Collections Discovery

**Status**: Not Started
**Launch**: Week 3
**Complexity**: High
**Monthly Cost**: $40-60 (Apify $50 + Make scenarios $10-15)

### Concept

Discover Instagram users who have posted multiple guitar photos → automatically analyze their collection → build a TWNG collection page → send personalized "We built your collection" outreach DM.

**Goal**: Convert collectors who don't know about TWNG into founding members.

### Identification Logic

A user is likely a **collector** if they have:
- 5+ guitar posts in last 90 days
- Mix of hashtags: #guitarcollection, #guitarcollector, #myguitars, #gearslut, #pedalboard
- High engagement ratio (likes/followers > 3%)
- Consistent posting (not one-off posts)

### Make.com Scenario Flow

```
Weekly on Monday 9 AM UTC
  ↓
Apify: Search for users with collection hashtags
  ↓
Module 1: Filter by engagement metrics
  ↓
Module 2: Fetch last 20 posts per user
  ↓
Module 3: Count guitar posts (filter 5+)
  ↓
Module 4: Claude API - extract guitar data from captions
  ↓
Module 5: Supabase - create collection_discovery records
  ↓
Module 6: Check if user already on TWNG
  ↓
Module 7: If not on TWNG: Auto-generate collection preview
  ↓
Module 8: Send Instagram DM with collection preview
  ↓
Module 9: Log outreach attempt in collections_outreach table
```

### Detailed Steps

#### Step 1: Apify Search Users by Collection Hashtag
- **Module Type**: HTTP > Make a request (Apify API)
- **Configuration**:
  ```json
  {
    "hashtags": ["guitarcollection", "guitarcollector", "myguitars"],
    "resultsPerHashtag": 30,
    "extractUserProfiles": true
  }
  ```

#### Step 2: Filter Users
- **Module Type**: Filter
- **Conditions**:
  - followers >= 500 (establishes credibility)
  - engagement_rate >= 0.03 (3%)
  - posts_count >= 20

#### Step 3: Fetch User's Recent Posts
- **Module Type**: HTTP > Make a request (Apify)
- **Configuration**: Get last 20 posts for each user

#### Step 4: Count Guitar Posts
- **Module Type**: Array > Create Iterator (over posts)
- Filter for posts with guitar-related hashtags or captions
- Count results

#### Step 5: Filter to Collectors (5+ guitar posts)
- **Module Type**: Filter
- **Condition**: `guitar_posts_count >= 5`

#### Step 6: Extract Guitar Data with Claude
- **Module Type**: HTTP > Make a request (Claude API)
- **Prompt**:
  ```
  Analyze these guitar post captions from collector @{{username}} and extract instrument details.

  Posts: {{posts}}

  For each guitar mentioned, extract: brand, model, year (if mentioned), color, unique details.

  Response JSON:
  {
    "guitars": [
      {"brand": "", "model": "", "year": null, "color": "", "notes": ""}
    ],
    "collection_theme": "description of their collecting focus"
  }
  ```

#### Step 7: Create Collection in Supabase
- **Module Type**: Supabase > Insert row
- **Table**: `collections_discovered`
- **Fields**:
  - instagram_username
  - profile_url
  - followers_count
  - guitar_posts_count
  - guitars_extracted (JSONB)
  - collection_theme
  - outreach_status: "ready_for_outreach"
  - discovered_at

#### Step 8: Check if User on TWNG
- **Module Type**: Supabase > Search rows
- **Table**: users
- **Condition**: `instagram_username == {{username}}`
- **Branch**: If found → skip to analytics; if not found → continue to outreach

#### Step 9: Generate Collection Preview
- **Module Type**: HTTP > Make a request (Claude API)
- **Prompt**:
  ```
  Create a JSON preview of this guitar collection for an Instagram DM outreach.

  Username: @{{username}}
  Guitars: {{guitars_extracted}}
  Theme: {{collection_theme}}
  Follower count: {{followers}}

  Generate a brief, compelling preview that would impress the collector.

  Response:
  {
    "collection_name": "e.g., [Username]'s Vintage Fender Collection",
    "preview_text": "We've tracked your collection: 7 guitars including rare 1962 Strat, custom Tele, etc.",
    "stats_summary": "Your collection spans 1950s-2000s, heavy in Fender models"
  }
  ```

#### Step 10: Send Instagram DM
- **Module Type**: Instagram Graph API > Send Message
- **Configuration**:
  - Recipient: `{{instagram_user_id}}`
  - Message Template: (See below)

#### Step 11: Log Outreach
- **Module Type**: Supabase > Insert row
- **Table**: `collections_outreach`
- **Fields**:
  - discovered_collection_id
  - instagram_username
  - message_sent_at
  - status: "sent"

---

### Collection Preview DM Template

```
Hey @{{username}}! 👋

We've been following the guitar community, and your collection is 🔥.

We just built a collection page for you on TWNG (The Next New Guitar) based on your Instagram posts:

✨ Your Collection: {{collection_name}}
📊 {{stats_summary}}
🎸 {{preview_text}}

Check it out here: https://twng.com/collections/preview/{{preview_token}}

This is your personal collection space — claim it to unlock full features like:
• Edit your guitar details
• Connect with other collectors
• Track your collection value
• Share your story

Questions? Reply here or visit twng.com

- The TWNG Team
```

---

### Supabase Tables

```sql
CREATE TABLE collections_discovered (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_username VARCHAR(100) UNIQUE,
  instagram_user_id VARCHAR(100),
  profile_url VARCHAR(500),
  followers_count INT,
  engagement_rate FLOAT,
  guitar_posts_count INT,
  guitars_extracted JSONB,
  collection_theme TEXT,
  outreach_status VARCHAR(20) DEFAULT 'ready_for_outreach', -- ready, sent, claimed, archived
  preview_token VARCHAR(100) UNIQUE,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE collections_outreach (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discovered_collection_id UUID REFERENCES collections_discovered(id) ON DELETE CASCADE,
  instagram_username VARCHAR(100),
  message_sent_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'sent', -- sent, delivered, read, replied, claimed
  dm_response TEXT,
  claimed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## System C: Content Marketing Distribution

**Status**: Not Started
**Launch**: Week 4
**Complexity**: Medium
**Monthly Cost**: $30-50 (Make scenarios $20 + Buffer API $10-30)

### Concept

Automatically generate social media content from TWNG platform data (featured guitars, articles, stats) → use Claude to write captions → schedule across Instagram, Twitter, TikTok using Buffer/Later API.

### Content Types

1. **Guitar of the Day** (1 post/day)
   - Random featured guitar from platform
   - Carousel: 3 images (guitar, closeup detail, collector/player)
   - Caption: Brand, model, year, quick fact

2. **Article Teaser** (2 per week)
   - Excerpt from latest featured article
   - Image: Featured guitar
   - CTA: "Read the full story on TWNG"

3. **Collection Spotlight** (1 per week)
   - Feature recently claimed collection
   - "Meet the Collector" angle
   - Images: Collection grid (3x3 of their guitars)

4. **Platform Milestone** (1 per milestone)
   - "We just hit 1,000 guitars!"
   - Celebration graphics
   - CTA: "Add yours to our growing collection"

5. **Gear Tips** (1 per week)
   - Serial number decoder tips
   - "Spot a Fake Fender" guides
   - "Vintage vs Modern" comparisons

### Distribution Flow Diagram

```
Daily 8 AM UTC (Scheduler)
  ↓
Module 1: Determine content type for today
  ↓
Module 2: Fetch data from Supabase
  ↓
Module 3: Claude generates caption + content
  ↓
Module 4: Create image (Supabase or Buffer)
  ↓
Module 5: Format for multi-platform
  ↓
Module 6: Schedule via Buffer API
  ↓
└─ Instagram: Queue for 12 PM + 3 Stories at 7 PM
└─ Twitter: Queue for 10 AM + 3 PM
└─ TikTok: Cross-post Reels

Module 7: Log in social_content_queue table
Module 8: Slack notification with preview
```

### Make.com Scenario Details

#### Module 1: Determine Content Type
- **Module Type**: Set variable
- **Logic**: Use `(day_of_week * hour) % 5` to cycle through 5 content types
- **Output**: `content_type` = "guitar_of_day" | "article_teaser" | "collection_spotlight" | "milestone" | "gear_tip"

#### Module 2: Fetch Content Data
- **Module Type**: Supabase > Search rows (varies by content type)
- **If "guitar_of_day"**:
  - Query: Random row from featured_posts WHERE status = 'published'
  - Select: title, image_url, guitar_brand, guitar_model, guitar_year

- **If "article_teaser"**:
  - Query: Latest published article
  - Select: title, excerpt (first 100 words), image_url

- **If "collection_spotlight"**:
  - Query: Most recently claimed collection WITH 5+ guitars
  - Select: collection name, user, guitar_count, images

#### Module 3: Generate Caption with Claude
- **Module Type**: HTTP > Make a request (Claude API)
- **Prompt Template**:
  ```
  Generate 3 versions of an Instagram caption for this {{content_type}} post.

  Data: {{content_data}}

  Requirements:
  - Version 1: Fun, casual tone with emojis (max 150 chars)
  - Version 2: Informative, educational tone (max 200 chars)
  - Version 3: Storytelling tone that connects emotionally (max 200 chars)

  Include relevant hashtags.

  Response JSON:
  {
    "captions": [
      {"tone": "fun", "text": "..."},
      {"tone": "informative", "text": "..."},
      {"tone": "story", "text": "..."}
    ]
  }
  ```

#### Module 4: Select Caption Version
- **Module Type**: Set variable
- **Logic**: Use first version (or rotate daily)
- **Output**: `caption` = selected caption text

#### Module 5: Format for Multi-Platform
- **Module Type**: Set multiple variables
- **Instagram Caption**: Full caption + hashtags (2200 char limit)
- **Twitter Caption**: Shortened for Twitter (280 char limit)
- **TikTok Caption**: Same as Instagram

#### Module 6: Schedule via Buffer API
- **Module Type**: HTTP > Make a request (Buffer API)
- **Base URL**: `https://publish.buffer.com/api/v2/posts`
- **Headers**: `Authorization: Bearer {{BUFFER_API_TOKEN}}`

**For Instagram**:
```json
{
  "profile_ids": ["{{buffer_instagram_profile_id}}"],
  "text": "{{instagram_caption}}",
  "media": {
    "link": "{{image_url}}",
    "description": "{{image_alt_text}}"
  },
  "scheduled_at": {{scheduled_time_instagram}},
  "hashtags": "separate"
}
```

**For Twitter**:
```json
{
  "profile_ids": ["{{buffer_twitter_profile_id}}"],
  "text": "{{twitter_caption}}",
  "scheduled_at": {{scheduled_time_twitter}}
}
```

#### Step 7: Log in Supabase
- **Module Type**: Supabase > Insert row
- **Table**: social_content_queue
- **Fields**:
  - content_type
  - caption
  - image_url
  - platforms (array: ["instagram", "twitter"])
  - scheduled_for (timestamp)
  - status: "scheduled"

#### Step 8: Slack Notification
- **Module Type**: Slack > Post Message
- **Channel**: #social-media
- **Message**: Preview of scheduled post with image

---

### Content Schedule

**Instagram**:
- 1 feed post: Daily at 12 PM UTC
- 3 Stories: Daily at 7 PM UTC
- 1 Reel (Guitar of the Day): Weekly at 6 PM UTC (Sunday)

**Twitter/X**:
- 2 tweets: 10 AM and 3 PM UTC
- Engagement retweets: 2-3 per day (manual)

**TikTok**:
- Cross-post Reels (2x/week)

---

### Supabase Table

```sql
CREATE TABLE social_content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(50), -- guitar_of_day, article_teaser, collection_spotlight, milestone, gear_tip
  caption TEXT,
  image_url VARCHAR(500),
  platforms VARCHAR[] DEFAULT '{}', -- {instagram, twitter, tiktok}
  buffer_post_id VARCHAR(100),
  scheduled_for TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, posted, failed, cancelled
  engagement_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## System D: Email & Nurture Sequences

**Status**: Implementation Ready (templates built)
**Launch**: Week 1
**Complexity**: Low-Medium
**Monthly Cost**: $10-20 (Resend free for first 3K emails)

### Overview

Three automated email sequences to guide users through onboarding and re-engagement:

1. **Welcome Sequence** (4 emails)
   - Triggers: New user signup
   - Goal: Introduce platform, encourage first claim

2. **Claim Activation Sequence** (4 emails)
   - Triggers: Guitar claim approved
   - Goal: Celebrate win, encourage adding more guitars, explore features

3. **Re-engagement Sequence** (3 emails)
   - Triggers: 14+ days inactive
   - Goal: Remind of value, show new content, offer exclusive content

### Implementation Details

**Email Service Layer**:
- Location: `/sessions/gracious-dreamy-mccarthy/twng-app/src/lib/email/emailService.js` (already created)
- Functions: `sendEmail()`, `scheduleEmail()`, `triggerWelcomeSequence()`, `triggerClaimSequence()`, `triggerReengagementSequence()`, `cancelSequence()`

**Email Templates**:
- Location: `/sessions/gracious-dreamy-mccarthy/twng-app/src/lib/email/templates.js`
- Each template has: `subject`, `html`, `text`
- Variables: `{{username}}`, `{{guitarBrand}}`, `{{baseUrl}}`, etc.

**Trigger Points**:

| Sequence | Trigger | Implementation |
|----------|---------|-----------------|
| Welcome | auth.users INSERT | Supabase webhook → emailService.triggerWelcomeSequence() |
| Claim | guitar_claims.status = 'approved' | UPDATE trigger → emailService.triggerClaimSequence() |
| Re-engagement | Cron job (daily) | Edge function checks last_active > 14 days |

### Welcome Sequence (4 emails)

**Email 1: Welcome to TWNG** (Immediate)
- Subject: "Welcome to TWNG, {{username}}! 🎸"
- Goal: Excitement, introduce platform
- CTA: "Explore featured guitars"

**Email 2: Complete Your Profile** (Day 1)
- Subject: "Complete your profile — join the community"
- Goal: Reduce profile friction
- CTA: "Add a profile photo"

**Email 3: Claim Your First Guitar** (Day 3)
- Subject: "Your first guitar is waiting — claim it on TWNG"
- Goal: Drive first user action
- CTA: "Browse guitars to claim"

**Email 4: Join the Community** (Day 7)
- Subject: "Meet other guitar collectors — your new community"
- Goal: Drive engagement with collections/users
- CTA: "Explore collections"

### Claim Activation Sequence (4 emails)

**Email 1: Claim Approved!** (Immediate upon approval)
- Subject: "Your {{guitarBrand}} {{guitarModel}} claim is approved! 🎉"
- Content: Celebrate their claim, showcase their guitar
- CTA: "View your guitar on TWNG"

**Email 2: Add More Guitars** (Day 1)
- Subject: "Build your collection — you're off to a great start"
- Content: "We found {{guitarCount}} other guitars similar to your {{guitarBrand}}"
- CTA: "Explore similar guitars"

**Email 3: Build Your Collection Page** (Day 3)
- Subject: "Customize your collection — tell your story"
- Content: Share collection preview, encourage bio edit
- CTA: "View your collection"

**Email 4: Explore Premium Features** (Day 7)
- Subject: "Unlock the full TWNG experience"
- Content: (Future) Premium features like valuations, insurance tracking
- CTA: "See what's next"

### Re-engagement Sequence (3 emails)

**Email 1: We Miss You** (Day 14 inactive)
- Subject: "{{username}}, come back to TWNG — new guitars are here"
- Content: Showcase new featured guitars, personalized to their interests
- CTA: "Check out new guitars"

**Email 2: Here's What's New** (Day 21)
- Subject: "5 new features we just launched"
- Content: Show new features added since last login
- CTA: "See what's new"

**Email 3: Last Chance** (Day 30)
- Subject: "Exclusive offer for returning collectors"
- Content: (Future) Offer early access to new features, exclusive content
- CTA: "Claim your offer"

### Provider Setup

**Recommended: Resend** (https://resend.com)
- Pricing: $0 for first 3,000 emails/month (perfect for launch)
- Setup:
  1. Create account at resend.com
  2. Add TWNG domain (hello@twng.com)
  3. Verify domain with DNS records
  4. Get API key
  5. Store in env: `VITE_RESEND_API_KEY`

**Alternative: SendGrid**
- Pricing: $20-30/month for higher volume
- Free tier: 100 emails/day
- Better for large campaigns

**Configuration in emailService.js**:
```javascript
EMAIL_CONFIG = {
  provider: 'resend', // Set to resend | sendgrid | supabase
  from: 'TWNG <hello@twng.com>',
  replyTo: 'support@twng.com',
  resendApiKey: process.env.VITE_RESEND_API_KEY,
};
```

### Cron/Edge Function for Re-engagement

**Supabase Edge Function** (`supabase/functions/email-reengagement/`):
```javascript
import { createClient } from '@supabase/supabase-js';
import { triggerReengagementSequence } from '../../src/lib/email/emailService.js';

const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_KEY'));

Deno.serve(async (req) => {
  const inactiveUsers = await supabase
    .from('users')
    .select('id, email, username')
    .lt('last_active_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
    .eq('reengagement_sent', false);

  for (const user of inactiveUsers.data) {
    await triggerReengagementSequence(user.id, user.email, user.username);
    await supabase.from('users').update({ reengagement_sent: true }).eq('id', user.id);
  }

  return new Response(JSON.stringify({ success: true, processed: inactiveUsers.data.length }));
});
```

---

## System E: Claiming & Onboarding

**Status**: Built (platform features done)
**Launch**: Week 2
**Complexity**: Medium (already implemented)
**Monthly Cost**: $0 (Supabase included)

### Overview

The core user acquisition funnel:
1. User discovers guitar via Instagram outreach (System B) or featured content (System A)
2. User lands on guitar detail page with **Claim Guitar** button
3. 3-step flow: Preview → Verify → Confirmation
4. Admin reviews claim (5 verification types)
5. Claim approved → Triggers email sequence (System D) + adds to user's collection

### Flow

```
ClaimGuitar.jsx (/claim/:guitarId)
  ↓
Step 1: Preview
  - Show guitar details
  - Display existing collection preview (if logged in)
  - "Claim this guitar" button

Step 2: Evidence
  - 5 verification types (dropdown)
  - Type 1: Instagram match (link to Instagram post)
  - Type 2: Serial photo (upload photo of serial)
  - Type 3: Receipt (upload proof of purchase)
  - Type 4: Luthier vouch (link to luthier confirmation)
  - Type 5: Other (text description)
  - Rich text evidence description

Step 3: Confirmation
  - Summary of claim
  - Agree to terms
  - Submit for admin review

  ↓
Supabase: guitar_claims table
  - status: 'pending_approval'

  ↓
Admin Panel: Claims page
  - Review claims
  - Verify evidence
  - Approve or reject

  ↓
On approval:
  - Update claim status: 'approved'
  - Trigger: triggerClaimSequence() (email sequence)
  - Create/update user_guitars record
  - Update user collection page
```

### Verification Types

| Type | Input | Validation |
|------|-------|-----------|
| Instagram Match | Link to Instagram post | Fetch post, verify guitar visible, verify user owns account |
| Serial Photo | Upload image | Admin visually verifies serial number matches database |
| Receipt | Upload image/PDF | Admin verifies purchase date/seller |
| Luthier Vouch | Link/text | Expert confirmation of authenticity |
| Other | Text description | Manual review by admin |

### Integration Points

**With System A (Featured Content)**:
- When featured article is published about guitar, include "Claim this guitar" link
- Format: `https://twng.com/claim/{{guitId}}`

**With System B (Collections Discovery)**:
- Collection preview includes "Claim your collection" links
- Pre-fill guitar IDs from discovered collection

**With System D (Email Sequences)**:
- Claim approved → triggers claim activation email sequence
- Email includes link back to guitar page + collection page

### Post-Claim Activation

**Profile Completion Nudges**:
- Email sequence encourages profile completion
- Claim page suggests "Add a profile photo"
- Collection page incentivizes bio editing

**Pioneer Badge**:
- Users who claim in first 90 days get "Pioneer Member" badge
- Displayed on collection page

**Collection Page Auto-Creation**:
- On first claim approval, auto-create user_collections record
- Populate with claimed guitar
- Send email: "Your collection is ready"

### Supabase Tables (Reference)

```sql
CREATE TABLE guitars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand VARCHAR(100),
  model VARCHAR(100),
  year INT,
  color VARCHAR(50),
  image_urls VARCHAR[] DEFAULT '{}',
  serial_number VARCHAR(255),
  serial_verified BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE guitar_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  guitar_id UUID REFERENCES guitars(id) ON DELETE CASCADE,
  verification_type VARCHAR(50), -- instagram_match, serial_photo, receipt, luthier_vouch, other
  evidence_text TEXT,
  evidence_url VARCHAR(500),
  evidence_image_urls VARCHAR[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending_approval', -- pending_approval, approved, rejected
  admin_notes TEXT,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(255),
  bio TEXT,
  guitar_count INT DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  badge VARCHAR(50), -- pioneer, verified_collector, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_guitars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  guitar_id UUID REFERENCES guitars(id) ON DELETE CASCADE,
  notes TEXT,
  acquired_date DATE,
  acquisition_price DECIMAL,
  custom_name VARCHAR(255),
  featured BOOLEAN DEFAULT false,
  position INT, -- for ordering in collection
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Launch Checklist

### Week 1
- [ ] Deploy emailService.js and email templates
- [ ] Set up Resend account and configure API key
- [ ] Create email_queue and email_preferences tables
- [ ] Test welcome sequence with internal accounts
- [ ] Build System A Make scenario (Featured Content Pipeline)
- [ ] Configure Apify Instagram hashtag scraper
- [ ] Set up Google Sheets for content queue
- [ ] Test System A end-to-end

### Week 2
- [ ] Review and refine System E (claiming) based on user testing
- [ ] Set up admin Claims review panel
- [ ] Test claim approval triggers email sequence
- [ ] Deploy re-engagement cron/edge function
- [ ] Monitor email delivery and open rates

### Week 3
- [ ] Build System B Make scenario (Pre-Built Collections)
- [ ] Configure collection discovery logic
- [ ] Set up Instagram DM template and testing
- [ ] Test with 10 target collectors (manual outreach first)

### Week 4
- [ ] Build System C Make scenario (Content Distribution)
- [ ] Configure Buffer API integration
- [ ] Set up social media scheduling templates
- [ ] Test with 1 week of scheduled content
- [ ] Monitor performance and engagement

### Ongoing
- [ ] Monitor email metrics (open rate, click rate, unsubscribe)
- [ ] Review featured content pipeline performance
- [ ] A/B test email subject lines and send times
- [ ] Iterate on content distribution based on engagement

---

## Monitoring & Analytics

### Key Metrics by System

**System A (Featured Content)**:
- Posts analyzed per day
- Guitar posts identified (%)
- Article publish rate
- Blog traffic from featured articles
- Claim attempts from article links

**System B (Collections Discovery)**:
- Collectors discovered per week
- DM outreach sent per week
- Preview click-through rate
- Collection preview → TWNG signup conversion rate

**System C (Content Distribution)**:
- Posts scheduled per day
- Engagement rate (likes/comments) by content type
- Traffic to platform from social links
- Follower growth rate

**System D (Email Sequences)**:
- Open rate (target: 25-35%)
- Click-through rate (target: 5-10%)
- Conversion rate (email link → action)
- Unsubscribe rate (target: <0.5%)

**System E (Claiming & Onboarding)**:
- Claim initiation rate
- Claim approval rate
- Time-to-first-claim
- Collection creation rate

---

## Budget Summary

| System | Component | Cost/Month | Notes |
|--------|-----------|-----------|-------|
| A | Apify actor | $50 | Instagram scraping |
| A | Make scenarios | $20 | 2-3 scenarios × credit costs |
| A | Claude API | $10 | ~5K requests/month |
| B | Apify + Make | $20 | User discovery |
| C | Buffer/Later + Make | $20 | Social scheduling |
| D | Resend | $0 | Free tier (3K emails/mo) |
| E | Supabase | Included | Part of platform |
| **Total** | | **$120-140** | Conservative estimate |

---

## Future Enhancements

- **System A+**: Automatic blog publishing (Google Docs → WordPress)
- **System B+**: Automatic collection page creation with preview images
- **System C+**: A/B testing of captions and scheduling times
- **System D+**: Advanced segmentation (personalized sequences by brand preference)
- **System E+**: Verification with serial number database API
- **New**: YouTube content repurposing (featured articles → short videos)

