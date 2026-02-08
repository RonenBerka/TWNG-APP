# TWNG Deployment Guide

## Quick Start (One Command)

Open Terminal, navigate to the `twng-app` folder, and run:

```bash
cd twng-app
bash deploy.sh
```

The script will walk you through everything — installing the CLI, logging in, setting API keys, and deploying all three Edge Functions.

---

## Manual Steps (if you prefer)

### 1. Install Supabase CLI

The easiest way — no sudo, no permissions issues:

```bash
npx supabase@latest --version
```

This downloads and runs the CLI via npx. Every command below just prefixes with `npx`:

### 2. Login & Link

```bash
npx supabase@latest login
npx supabase@latest link --project-ref iqrmwetprpwjgzynrjay
```

### 3. Set API Keys

```bash
npx supabase@latest secrets set ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
npx supabase@latest secrets set OPENAI_API_KEY=sk-YOUR_KEY_HERE
```

- **Anthropic key** → Powers Magic Add AI (Claude Vision guitar identification) and admin verification
- **OpenAI key** → Powers voice-to-story transcription (Whisper)
- Both are optional — the app falls back to demo mode if keys aren't set

### 4. Deploy Edge Functions

```bash
npx supabase@latest functions deploy analyze-guitar --no-verify-jwt
npx supabase@latest functions deploy transcribe-audio --no-verify-jwt
npx supabase@latest functions deploy verify-guitar --no-verify-jwt
```

### 5. Run Storage Migration

Open the Supabase SQL Editor:
https://supabase.com/dashboard/project/iqrmwetprpwjgzynrjay/sql/new

Paste and run this SQL:

```sql
-- Create the guitar-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'guitar-images',
  'guitar-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload guitar images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'guitar-images');

-- Anyone can view guitar images
CREATE POLICY "Anyone can view guitar images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'guitar-images');

-- Users can update their own uploads
CREATE POLICY "Users can update their own guitar image uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'guitar-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own uploads
CREATE POLICY "Users can delete their own guitar image uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'guitar-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### 6. Verify

After deployment, test these URLs in your browser:

- **App**: http://localhost:5173
- **Functions**: https://supabase.com/dashboard/project/iqrmwetprpwjgzynrjay/functions
- **Storage**: https://supabase.com/dashboard/project/iqrmwetprpwjgzynrjay/storage/buckets

---

## What Each Edge Function Does

| Function | Purpose | API Used |
|----------|---------|----------|
| `analyze-guitar` | AI guitar identification from photos | Claude Vision |
| `transcribe-audio` | Voice-to-text for guitar stories | OpenAI Whisper |
| `verify-guitar` | Data verification in admin panel | Claude Vision |

## Troubleshooting

**"npx: command not found"** → Install Node.js from https://nodejs.org/

**"permission denied"** → Don't use `sudo npm install -g`. Use `npx` instead.

**Edge Function returns 500** → Check that API keys are set: `npx supabase@latest secrets list`

**Photos not uploading** → Make sure you ran the storage migration (Step 5).
