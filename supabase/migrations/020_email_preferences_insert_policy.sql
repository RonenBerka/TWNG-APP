-- Allow authenticated users to insert their own email preferences row.
-- The existing RLS only grants SELECT and UPDATE for own rows.
-- Without this, the frontend upsert() in updateEmailPreferences() fails silently.
CREATE POLICY "email_preferences_users_insert_own"
  ON email_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
