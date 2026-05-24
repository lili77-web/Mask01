import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '..', 'whisperbox.db')

const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE,
    wechat_id TEXT UNIQUE,
    nickname TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS whispers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL DEFAULT '',
    images TEXT DEFAULT '[]',
    voice_url TEXT DEFAULT '',
    like_count INTEGER DEFAULT 0,
    dislike_count INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_reactions (
    user_id TEXT NOT NULL,
    whisper_id TEXT NOT NULL,
    reaction_type TEXT NOT NULL CHECK(reaction_type IN ('like','dislike')),
    PRIMARY KEY (user_id, whisper_id)
  );

  CREATE TABLE IF NOT EXISTS ai_replies (
    id TEXT PRIMARY KEY,
    whisper_id TEXT NOT NULL REFERENCES whispers(id),
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS friends (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    friend_id TEXT NOT NULL REFERENCES users(id),
    status TEXT NOT NULL CHECK(status IN ('pending','accepted')),
    created_at INTEGER NOT NULL,
    UNIQUE(user_id, friend_id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL REFERENCES users(id),
    receiver_id TEXT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    whisper_id TEXT NOT NULL REFERENCES whispers(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS identities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    color TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS follows (
    follower_id TEXT NOT NULL REFERENCES users(id),
    followed_id TEXT NOT NULL REFERENCES users(id),
    created_at INTEGER NOT NULL,
    PRIMARY KEY (follower_id, followed_id)
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    mood_tag TEXT DEFAULT '',
    created_by TEXT NOT NULL REFERENCES users(id),
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS room_messages (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES rooms(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS room_members (
    room_id TEXT NOT NULL REFERENCES rooms(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    joined_at INTEGER NOT NULL,
    PRIMARY KEY (room_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('night_message', 'follow_update', 'general')),
    is_read INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_whispers_created_at ON whispers(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_messages_pair ON messages(sender_id, receiver_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_ai_replies_whisper ON ai_replies(whisper_id);
  CREATE INDEX IF NOT EXISTS idx_comments_whisper ON comments(whisper_id, created_at ASC);
`)

try {
  db.exec(`ALTER TABLE users ADD COLUMN bio TEXT DEFAULT ''`)
} catch { /* column may already exist */ }

try {
  db.exec(`ALTER TABLE users ADD COLUMN night_notification_time TEXT DEFAULT NULL`)
} catch { /* column may already exist */ }

try {
  db.exec(`ALTER TABLE whispers ADD COLUMN is_private_response INTEGER DEFAULT 0`)
} catch { /* column may already exist */ }

try {
  db.exec(`ALTER TABLE whispers ADD COLUMN identity_id TEXT REFERENCES identities(id)`)
} catch { /* column may already exist */ }

try {
  db.exec(`ALTER TABLE whispers ADD COLUMN report_count INTEGER DEFAULT 0`)
} catch { /* column may already exist */ }

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      whisper_id TEXT NOT NULL REFERENCES whispers(id),
      reporter_id TEXT NOT NULL REFERENCES users(id),
      reason TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `)
} catch { /* table may already exist */ }

try {
  db.exec(`CREATE INDEX IF NOT EXISTS idx_reports_whisper ON reports(whisper_id)`)
} catch { /* index may already exist */ }

// Favorites table
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      user_id TEXT NOT NULL REFERENCES users(id),
      whisper_id TEXT NOT NULL REFERENCES whispers(id),
      created_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, whisper_id)
    )
  `)
} catch { /* table may already exist */ }

// Drafts table
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS drafts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      content TEXT DEFAULT '',
      images TEXT DEFAULT '[]',
      voice_url TEXT DEFAULT '',
      identity_id TEXT REFERENCES identities(id),
      created_at INTEGER NOT NULL
    )
  `)
} catch { /* table may already exist */ }

// Hashtags table
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS hashtags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      count INTEGER DEFAULT 0
    )
  `)
} catch { /* table may already exist */ }

// Whisper-Hashtag relation table
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS whisper_hashtags (
      whisper_id TEXT NOT NULL REFERENCES whispers(id),
      hashtag_id INTEGER NOT NULL REFERENCES hashtags(id),
      PRIMARY KEY (whisper_id, hashtag_id)
    )
  `)
} catch { /* table may already exist */ }

// Message reads table for read receipts
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS message_reads (
      user_id TEXT NOT NULL REFERENCES users(id),
      friend_id TEXT NOT NULL REFERENCES users(id),
      last_read_message_id TEXT,
      last_read_at INTEGER,
      PRIMARY KEY (user_id, friend_id)
    )
  `)
} catch { /* table may already exist */ }

// Seed identities
const identitiesCount = db.prepare('SELECT COUNT(*) as count FROM identities').get() as any
if (identitiesCount.count === 0) {
  const insertIdentity = db.prepare('INSERT INTO identities (id, name, emoji, color) VALUES (?, ?, ?, ?)')
  const seedIdentities = [
    ['id_1', '夜猫子', '🦅', '#8B5CF6'],
    ['id_2', '迷茫青年', '🌫️', '#6B7280'],
    ['id_3', '治愈者', '🌿', '#10B981'],
    ['id_4', '树洞守护者', '🌳', '#92400E'],
    ['id_5', '孤独美食家', '🍜', '#F59E0B'],
    ['id_6', '失眠患者', '😴', '#3B82F6'],
    ['id_7', '理想主义者', '✨', '#EC4899'],
    ['id_8', '沉默的大多数', '🤐', '#64748B'],
    ['id_9', '夜旅人', '🌙', '#1E3A8A'],
    ['id_10', '快乐制造机', '🎉', '#EF4444'],
  ]
  for (const identity of seedIdentities) {
    insertIdentity.run(...identity)
  }
}

export default db