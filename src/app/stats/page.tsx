import StatCard, { AnimatedBar } from "@/components/stat-card";
import { getAllRecords } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const recordItems = await getAllRecords();
  const completed = recordItems.filter((item) => item.status === "completed");
  const inProgress = recordItems.filter(
    (item) => item.status === "in_progress"
  );

  // 按类型统计完成数
  const completedByType = completed.reduce(
    (acc, item) => {
      acc[item.type] += 1;
      return acc;
    },
    { book: 0, film: 0, series: 0, game: 0 }
  );

  const avgRating =
    completed.reduce((sum, item) => sum + (item.rating || 0), 0) /
    (completed.length || 1);

  const typeCounts = recordItems.reduce(
    (acc, item) => {
      acc[item.type] += 1;
      return acc;
    },
    { book: 0, film: 0, series: 0, game: 0 }
  );

  const ratingBuckets = [
    { label: "9+", count: 0 },
    { label: "7.5-8.9", count: 0 },
    { label: "6-7.4", count: 0 },
    { label: "<6", count: 0 },
  ];

  completed.forEach((item) => {
    const rating = item.rating || 0;
    if (rating >= 9) ratingBuckets[0].count += 1;
    else if (rating >= 7.5) ratingBuckets[1].count += 1;
    else if (rating >= 6) ratingBuckets[2].count += 1;
    else ratingBuckets[3].count += 1;
  });

  const now = new Date();
  const monthly = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now);
    date.setMonth(now.getMonth() - (5 - index));
    const label = `${date.getMonth() + 1}月`;
    const count = completed.filter((item) => {
      if (!item.completedAt) return false;
      const completedDate = new Date(item.completedAt);
      return (
        completedDate.getFullYear() === date.getFullYear() &&
        completedDate.getMonth() === date.getMonth()
      );
    }).length;
    return { label, count };
  });

  const maxMonthly = Math.max(...monthly.map((item) => item.count), 1);
  const maxRating = Math.max(
    ...ratingBuckets.map((item) => item.count),
    1
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">统计回顾</h1>
        <p className="text-sm text-[#635d56]">
          查看完成数量、类型分布与评分走势。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="阅读完成" value={`${completedByType.book} 本`} />
        <StatCard
          label="观影完成"
          value={`${completedByType.film + completedByType.series} 部`}
        />
        <StatCard label="进行中" value={`${inProgress.length} 项`} />
        <StatCard label="平均评分" value={avgRating.toFixed(1)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="spotlight-card rounded-3xl border-black/5 bg-white/80 shadow-sm">
          <CardContent className="p-6">
            <div className="text-xs uppercase tracking-wide text-[#78716a]">
              月度完成数
            </div>
            <div className="mt-5 grid gap-3">
              {monthly.map((item, i) => (
                <div
                  key={item.label}
                  className="flex items-center gap-4 text-sm"
                >
                  <span className="w-12 text-[#635d56]">{item.label}</span>
                  <AnimatedBar
                    value={item.count}
                    max={maxMonthly}
                    delay={i}
                  />
                  <span className="w-8 text-right text-[#1c1a17] tabular-nums">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="spotlight-card rounded-3xl border-black/5 bg-white/80 shadow-sm">
          <CardContent className="p-6">
            <div className="text-xs uppercase tracking-wide text-[#78716a]">
              类型占比
            </div>
            <div className="mt-5 space-y-3 text-sm text-[#635d56]">
              {[
                { label: "书籍", count: typeCounts.book, color: "#d48806" },
                { label: "电影", count: typeCounts.film, color: "#c53030" },
                {
                  label: "剧集",
                  count: typeCounts.series,
                  color: "#0798b4",
                },
                { label: "游戏", count: typeCounts.game, color: "#00a86b" },
              ].map((item, i) => (
                <div key={item.label} className="flex items-center gap-4">
                  <span className="w-12">{item.label}</span>
                  <AnimatedBar
                    value={item.count}
                    max={recordItems.length}
                    color={item.color}
                    delay={i}
                  />
                  <span className="w-8 text-right text-[#1c1a17] tabular-nums">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="spotlight-card rounded-3xl border-black/5 bg-white/80 shadow-sm">
        <CardContent className="p-6">
          <div className="text-xs uppercase tracking-wide text-[#78716a]">
            评分分布
          </div>
          <div className="mt-5 grid gap-3">
            {ratingBuckets.map((bucket, i) => (
              <div
                key={bucket.label}
                className="flex items-center gap-4 text-sm"
              >
                <span className="w-16 text-[#635d56]">{bucket.label}</span>
                <AnimatedBar
                  value={bucket.count}
                  max={maxRating}
                  color="#d48806"
                  delay={i}
                />
                <span className="w-8 text-right text-[#1c1a17] tabular-nums">
                  {bucket.count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
