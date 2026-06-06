import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import crypto from "node:crypto";

// --- Types (mirror data.ts) ---
type MediaType = "book" | "film" | "series" | "game";
type RecordStatus = "planned" | "in_progress" | "completed" | "paused";
type ProgressUnit = "pages" | "chapters" | "episodes" | "hours";

interface SeedRecord {
  id: string;
  type: MediaType;
  title: string;
  originalTitle?: string;
  year: number;
  summary: string;
  coverUrl?: string;
  cover: { tone: string; accent: string };
  status: RecordStatus;
  rating?: number;
  tags: string[];
  notes?: string;
  progress?: { current: number; total?: number; unit: ProgressUnit };
  sourceIds?: Record<string, string>;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  history: { date: string; status: RecordStatus; progress?: { current: number; total?: number; unit: ProgressUnit }; note?: string }[];
}

// --- Cover colors by type ---
const coverColors: Record<MediaType, { tone: string; accent: string }[]> = {
  book: [
    { tone: "#f5efe8", accent: "#b48a63" },
    { tone: "#ede4d8", accent: "#8b6f4e" },
    { tone: "#f0e6da", accent: "#a67c52" },
  ],
  film: [
    { tone: "#f3ece6", accent: "#b36b54" },
    { tone: "#ebe3dc", accent: "#8c5a47" },
    { tone: "#f0e5dd", accent: "#a35e45" },
  ],
  series: [
    { tone: "#eef0f2", accent: "#6b7a86" },
    { tone: "#e8eaed", accent: "#5c6b78" },
    { tone: "#eaecef", accent: "#7a8a96" },
  ],
  game: [
    { tone: "#f0ede7", accent: "#7f6d56" },
    { tone: "#ebe6de", accent: "#6d5a42" },
    { tone: "#f2ece4", accent: "#8a7560" },
  ],
};

// --- Test data ---
const books = [
  { title: "百年孤独", originalTitle: "Cien años de soledad", year: 1967, author: "Gabriel García Márquez", tags: ["魔幻现实主义", "经典"] },
  { title: "三体", originalTitle: "The Three-Body Problem", year: 2008, author: "刘慈欣", tags: ["科幻", "硬科幻"] },
  { title: "挪威的森林", originalTitle: "ノルウェイの森", year: 1987, author: "村上春树", tags: ["文学", "日本"] },
  { title: "小王子", originalTitle: "Le Petit Prince", year: 1943, author: "Antoine de Saint-Exupéry", tags: ["童话", "哲学"] },
  { title: "人类简史", originalTitle: "Sapiens: A Brief History of Humankind", year: 2011, author: "Yuval Noah Harari", tags: ["历史", "科普"] },
  { title: "活着", year: 1993, author: "余华", tags: ["文学", "中国"] },
];

const films = [
  { title: "肖申克的救赎", originalTitle: "The Shawshank Redemption", year: 1994, director: "Frank Darabont", tags: ["剧情", "经典"] },
  { title: "星际穿越", originalTitle: "Interstellar", year: 2014, director: "Christopher Nolan", tags: ["科幻", "冒险"] },
  { title: "千与千寻", originalTitle: "千と千尋の神隠し", year: 2001, director: "宫崎骏", tags: ["动画", "奇幻"] },
  { title: "盗梦空间", originalTitle: "Inception", year: 2010, director: "Christopher Nolan", tags: ["科幻", "悬疑"] },
  { title: "霸王别姬", year: 1993, director: "陈凯歌", tags: ["剧情", "中国"] },
];

const series = [
  { title: "绝命毒师", originalTitle: "Breaking Bad", year: 2008, tags: ["犯罪", "剧情"], episodes: 62 },
  { title: "切尔诺贝利", originalTitle: "Chernobyl", year: 2019, tags: ["历史", "灾难"], episodes: 5 },
  { title: "进击的巨人", originalTitle: "進撃の巨人", year: 2013, tags: ["动画", "动作"], episodes: 87 },
  { title: "琅琊榜", year: 2015, tags: ["古装", "权谋"], episodes: 54 },
];

