-- YouTube Integration for Auto-Blog
-- Automatically creates draft blog posts when new videos are published

-- YouTube channel settings
CREATE TABLE IF NOT EXISTS youtube_channel_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id TEXT NOT NULL UNIQUE,
  channel_name TEXT,
  channel_url TEXT,
  webhook_secret TEXT NOT NULL,
  subscription_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track processed videos
CREATE TABLE IF NOT EXISTS youtube_processed_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id TEXT NOT NULL UNIQUE,
  video_title TEXT,
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add source tracking to blog_posts if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'source') THEN
    ALTER TABLE blog_posts ADD COLUMN source TEXT DEFAULT 'manual';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'youtube_channel_id') THEN
    ALTER TABLE blog_posts ADD COLUMN youtube_channel_id TEXT;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_youtube_channel_settings_channel_id ON youtube_channel_settings(channel_id);
CREATE INDEX IF NOT EXISTS idx_youtube_channel_settings_active ON youtube_channel_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_youtube_processed_videos_video_id ON youtube_processed_videos(video_id);
CREATE INDEX IF NOT EXISTS idx_youtube_processed_videos_status ON youtube_processed_videos(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_source ON blog_posts(source);

-- Enable RLS
ALTER TABLE youtube_channel_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_processed_videos ENABLE ROW LEVEL SECURITY;

-- Only admins can access YouTube settings
CREATE POLICY "Admins can manage youtube settings"
  ON youtube_channel_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Only admins can view processed videos
CREATE POLICY "Admins can view processed videos"
  ON youtube_processed_videos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Update trigger for youtube_channel_settings
CREATE OR REPLACE FUNCTION update_youtube_channel_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER youtube_channel_settings_updated_at
  BEFORE UPDATE ON youtube_channel_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_youtube_channel_settings_updated_at();
