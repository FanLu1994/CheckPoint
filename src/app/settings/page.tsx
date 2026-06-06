"use client";

import { useState } from "react";
import { useAdminFetch } from "@/components/admin-auth-provider";
import { APP_VERSION } from "@/lib/version";

export default function SettingsPage() {
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<{ imported: number; skipped: number } | null>(null);
  const adminFetch = useAdminFetch();

  const runSync = async () => {
    setSyncError(null);
    setSyncResult(null);

    setSyncing(true);
    try {
      const response = await adminFetch("/api/neodb/import", {
        method: "POST",
      });
      const data = (await response.json()) as {
        imported?: number;
        skipped?: number;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data?.error || "NeoDB 同步失败");
      }
      setSyncResult({
        imported: data.imported ?? 0,
        skipped: data.skipped ?? 0,
      });
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "NeoDB 同步失败");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="stagger-in">
      {/* Terminal Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-[var(--font-terminal)] text-[#00a86b] text-sm">./settings</span>
          <span className="text-[#d4cfc5]">→</span>
          <span className="text-[#7a756f] text-sm">configuration</span>
        </div>
        <p className="text-[#7a756f] text-sm font-[var(--font-mono)]">
          neo_api_token=env<span className="term-cursor" />
        </p>
      </header>

      <div className="space-y-4">
        {/* NeoDB Sync */}
        <div className="term-card">
          <h2 className="font-[var(--font-terminal)] text-[#1a1915] text-sm mb-4 flex items-center gap-2">
            <span className="text-[#00a86b]">&gt;</span>
            NEODB_SYNC
          </h2>

          <div className="space-y-4">
            <button
              onClick={runSync}
              disabled={syncing}
              className="term-btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{syncing ? "[~] SYNCING_NEODB" : "[>] SYNC_NEODB_NOW"}</span>
            </button>
            {syncError ? (
              <p className="text-[10px] text-[#d48806] font-[var(--font-mono)]">
                ! {syncError}
              </p>
            ) : syncResult ? (
              <p className="text-[10px] text-[#00a86b] font-[var(--font-mono)]">
                + imported {syncResult.imported}, skipped {syncResult.skipped}
              </p>
            ) : null}
          </div>
        </div>

        {/* System Info */}
        <div className="term-card">
          <h2 className="font-[var(--font-terminal)] text-[#1a1915] text-sm mb-4 flex items-center gap-2">
            <span className="text-[#00a86b]">&gt;</span>
            SYSTEM_INFO
          </h2>

          <div className="space-y-2 text-xs font-[var(--font-mono)]">
            <div className="flex justify-between">
              <span className="text-[#6b6560]">data_source:</span>
              <a
                href="https://neodb.social"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1a1915] hover:text-[#00a86b] underline decoration-dotted underline-offset-2 transition-colors"
              >
                "neodb.social" ↗
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6b6560]">data_source:</span>
              <span className="text-[#00a86b]">"CONFIGURED"</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6b6560]">token_source:</span>
              <span className="text-[#1a1915]">"ENVIRONMENT"</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6b6560]">sync_enabled:</span>
              <span className="text-[#00a86b]">"TRUE"</span>
            </div>
          </div>
        </div>

        {/* Sync Info */}
        <div className="term-card">
          <h2 className="font-[var(--font-terminal)] text-[#1a1915] text-sm mb-4 flex items-center gap-2">
            <span className="text-[#00a86b]">&gt;</span>
            SYNC_INFO
          </h2>

          <div className="text-xs text-[#6b6560] space-y-3 font-[var(--font-mono)]">
            <p>
              <span className="text-[#1a1915]">Checkpoint</span> 会自动将记录同步到您的 NeoDB 账户。
            </p>
            <div className="space-y-1 pl-4 border-l-2 border-[#d4cfc5]">
              <p>• 搜索: 从 NeoDB 公开目录获取</p>
              <p>• 保存: 本地存储 + 同步到 NeoDB</p>
              <p>• 状态: 自动映射 (planned→wishlist, completed→complete)</p>
              <p>• 评分: 同步到 NeoDB</p>
            </div>
            <p className="text-[#00a86b]">
              Token 已通过环境变量 NEODB_TOKEN 配置
            </p>
          </div>
        </div>

        {/* About */}
        <div className="term-card">
          <h2 className="font-[var(--font-terminal)] text-[#1a1915] text-sm mb-4 flex items-center gap-2">
            <span className="text-[#00a86b]">&gt;</span>
            ABOUT
          </h2>

          <div className="text-xs text-[#6b6560] space-y-2 font-[var(--font-mono)]">
            <p>
              <span className="text-[#1a1915]">Checkpoint</span> is a personal
              tracking system for reading and viewing history.
            </p>
            <p>
              Powered by{" "}
              <a
                href="https://neodb.social"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00a86b] hover:underline transition-colors"
              >
                NeoDB
              </a>{" "}
              API.
              Records synced to your{" "}
              <a
                href="https://neodb.social"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00a86b] hover:underline transition-colors"
              >
                NeoDB
              </a>{" "}
              account.
            </p>
            <div className="pt-2 border-t border-[#d4cfc5]">
              <span>version: {APP_VERSION}-terminal</span>
              <span className="mx-2">|</span>
              <span>build: 2025.01</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-[#d4cfc5]">
        <div className="flex items-center justify-between text-xs text-[#7a756f] font-[var(--font-mono)]">
          <span>config: loaded</span>
          <span>ready</span>
        </div>
      </footer>
    </div>
  );
}
