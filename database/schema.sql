-- 国子监 数据库建表 SQL（在 Supabase SQL Editor 中执行）

CREATE TABLE allowed_users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO allowed_users (name, role) VALUES ('你的姓名', 'admin');

CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  taken_date DATE NOT NULL,
  uploaded_by TEXT NOT NULL REFERENCES allowed_users(name),
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  author TEXT NOT NULL REFERENCES allowed_users(name),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE history_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  author TEXT NOT NULL REFERENCES allowed_users(name),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_images_taken_date ON images(taken_date);
CREATE INDEX idx_comments_date ON comments(date);
CREATE INDEX idx_comments_image_id ON comments(image_id);
CREATE INDEX idx_history_entries_date ON history_entries(date);
