-- Migration 016: Add attachment support to messages
-- Allows users to send files and images in direct messages.

ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_type TEXT;
-- attachment_type values: 'image', 'file', or NULL for text-only messages
