"use client";

import { useState } from "react";
import { safeCssUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { MediaType, RecordStatus } from "@/lib/data";
import { statusLabels } from "@/lib/labels";
import StarRating from "@/components/star-rating";
import { useAdminFetch } from "@/components/admin-auth-provider";

interface SearchItem {
  sources: string[];
  sourceIds: Record<string, string>;
  type: MediaType;
  title: string;
  originalTitle?: string;
  year?: number;
  summary?: string;
  coverUrl?: string;
}

const statusOptions: RecordStatus[] = ["planned", "in_progress", "completed", "paused"];
const mediaTypeOptions: { value: MediaType; label: string }[] = [
  { value: "book", label: "书籍" },
  { value: "film", label: "电影" },
  { value: "series", label: "剧集" },
  { value: "game", label: "游戏" },
];

export default function NewRecordPage() {
  const router = useRouter();
  const adminFetch = useAdminFetch();
  const [entryMode, setEntryMode] = useState<"search" | "manual">("search");
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchItem | null>(null);
  const [showAllResults, setShowAllResults] = useState(false);

  const [form, setForm] = useState({
    title: "",
    type: "book" as MediaType,
    originalTitle: "",
    year: "",
    summary: "",
    coverUrl: "",
    status: "planned" as RecordStatus,
    rating: 0,
    notes: "",
  });

  const payloadFromResult = (item: SearchItem) => ({
    type: item.type,
    title: item.title,
    originalTitle: item.originalTitle,
    year: item.year,
    summary: item.summary || `source: ${item.sources.join(", ")}`,
    coverUrl: item.coverUrl,
    status: form.status,
    rating: form.rating > 0 ? form.rating : undefined,
    sourceIds: item.sourceIds,
    notes: form.notes.trim() || undefined,
  });

  const payloadFromManualForm = () => ({
    type: form.type,
    title: form.title.trim(),
    originalTitle: form.originalTitle.trim() || undefined,
    year: form.year.trim() ? Number(form.year) : undefined,
    summary: form.summary.trim() || "手动添加的记录",
    coverUrl: form.coverUrl.trim() || undefined,
    status: form.status,
    rating: form.rating > 0 ? form.rating : undefined,
    notes: form.notes.trim() || undefined,
  });

  const handleSearch = async () => {
    if (!form.title.trim()) return;
    setSearching(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const response = await adminFetch(
        `/api/search?q=${encodeURIComponent(form.title)}`
      );
      if (!response.ok) {
        throw new Error("SEARCH_FAILED");
      }
      const data = await response.json();
      const results = (data.results || []) as SearchItem[];

      setSearchResults(results);
      setShowAllResults(false);
      setSelectedResult(results[0] ?? null);

      if (results.length === 0) {
        setSearchError("WARN: NO_RESULTS_FOUND");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "SEARCH_FAILED";
      setSearchError(`ERR: ${message}`);
    } finally {
      setSearching(false);
    }
  };

  const handleSave = async () => {
    if (entryMode === "manual" && !form.title.trim()) {
      setSearchError("ERR: TITLE_REQUIRED");
      return;
    }
    if (entryMode === "manual" && form.year.trim() && !Number.isInteger(Number(form.year))) {
      setSearchError("ERR: INVALID_YEAR");
      return;
    }

    const target = selectedResult ?? searchResults[0];
    if (entryMode === "search" && !target) {
      setSearchError("ERR: NO_RESULT_SELECTED");
      return;
    }
    setSaving(true);
    setSearchError(null);
    try {
      const response = await adminFetch("/api/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          entryMode === "manual" ? payloadFromManualForm() : payloadFromResult(target as SearchItem)
        ),
      });
      const data = (await response.json()) as {
        record?: { id: string };
        error?: string;
      };
      if (!response.ok || data.error || !data.record) {
        throw new Error(data.error || "SAVE_FAILED");
      }
      router.push(`/items/${data.record.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "SAVE_FAILED";
      setSearchError(`ERR: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = { book: "书籍", film: "电影", series: "剧集", game: "游戏" };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="stagger-in">
      {/* Terminal Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-[var(--font-terminal)] text-[#00a86b] text-sm">./new</span>
          <span className="text-[#d4cfc5]">→</span>
          <span className="text-[#7a756f] text-sm">add_record</span>
        </div>
        <p className="text-[#7a756f] text-sm font-[var(--font-mono)]">
          mode: {entryMode === "manual" ? "manual_entry" : "universal_search"}<span className="term-cursor" />
        </p>
      </header>

      <div className="space-y-4">
        <div className="term-card">
          <h2 className="font-[var(--font-terminal)] text-[#1a1915] text-sm mb-4 flex items-center gap-2">
            <span className="text-[#00a86b]">&gt;</span>
            ENTRY_MODE
          </h2>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setEntryMode("search");
                setSearchError(null);
              }}
              className={`term-btn ${entryMode === "search" ? "border-[#00a86b] bg-[#00a86b]/10" : ""}`}
            >
              <span>SEARCH</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEntryMode("manual");
                setSearchError(null);
              }}
              className={`term-btn ${entryMode === "manual" ? "border-[#00a86b] bg-[#00a86b]/10" : ""}`}
            >
              <span>MANUAL</span>
            </button>
          </div>
        </div>

        {/* Search Section */}
        {entryMode === "search" && (
          <div className="term-card">
          <h2 className="font-[var(--font-terminal)] text-[#1a1915] text-sm mb-4 flex items-center gap-2">
            <span className="text-[#00a86b]">&gt;</span>
            SEARCH_QUERY
          </h2>

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            {/* Search Input */}
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="搜索书名、电影、剧集、游戏..."
              className="term-input flex-1"
            />

            {/* Search Button */}
            <button
              type="submit"
              disabled={searching || !form.title.trim()}
              className="term-btn shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{searching ? "..." : ">>"}</span>
            </button>
          </form>

          {searching && (
            <div className="mt-3 text-xs font-[var(--font-mono)] text-[#6b6560]">
              ... 正在搜索 NeoDB
            </div>
          )}

          {/* Error Message */}
          {searchError && (
            <div className="mt-4 text-xs font-[var(--font-mono)] text-[#c53030]">
              [{searchError}]
            </div>
          )}
          </div>
        )}

        {/* Search Results */}
        {entryMode === "search" && searchResults.length > 0 && (
          <div className="term-card">
            <h2 className="font-[var(--font-terminal)] text-[#1a1915] text-sm mb-4 flex items-center gap-2">
              <span className="text-[#00a86b]">&gt;</span>
              SEARCH_RESULTS
              <span className="text-[#7a756f]">({searchResults.length})</span>
            </h2>

            <div className="space-y-3" role="listbox" aria-label="搜索结果">
              {(showAllResults ? searchResults : searchResults.slice(0, 3)).map((item, index) => {
                const itemKey =
                  item.sourceIds?.neodb ? `neodb-${item.sourceIds.neodb}` : `${item.type}-${item.title}-${index}`;
                const selected =
                  selectedResult?.sourceIds?.neodb
                    ? selectedResult.sourceIds.neodb === item.sourceIds?.neodb
                    : selectedResult?.title === item.title && selectedResult?.type === item.type;
                return (
                  <button
                    key={itemKey}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => setSelectedResult(item)}
                    className={`w-full text-left p-3 border cursor-pointer transition-all ${
                      selected
                        ? "border-[#00a86b] bg-[#00a86b]/10"
                        : "border-[#d4cfc5] hover:border-[#00a86b]/50"
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Cover */}
                      <div
                        className="shrink-0 w-12 h-16 rounded border border-[#d4cfc5] bg-white"
                        style={{
                          background: item.coverUrl
                            ? safeCssUrl(item.coverUrl)
                            : undefined,
                        }}
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-[var(--font-terminal)] text-sm text-[#1a1915] truncate">
                            {selected && <span className="text-[#00a86b] mr-2">&gt;</span>}
                            {item.title}
                          </h3>
                          <span className="term-badge text-[10px] shrink-0">
                            {getTypeLabel(item.type)}
                          </span>
                        </div>
                        {item.originalTitle && (
                          <p className="text-[#6b6560] text-xs truncate">{item.originalTitle}</p>
                        )}
                        {item.year && (
                          <p className="text-[#7a756f] text-xs">{item.year}</p>
                        )}
                        {item.summary && (
                          <p className="text-[#6b6560] text-xs mt-1 line-clamp-2">
                            {item.summary}
                          </p>
                        )}
                        <div className="mt-2 flex gap-1.5">
                          {item.sources.map((source) => (
                            <span key={source} className="term-badge text-[10px]">
                              {source === "neodb" ? "NEODB" : source}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {!showAllResults && searchResults.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllResults(true)}
                className="term-btn w-full mt-3"
              >
                <span>[+] SHOW_MORE ({searchResults.length - 3})</span>
              </button>
            )}
          </div>
        )}

        {entryMode === "manual" && (
          <div className="term-card">
            <h2 className="font-[var(--font-terminal)] text-[#1a1915] text-sm mb-4 flex items-center gap-2">
              <span className="text-[#00a86b]">&gt;</span>
              MANUAL_RECORD
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="manual-title" className="block text-xs text-[#6b6560] mb-2 font-[var(--font-mono)]">
                  title=*
                </label>
                <input
                  id="manual-title"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="记录名称"
                  className="term-input w-full"
                />
              </div>

              <div>
                <label htmlFor="manual-type" className="block text-xs text-[#6b6560] mb-2 font-[var(--font-mono)]">
                  type=
                </label>
                <select
                  id="manual-type"
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as MediaType }))}
                  className="term-select"
                >
                  {mediaTypeOptions.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="manual-original-title" className="block text-xs text-[#6b6560] mb-2 font-[var(--font-mono)]">
                  original_title=
                </label>
                <input
                  id="manual-original-title"
                  value={form.originalTitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, originalTitle: e.target.value }))}
                  placeholder="可选"
                  className="term-input w-full"
                />
              </div>

              <div>
                <label htmlFor="manual-year" className="block text-xs text-[#6b6560] mb-2 font-[var(--font-mono)]">
                  year=
                </label>
                <input
                  id="manual-year"
                  value={form.year}
                  onChange={(e) => setForm((prev) => ({ ...prev, year: e.target.value }))}
                  inputMode="numeric"
                  placeholder="可选，默认今年"
                  className="term-input w-full"
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="manual-summary" className="block text-xs text-[#6b6560] mb-2 font-[var(--font-mono)]">
                summary=
              </label>
              <textarea
                id="manual-summary"
                value={form.summary}
                onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="一句简介，可留空"
                rows={3}
                className="term-input w-full resize-none"
              />
            </div>

            <div className="mt-4">
              <label htmlFor="manual-cover-url" className="block text-xs text-[#6b6560] mb-2 font-[var(--font-mono)]">
                cover_url=
              </label>
              <input
                id="manual-cover-url"
                value={form.coverUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, coverUrl: e.target.value }))}
                placeholder="可选，图片 URL"
                className="term-input w-full"
              />
            </div>

            {searchError && (
              <div className="mt-4 text-xs font-[var(--font-mono)] text-[#c53030]">
                [{searchError}]
              </div>
            )}
          </div>
        )}

        {/* Save Section */}
        <div className="term-card">
          <h2 className="font-[var(--font-terminal)] text-[#1a1915] text-sm mb-4 flex items-center gap-2">
            <span className="text-[#00a86b]">&gt;</span>
            RECORD_METADATA
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Status */}
            <div>
              <label htmlFor="new-status" className="block text-xs text-[#6b6560] mb-2 font-[var(--font-mono)]">
                status=
              </label>
              <select
                id="new-status"
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, status: e.target.value as RecordStatus }))
                }
                className="term-select"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <label htmlFor="new-rating" className="block text-xs text-[#6b6560] mb-2 font-[var(--font-mono)]">
                rating=
              </label>
              <StarRating
                id="new-rating"
                value={form.rating}
                onChange={(value) => setForm((prev) => ({ ...prev, rating: value }))}
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="new-review" className="block text-xs text-[#6b6560] mb-2 font-[var(--font-mono)]">
              review=
            </label>
            <textarea
              id="new-review"
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="写一句评价（最多 200 字）"
              maxLength={200}
              rows={3}
              className="term-input w-full resize-none"
            />
            <div className="mt-1 text-[10px] text-[#7a756f] font-[var(--font-mono)]">
              {form.notes.length}/200
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || (entryMode === "search" ? searchResults.length === 0 : !form.title.trim())}
            className="term-btn w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{saving ? "[...] SAVING..." : "[>] SAVE_TO_DATABASE"}</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-[#d4cfc5]">
        <div className="flex items-center justify-between text-xs text-[#7a756f] font-[var(--font-mono)]">
          <span>{entryMode === "manual" ? "source: local" : `results: ${searchResults.length}`}</span>
          <span>ready</span>
        </div>
      </footer>
    </div>
  );
}