const games = [
  { title: "塞尔达传说：旷野之息", originalTitle: "The Legend of Zelda: Breath of the Wild", year: 2017, tags: ["冒险", "开放世界"] },
  { title: "艾尔登法环", originalTitle: "Elden Ring", year: 2022, tags: ["动作RPG", "魂系"] },
  { title: "赛博朋克2077", originalTitle: "Cyberpunk 2077", year: 2020, tags: ["RPG", "科幻"] },
  { title: "空洞骑士", originalTitle: "Hollow Knight", year: 2017, tags: ["类银河恶魔城", "独立"] },
];

const statuses: RecordStatus[] = ["completed", "in_progress", "planned", "paused"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(startYear: number, endYear: number): string {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  return new Date(start + Math.random() * (end - start)).toISOString();
}

function generateRecords(): SeedRecord[] {
  const records: SeedRecord[] = [];
  const allCovers = { book: coverColors.book, film: coverColors.film, series: coverColors.series, game: coverColors.game };

  // Books
  for (const b of books) {
    const status = randomFrom(statuses);
    const rating = status === "completed" ? randomInt(60, 100) / 10 : undefined;
    const createdAt = randomDate(2024, 2025);
    const updatedAt = new Date(new Date(createdAt).getTime() + randomInt(1, 180) * 86400000).toISOString();
    const startedAt = status !== "planned" ? createdAt : undefined;
    const completedAt = status === "completed" ? updatedAt : undefined;

    records.push({
      id: crypto.randomUUID(),
      type: "book",
      title: b.title,
      originalTitle: b.originalTitle,
      year: b.year,
      summary: `${b.author}的作品`,
      cover: randomFrom(allCovers.book),
      status,
      rating,
      tags: b.tags,
      notes: status === "completed" ? randomFrom(["非常推荐", "值得反复阅读", "一口气读完", "经典之作", "引人深思"]) : undefined,
      progress: status === "in_progress" ? { current: randomInt(50, 300), total: randomInt(300, 600), unit: "pages" } : undefined,
      createdAt, updatedAt, startedAt, completedAt,
      history: [{ date: createdAt, status: "planned" }, ...(status !== "planned" ? [{ date: updatedAt, status }] : [])],
    });
  }

  // Films
  for (const f of films) {
    const status = randomFrom(statuses);
    const rating = status === "completed" ? randomInt(70, 100) / 10 : undefined;
    const createdAt = randomDate(2024, 2025);
    const updatedAt = new Date(new Date(createdAt).getTime() + randomInt(1, 90) * 86400000).toISOString();

    records.push({
      id: crypto.randomUUID(),
      type: "film",
      title: f.title,
      originalTitle: f.originalTitle,
      year: f.year,
      summary: `${f.director}执导`,
      cover: randomFrom(allCovers.film),
      status,
      rating,
      tags: f.tags,
      notes: status === "completed" ? randomFrom(["画面震撼", "剧情感人", "大师之作", "年度最佳"]) : undefined,
      createdAt, updatedAt,
      completedAt: status === "completed" ? updatedAt : undefined,
      history: [{ date: createdAt, status: "planned" }, ...(status !== "planned" ? [{ date: updatedAt, status }] : [])],
    });
  }

  // Series
  for (const s of series) {
    const status = randomFrom(statuses);
    const rating = status === "completed" ? randomInt(70, 100) / 10 : undefined;
    const createdAt = randomDate(2024, 2025);
    const updatedAt = new Date(new Date(createdAt).getTime() + randomInt(1, 200) * 86400000).toISOString();

    records.push({
      id: crypto.randomUUID(),
      type: "series",
      title: s.title,
      originalTitle: s.originalTitle,
      year: s.year,
      summary: `${s.episodes}集`,
      cover: randomFrom(allCovers.series),
      status,
      rating,
      tags: s.tags,
      notes: status === "completed" ? randomFrom(["追完了", "太精彩了", "停不下来", "强烈推荐"]) : undefined,
      progress: status === "in_progress" ? { current: randomInt(5, s.episodes - 5), total: s.episodes, unit: "episodes" } : undefined,
      createdAt, updatedAt,
      completedAt: status === "completed" ? updatedAt : undefined,
      history: [{ date: createdAt, status: "planned" }, ...(status !== "planned" ? [{ date: updatedAt, status }] : [])],
    });
  }

  // Games
  for (const g of games) {
    const status = randomFrom(statuses);
    const rating = status === "completed" ? randomInt(75, 100) / 10 : undefined;
    const createdAt = randomDate(2024, 2025);
    const updatedAt = new Date(new Date(createdAt).getTime() + randomInt(1, 150) * 86400000).toISOString();

    records.push({
      id: crypto.randomUUID(),
      type: "game",
      title: g.title,
      originalTitle: g.originalTitle,
      year: g.year,
      summary: `${randomFrom(["开放世界", "动作冒险", "角色扮演", "独立游戏"])}游戏`,
      cover: randomFrom(allCovers.game),
      status,
      rating,
      tags: g.tags,
      notes: status === "completed" ? randomFrom(["通关了", "神作", "意犹未尽", "值得全成就"]) : undefined,
      progress: status === "in_progress" ? { current: randomInt(10, 80), unit: "hours" as ProgressUnit } : undefined,
      createdAt, updatedAt,
      completedAt: status === "completed" ? updatedAt : undefined,
      history: [{ date: createdAt, status: "planned" }, ...(status !== "planned" ? [{ date: updatedAt, status }] : [])],
    });
  }

  return records;
}

// --- Main ---
const dbPath = path.join(process.cwd(), "data", "enjoyrecord.db");

console.log("🗄️  Seeding EnjoyRecord database...");
console.log(`   Database path: ${dbPath}`);

const db = new DatabaseSync(dbPath);
db.exec("PRAGMA journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    original_title TEXT,
    year INTEGER NOT NULL,
    summary TEXT NOT NULL,
    cover_url TEXT,
    cover_tone TEXT NOT NULL,
    cover_accent TEXT NOT NULL,
    status TEXT NOT NULL,
    rating REAL,
    tags TEXT NOT NULL,
    notes TEXT,
    progress_current INTEGER,
    progress_total INTEGER,
    progress_unit TEXT,
    source_ids TEXT,
    started_at TEXT,
    completed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    history TEXT NOT NULL
  );
`);

// Clear existing data
db.exec("DELETE FROM records");

const records = generateRecords();
console.log(`   Generating ${records.length} test records...`);

const insert = db.prepare(`
  INSERT INTO records (
    id, type, title, original_title, year, summary, cover_url,
    cover_tone, cover_accent, status, rating, tags, notes,
    progress_current, progress_total, progress_unit, source_ids,
    started_at, completed_at, created_at, updated_at, history
  )
  VALUES (
    @id, @type, @title, @original_title, @year, @summary, @cover_url,
    @cover_tone, @cover_accent, @status, @rating, @tags, @notes,
    @progress_current, @progress_total, @progress_unit, @source_ids,
    @started_at, @completed_at, @created_at, @updated_at, @history
  )
`);

db.exec("BEGIN");
for (const r of records) {
  insert.run({
    id: r.id,
    type: r.type,
    title: r.title,
    original_title: r.originalTitle ?? null,
    year: r.year,
    summary: r.summary,
    cover_url: r.coverUrl ?? null,
    cover_tone: r.cover.tone,
    cover_accent: r.cover.accent,
    status: r.status,
    rating: r.rating ?? null,
    tags: JSON.stringify(r.tags),
    notes: r.notes ?? null,
    progress_current: r.progress?.current ?? null,
    progress_total: r.progress?.total ?? null,
    progress_unit: r.progress?.unit ?? null,
    source_ids: null,
    started_at: r.startedAt ?? null,
    completed_at: r.completedAt ?? null,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
    history: JSON.stringify(r.history),
  });
}
db.exec("COMMIT");

const count = (db.prepare("SELECT COUNT(*) as count FROM records").get() as { count: number }).count;
console.log(`\n✅ Done! Inserted ${count} records.`);
console.log(`   Books: ${records.filter(r => r.type === "book").length}`);
console.log(`   Films: ${records.filter(r => r.type === "film").length}`);
console.log(`   Series: ${records.filter(r => r.type === "series").length}`);
console.log(`   Games: ${records.filter(r => r.type === "game").length}`);
console.log(`\n   Run 'npm run dev' to start the app.`);
