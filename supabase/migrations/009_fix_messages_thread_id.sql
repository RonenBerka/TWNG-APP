-- Migration 009: Fix messages.thread_id type
-- The thread_id is a deterministic string composed of two sorted UUIDs
-- joined by underscore (e.g. "uuid1_uuid2"), not a UUID itself.
-- Change column type from UUID to TEXT to match application logic.

-- Drop existing indexes that reference thread_id
DROP INDEX IF EXISTS idx_messages_thread;

-- Alter column type from UUID to TEXT
ALTER TABLE messages ALTER COLUMN thread_id TYPE TEXT USING thread_id::TEXT;

-- Recreate index
CREATE INDEX idx_messages_thread ON messages(thread_id, created_at);

-- Enable realtime for messages table (needed for subscriptions)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
