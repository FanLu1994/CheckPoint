"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import RecordCard from "@/components/record-card";
import RecordRow from "@/components/record-row";
import type { RecordItem, MediaType, RecordStatus } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { statusLabels, typeLabels } from "@/lib/labels";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const typeOptions: Array<MediaType | "all"> = [
  "all",
  "book",
  "film",
  "series",
  "game",
];

const statusOptions: Array<RecordStatus | "all"> = [
  "all",
  "planned",
  "in_progress",
  "completed",
  "paused",
];

const sortOptions = [
  { value: "recent", label: "最近更新" },
  { value: "completed", label: "完成时间" },
  { value: "rating", label: "评分" },
];

// Animation variants
const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 16 },
  visible: {
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

// Skeleton loader
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/70 p-4 animate-pulse">
      <div className="flex flex-col gap-3">
        <div className="h-40 rounded-lg bg-[#ebe8e1]" />
        <div className="h-4 w-3/4 rounded bg-[#ebe8e1]" />
        <div className="h-3 w-1/2 rounded bg-[#ebe8e1]" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="rounded-xl border border-black/5 bg-white/70 p-4 animate-pulse">
      <div className="flex gap-4">
        <div className="h-16 w-12 rounded-lg bg-[#ebe8e1] shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-[#ebe8e1]" />
          <div className="h-3 w-1/2 rounded bg-[#ebe8e1]" />
        </div>
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"card" | "list" | "timeline">("card");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<MediaType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<RecordStatus | "all">(
    "all"
  );
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const response = await axios.get<{ records: RecordItem[] }>(
          "/api/records"
        );
        setRecords(response.data.records);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "加载失败，请稍后重试"
        );
      } finally {
        setLoading(false);
      }
    };
    loadRecords();
  }, []);

  const filtered = useMemo(() => {
    let items = [...records];
    if (query.trim()) {
      const term = query.trim().toLowerCase();
      items = items.filter((item) =>
        [item.title, item.originalTitle, item.summary, ...item.tags]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(term))
      );
    }
    if (typeFilter !== "all") {
      items = items.filter((item) => item.type === typeFilter);
    }
    if (statusFilter !== "all") {
      items = items.filter((item) => item.status === statusFilter);
    }
    if (sortBy === "completed") {
      items.sort((a, b) =>
        (b.completedAt || "").localeCompare(a.completedAt || "")
      );
    } else if (sortBy === "rating") {
      items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    return items;
  }, [query, typeFilter, statusFilter, sortBy, records]);

  return (
    <div className="space-y-8">
      <motion.div
        className="flex flex-wrap items-center justify-between gap-4"
        initial={{ y: -10 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-3xl font-semibold">组织与检索</h1>
          <p className="text-sm text-[#635d56]">
            通过关键词与过滤条件快速定位条目。
          </p>
        </div>
        <Tabs
          value={view}
          onValueChange={(value) => setView(value as typeof view)}
        >
          <TabsList className="rounded-full bg-white/80 p-1">
            <TabsTrigger value="card" className="rounded-full">
              卡片
            </TabsTrigger>
            <TabsTrigger value="list" className="rounded-full">
              列表
            </TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-full">
              时间线
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      <motion.div
        initial={{ y: 10 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="rounded-3xl border-black/5 bg-white/80 shadow-sm">
          <CardContent className="grid gap-4 p-6 lg:grid-cols-[1.2fr_1fr_1fr_0.8fr]">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-[#78716a]">
                关键词
              </label>
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="输入名称、标签或备注"
                className="rounded-2xl border-black/10 bg-white text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-[#78716a]">
                类型
              </label>
              <ToggleGroup
                type="single"
                value={typeFilter}
                onValueChange={(value) =>
                  setTypeFilter((value as MediaType | "all") || "all")
                }
                className="flex flex-wrap justify-start gap-2"
              >
                {typeOptions.map((type) => (
                  <ToggleGroupItem
                    key={type}
                    value={type}
                    className="rounded-full border border-black/10 px-3 py-1 text-xs text-[#635d56] data-[state=on]:border-[#1c1a17] data-[state=on]:bg-[#1c1a17] data-[state=on]:text-white"
                  >
                    {type === "all" ? "全部" : typeLabels[type]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-[#78716a]">
                状态
              </label>
              <ToggleGroup
                type="single"
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter((value as RecordStatus | "all") || "all")
                }
                className="flex flex-wrap justify-start gap-2"
              >
                {statusOptions.map((status) => (
                  <ToggleGroupItem
                    key={status}
                    value={status}
                    className="rounded-full border border-black/10 px-3 py-1 text-xs text-[#635d56] data-[state=on]:border-[#1c1a17] data-[state=on]:bg-[#1c1a17] data-[state=on]:text-white"
                  >
                    {status === "all" ? "全部" : statusLabels[status]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-[#78716a]">
                排序
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="排序" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {loading ? (
        <motion.div
          className={
            view === "card"
              ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3"
              : view === "list"
                ? "space-y-3"
                : "space-y-6"
          }
        >
          {Array.from({ length: 6 }).map((_, i) =>
            view === "list" ? <SkeletonRow key={i} /> : <SkeletonCard key={i} />
          )}
        </motion.div>
      ) : error ? (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <Card className="rounded-3xl border-red-200 bg-red-50/50 shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="text-red-500 text-sm font-[var(--font-mono)]">
                [ERR: {error}]
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : records.length === 0 ? (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <Card className="rounded-3xl border-black/5 bg-white/80 shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="font-[var(--font-terminal)] text-lg text-[#1a1915] mb-2">
                NO_RECORDS_FOUND
              </div>
              <p className="text-sm text-[#6b6560] mb-4">
                还没有任何记录，去添加第一条吧。
              </p>
              <a
                href="/new"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-[#00a86b] text-white rounded-lg hover:bg-[#008a56] transition-colors"
              >
                <span className="font-[var(--font-terminal)]">
                  &gt; ADD_NEW
                </span>
              </a>
            </CardContent>
          </Card>
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div
        >
          <Card className="rounded-3xl border-black/5 bg-white/80 shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="font-[var(--font-terminal)] text-sm text-[#6b6560]">
                NO_MATCHING_RESULTS
              </div>
              <p className="text-xs text-[#7a756f] mt-1">
                尝试调整过滤条件或关键词
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : view === "card" ? (
        <motion.div
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >
                <RecordCard item={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : view === "list" ? (
        <motion.div
          className="space-y-3"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >
                <RecordRow item={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : view === "timeline" ? (
        <motion.div
          className="space-y-6"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >
                <Card className="rounded-3xl border-black/5 bg-white/80 shadow-sm">
                  <CardContent className="flex gap-4 p-5">
                    <div className="flex flex-col items-center">
                      <motion.div
                        className="h-3 w-3 rounded-full bg-[#1c1a17]"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 15,
                        }}
                      />
                      <div className="h-full w-px bg-black/10" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-wide text-[#78716a]">
                        {formatDate(item.updatedAt)}
                      </div>
                      <div className="text-lg font-semibold text-[#1c1a17]">
                        {item.title}
                      </div>
                      <p className="text-sm text-[#635d56]">{item.summary}</p>
                      <div className="text-xs text-[#635d56]">
                        最新状态：{statusLabels[item.status]}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </div>
  );
}
