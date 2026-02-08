-- Email System Tables Migration
-- Created for managing email queues, preferences, and logging

-- Create email_queue table for scheduled/queued emails
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  to_email VARCHAR(255) NOT NULL,
  sequence_key VARCHAR(50),
  email_key VARCHAR(50),
  subject VARCHAR(500),
  html TEXT,
  text_content TEXT,
  variables JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  send_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email_preferences table for user email opt-in/out settings
CREATE TABLE IF NOT EXISTS email_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  marketing_emails BOOLEAN DEFAULT TRUE,
  sequence_emails BOOLEAN DEFAULT TRUE,
  notification_emails BOOLEAN DEFAULT TRUE,
  unsubscribed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email_log table for tracking sent emails
CREATE TABLE IF NOT EXISTS email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  to_email VARCHAR(255),
  subject VARCHAR(500),
  provider VARCHAR(50),
  status VARCHAR(20) DEFAULT 'sent',
  message_id VARCHAR(255),
  error TEXT,
  tags JSONB DEFAULT '[]',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance optimization

-- Index for email queue processor to find pending emails to send
CREATE INDEX IF NOT EXISTS idx_email_queue_status_send_at
  ON email_queue(status, send_at);

-- Index for canceling email sequences
CREATE INDEX IF NOT EXISTS idx_email_queue_user_sequence
  ON email_queue(user_id, sequence_key);

-- Index for viewing user's email history
CREATE INDEX IF NOT EXISTS idx_email_log_user_id
  ON email_log(user_id);

-- Enable RLS on all three tables
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_queue (service_role only)
CREATE POLICY "email_queue_service_role_full_access"
  ON email_queue
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- RLS Policies for email_preferences
-- Users can read their own preferences
CREATE POLICY "email_preferences_users_read_own"
  ON email_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "email_preferences_users_update_own"
  ON email_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "email_preferences_service_role_full_access"
  ON email_preferences
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- RLS Policies for email_log (service_role only)
CREATE POLICY "email_log_service_role_full_access"
  ON email_log
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Trigger function to auto-update email_preferences.updated_at
CREATE OR REPLACE FUNCTION update_email_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at on email_preferences changes
CREATE TRIGGER email_preferences_updated_at_trigger
  BEFORE UPDATE ON email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_email_preferences_updated_at();
