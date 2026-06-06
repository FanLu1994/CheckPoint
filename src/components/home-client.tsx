"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { RecordItem } from "@/lib/data";
import { resolveProgress } from "@/lib/format";
import { safeCssUrl } from "@/lib/utils";
import { APP_VERSION } from "@/lib/version";
import { statusLabels, statusBadgeClass } from "@/lib/labels";
import { StarDisplay } from "@/components/star-rating";
import { BookOpen, Film, Tv, Gamepad2 } from "lucide-react";

interface HomeClientProps {
  records: RecordItem[];
}

const formatProgress = (progress: RecordItem["progress"]) => {
  if (!progress) return null;
  const unitLabels = { pages: "p", chapters: "ch", episodes: "ep", hours: "h" };
  return `${progress.current}${progress.total ? `/${progress.total}` : ""}${unitLabels[progress.unit] || ""}`;
};

const TypeIcon = ({ type }: { type: RecordItem["type"] }) => {
  const props = { size: 36, className: "text-[#7a756f]/70" };
  switch (type) {
    case "book": return <BookOpen {...props} />;
    case "film": return <Film {...props} />;
    case "series": return <Tv {...props} />;
    case "game": return <Gamepad2 {...props} />;
    default: return null;
  }
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};

const footerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delay: 0.6, duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
};

export default function HomeClient({ records }: HomeClientProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header with enhanced visual hierarchy */}
      <motion.header className="mb-10" variants={headerVariants}>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-[var(--font-terminal)] text-[#00a86b] text-sm tracking-wide">
            ./home
          </span>
          <span className="text-[#d4cfc5] text-xs">/</span>
          <span className="text-[#7a756f] text-sm">records</span>
        </div>
        <div className="flex items-baseline gap-3">
          <h1 className="text-[#1a1915] text-xl font-[var(--font-terminal)] tracking-wide">
            DATABASE
          </h1>
          <motion.span
            className="text-[#7a756f] text-xs font-[var(--font-mono)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {records.length} {records.length === 1 ? "entry" : "entries"}{" "}
            loaded
          </motion.span>
        </div>
        <div className="data-stream-divider mt-4" />
      </motion.header>

      {records.length > 0 ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-3 space-y-3">
          {records.map((item) => {
            const progress = resolveProgress(item);
            return (
              <motion.div
                key={item.id}
                variants={cardVariants}
                layout
              >
                <Link
                  href={`/items/${item.id}`}
                  aria-label={item.title}
                  className="block group break-inside-avoid"
                >
                  <motion.article
                    className="spotlight-card bg-white p-3 border border-black/5 rounded-xl mb-3 cursor-pointer overflow-hidden"
                    whileHover={{
                      y: -4,
                      boxShadow: "0 12px 32px rgba(0,0,0,0.1)",
                      borderColor: "rgba(0,168,107,0.2)",
                    }}
                    whileTap={{ scale: 0.98, y: -1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {/* Cover Image */}
                    <div
                      className="w-full aspect-[3/4] rounded-lg border border-black/5 bg-white flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow transition-shadow duration-200 mb-3"
                      style={{
                        background: item.coverUrl
                          ? safeCssUrl(item.coverUrl)
                          : `linear-gradient(145deg, ${item.cover.tone} 0%, ${item.cover.accent} 100%)`,
                      }}
                    >
                      {!item.coverUrl && (
                        <span className="font-[var(--font-terminal)] text-4xl text-[#7a756f]/70">
                          <TypeIcon type={item.type} />
                        </span>
                      )}
                    </div>

                    {/* Title and Rating */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-[var(--font-terminal)] text-[#1a1915] text-base leading-snug group-hover:text-[#00a86b] transition-colors duration-200 line-clamp-2 flex-1">
                        {item.title}
                      </h3>
                      {item.rating && (
                        <StarDisplay value={item.rating} size="sm" />
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-2 mb-2 text-xs">
                      <span className="text-[#7a756f] font-[var(--font-mono)] uppercase tracking-wider">
                        {item.type}
                      </span>
                      <span className="text-black/10">·</span>
                      <span className="text-[#7a756f] font-[var(--font-mono)]">
                        {item.year}
                      </span>
                    </div>

                    {/* Progress and Tags */}
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <span
                        className={`${statusBadgeClass(item.status)} font-[var(--font-mono)] text-[10px] uppercase tracking-wide`}
                      >
                        {statusLabels[item.status]}
                      </span>
                      {progress && (
                        <span className="inline-flex items-center gap-1.5 text-[#00a86b] font-[var(--font-mono)] bg-[#00a86b]/8 px-2 py-1 rounded-sm border border-[#00a86b]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00a86b] animate-pulse" />
                          {formatProgress(progress)}
                        </span>
                      )}
                    </div>

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mt-2">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="term-badge text-[10px] px-2 py-1 border border-black/5 text-[#6b6560]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.article>
                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Enhanced Empty State */
        <motion.div
          className="term-card text-center py-16 px-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Icon */}
          <motion.div
            className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#ebe8e1] border border-[#d4cfc5] flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-4xl font-[var(--font-terminal)] text-[#7a756f]">
              [DATABASE]
            </span>
          </motion.div>

          {/* Message */}
          <h2 className="font-[var(--font-terminal)] text-[#1a1915] text-xl mb-3 tracking-wide">
            DATABASE EMPTY
          </h2>
          <p className="text-[#6b6560] text-sm mb-8 max-w-xs mx-auto leading-relaxed">
            No records found in memory. Start tracking your reading and viewing
            journey.
          </p>

          {/* CTA Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/new"
              className="term-btn inline-flex items-center gap-2 px-6 py-3 cursor-pointer"
            >
              <span className="text-lg">+</span>
              <span>ADD FIRST RECORD</span>
            </Link>
          </motion.div>
        </motion.div>
      )}

      {/* Enhanced Footer */}
      <motion.footer
        className="mt-14 pt-6 border-t border-[#d4cfc5]"
        variants={footerVariants}
      >
        <div className="grid grid-cols-2 gap-4 text-xs text-[#7a756f] font-[var(--font-mono)]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00a86b]" />
            <span>MEMORY: {records.length} records</span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00a86b] animate-pulse" />
            <span>SYSTEM: READY</span>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-[10px] text-[#d4cfc5] font-[var(--font-mono)]">
            CHECKPOINT v{APP_VERSION} · DIGITAL TERMINAL
          </p>
        </div>
      </motion.footer>
    </motion.div>
  );
}
