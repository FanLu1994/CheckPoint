"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { RecordItem } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { safeCssUrl } from "@/lib/utils";

const TYPE_LABELS = { book: "书籍", film: "电影", series: "剧集", game: "游戏" } as const;
const STATUS_LABELS = {
  completed: "完成",
  in_progress: "进行中",
  planned: "想",
  paused: "搁置",
} as const;

const Star = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 20 20"
    className={className}
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M10 1.5l2.3 4.7 5.2.8-3.8 3.7.9 5.2L10 13.6 5.4 15.9l.9-5.2L2.5 7l5.2-.8L10 1.5z"
    />
  </svg>
);

const renderRating = (rating: number | undefined) => {
  if (rating === undefined || rating === null) return "-";
  const safe = Math.min(10, Math.max(0, rating));
  const percent = (safe / 10) * 100;
  return (
    <span className="flex items-center gap-2">
      <span className="relative inline-flex items-center">
        <span className="flex gap-0.5 text-white/40">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={`star-bg-${index}`} className="h-3 w-3" />
          ))}
        </span>
        <span
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}
        >
          <span className="flex gap-0.5 text-[#f5a524]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={`star-fill-${index}`} className="h-3 w-3" />
            ))}
          </span>
        </span>
      </span>
      <span className="tabular-nums">{safe.toFixed(1)}</span>
    </span>
  );
};

export default function RecordCard({ item }: { item: RecordItem }) {
  return (
    <Link href={`/items/${item.id}`} aria-label={item.title} className="block h-full">
      <motion.div
        whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.1)" }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card className="group h-full overflow-hidden rounded-2xl border-black/5 bg-white/70 shadow-sm">
          <CardContent className="flex h-full flex-col gap-2 px-4 pt-3 pb-0">
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wide text-[#78716a]">
                {TYPE_LABELS[item.type]}
              </div>
              <h3 className="line-clamp-1 font-display text-lg font-semibold text-[#1c1a17] group-hover:text-[#00a86b] transition-colors duration-200">
                {item.title}
              </h3>
              <p className="line-clamp-2 text-sm text-[#635d56]">{item.summary}</p>
            </div>

            <div className="relative mt-auto -mx-4 h-40 overflow-hidden border border-black/5">
              <div
                className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                style={{
                  background: item.coverUrl
                    ? safeCssUrl(item.coverUrl)
                    : `linear-gradient(145deg, ${item.cover.tone}, ${item.cover.accent})`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c1a17]/80 via-[#1c1a17]/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 text-xs text-white">
                <span className="font-medium">{STATUS_LABELS[item.status]}</span>
                <span className="font-medium">{renderRating(item.rating)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
