-- Approve all pending instruments — admin approval mechanism removed
UPDATE instruments
SET moderation_status = 'approved'
WHERE moderation_status = 'pending';
