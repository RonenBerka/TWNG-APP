-- Migration: Create forum tables and migrate from discussion tables
-- This migration creates the new forum table structure and migrates existing discussion data

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. CREATE NEW FORUM TABLES
-- ============================================================================

-- Forum categories table
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  thread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum threads table
CREATE TABLE IF NOT EXISTS forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES forum_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500),
  content TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum posts (replies) table
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  parent_post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT FALSE,
  like_count INTEGER DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- ============================================================================
-- 2. CREATE INDEXES FOR COMMON QUERIES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_forum_categories_slug ON forum_categories(slug);
CREATE INDEX IF NOT EXISTS idx_forum_categories_display_order ON forum_categories(display_order);

CREATE INDEX IF NOT EXISTS idx_forum_threads_category_id ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author_id ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_slug ON forum_threads(slug);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created_at ON forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_threads_last_activity_at ON forum_threads(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_threads_is_pinned ON forum_threads(is_pinned) WHERE is_pinned = TRUE;

CREATE INDEX IF NOT EXISTS idx_forum_posts_thread_id ON forum_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_parent_post_id ON forum_posts(parent_post_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_is_solution ON forum_posts(is_solution) WHERE is_solution = TRUE;

CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

-- ============================================================================
-- 3. DATA MIGRATION FROM OLD TABLES
-- ============================================================================

-- Migrate categories from discussion_categories to forum_categories
INSERT INTO forum_categories (id, name, slug, description, display_order, thread_count, created_at)
SELECT
  id,
  name,
  COALESCE(slug, LOWER(REGEXP_REPLACE(name, '[^a-z0-9]+', '-', 'g'))),
  description,
  COALESCE(position, 0) as display_order,
  COALESCE(post_count, 0) as thread_count,
  created_at
FROM discussion_categories
ON CONFLICT (slug) DO NOTHING;

-- Migrate top-level discussion posts (threads) to forum_threads
-- These are posts where parent_id IS NULL (original threads with titles)
INSERT INTO forum_threads (id, category_id, author_id, title, slug, content, created_at, updated_at, last_activity_at)
SELECT
  dp.id,
  dp.category_id,
  dp.author_id,
  dp.title,
  LOWER(REGEXP_REPLACE(COALESCE(dp.title, ''), '[^a-z0-9]+', '-', 'g')) as slug,
  dp.content,
  dp.created_at,
  dp.updated_at,
  dp.updated_at as last_activity_at
FROM discussion_posts dp
WHERE dp.parent_id IS NULL
ON CONFLICT DO NOTHING;

-- Migrate child discussion posts (replies) to forum_posts
-- These are posts where parent_id IS NOT NULL (replies within threads)
INSERT INTO forum_posts (id, thread_id, author_id, parent_post_id, content, created_at, updated_at)
SELECT
  dp.id,
  dp.parent_id as thread_id,
  dp.author_id,
  NULL as parent_post_id,
  dp.content,
  dp.created_at,
  dp.updated_at
FROM discussion_posts dp
WHERE dp.parent_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Update reply counts on threads
UPDATE forum_threads ft
SET reply_count = (
  SELECT COUNT(*) FROM forum_posts fp WHERE fp.thread_id = ft.id
)
WHERE EXISTS (SELECT 1 FROM forum_posts fp WHERE fp.thread_id = ft.id);

-- ============================================================================
-- 4. SEED DEFAULT CATEGORIES IF NO DATA EXISTS
-- ============================================================================

INSERT INTO forum_categories (name, slug, description, display_order, thread_count)
SELECT
  'General Discussion',
  'general-discussion',
  'General discussions about the forum and community',
  0,
  0
WHERE NOT EXISTS (SELECT 1 FROM forum_categories)

UNION ALL

SELECT
  'Gear Talk',
  'gear-talk',
  'Discussion about instruments, equipment, and gear',
  1,
  0
WHERE NOT EXISTS (SELECT 1 FROM forum_categories)

UNION ALL

SELECT
  'Luthier Corner',
  'luthier-corner',
  'For luthiers and instrument makers to share knowledge',
  2,
  0
WHERE NOT EXISTS (SELECT 1 FROM forum_categories)

UNION ALL

SELECT
  'Buy/Sell/Trade',
  'buy-sell-trade',
  'Buy, sell, or trade instruments and parts',
  3,
  0
WHERE NOT EXISTS (SELECT 1 FROM forum_categories)

UNION ALL

SELECT
  'Identification Help',
  'identification-help',
  'Help identifying instruments and their makers',
  4,
  0
WHERE NOT EXISTS (SELECT 1 FROM forum_categories)

ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Forum Categories: Anyone can read
CREATE POLICY "forum_categories_read" ON forum_categories
  FOR SELECT USING (true);

CREATE POLICY "forum_categories_insert" ON forum_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "forum_categories_update" ON forum_categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "forum_categories_delete" ON forum_categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Forum Threads: Anyone can read, authenticated users can insert, author can update/delete
CREATE POLICY "forum_threads_read" ON forum_threads
  FOR SELECT USING (true);

CREATE POLICY "forum_threads_insert" ON forum_threads
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "forum_threads_update" ON forum_threads
  FOR UPDATE USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "forum_threads_delete" ON forum_threads
  FOR DELETE USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Forum Posts: Anyone can read, authenticated users can insert, author can update/delete
CREATE POLICY "forum_posts_read" ON forum_posts
  FOR SELECT USING (true);

CREATE POLICY "forum_posts_insert" ON forum_posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "forum_posts_update" ON forum_posts
  FOR UPDATE USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "forum_posts_delete" ON forum_posts
  FOR DELETE USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Post Likes: Anyone can read, authenticated users can insert their own, can delete their own
CREATE POLICY "post_likes_read" ON post_likes
  FOR SELECT USING (true);

CREATE POLICY "post_likes_insert" ON post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "post_likes_delete" ON post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
