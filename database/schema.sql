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

-- 学期表
CREATE TABLE semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 预置六个学期
INSERT INTO semesters (name, sort_order) VALUES
  ('高一上学期', 1),
  ('高一下学期', 2),
  ('高二上学期', 3),
  ('高二下学期', 4),
  ('高三上学期', 5),
  ('高三下学期', 6);

-- 大事件表
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES allowed_users(name),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 事件记录表（每个人的书写）
CREATE TABLE event_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  author TEXT NOT NULL REFERENCES allowed_users(name),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_semester ON events(semester_id);
CREATE INDEX idx_event_entries_event ON event_entries(event_id);
