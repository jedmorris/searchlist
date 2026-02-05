-- Add status field to inquiries
ALTER TABLE inquiries 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new' 
CHECK (status IN ('new', 'contacted', 'closed', 'converted'));

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

-- Update existing inquiries: set read ones to 'contacted', unread to 'new'
UPDATE inquiries SET status = CASE WHEN is_read THEN 'contacted' ELSE 'new' END WHERE status IS NULL;
