"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminAuthProvider from "@/components/admin-auth-provider";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { APP_VERSION } from "@/lib/version";

const NAV_ITEMS = [
  { href: "/", label: "HOME", icon: ">_", sublabel: "首页" },
  { href: "/library", label: "LIB", icon: "[]", sublabel: "库" },
  { href: "/stats", label: "STAT", icon: "%", sublabel: "统计" },
  { href: "/new", label: "NEW", icon: "+", sublabel: "添加" },
  { href: "/settings", label: "SET", icon: ":", sublabel: "设置" },
] as const;

const GITHUB_URL = "https://github.com/FanLu1994/CheckPoint";

// Framer motion variants
const navItemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
};

export default function TerminalSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCompact, setIsCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navContent = useMemo(
    () => (
      <nav className="w-48 transition-opacity duration-200 ease-out opacity-100">
        {/* Logo/Brand */}
        <motion.div
          className="px-4 pb-4 border-b border-[#d4cfc5] mb-4"
          variants={logoVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="flex h-8 w-8 items-center justify-center bg-[#00a86b] text-white shrink-0"
              whileHover={{ scale: 1.1, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <span className="font-[var(--font-terminal)] text-lg font-bold">
                CP
              </span>
            </motion.div>
            <div className="min-w-0">
              <div className="font-[var(--font-terminal)] text-sm text-[#00a86b] tracking-wider truncate">
                CHECKPOINT
              </div>
              <div className="text-[10px] text-[#6b6560]">
                v{APP_VERSION}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Links */}
        <div>
          {NAV_ITEMS.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.href}
                custom={i}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
              >
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`sidebar-nav-link flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 rounded-r-sm ${
                    isActive
                      ? "active bg-[#00a86b]/10 text-[#00a86b]"
                      : "text-[#6b6560] hover:text-[#1a1915] hover:bg-[#d4cfc5]/50"
                  }`}
                >
                  <span className="font-[var(--font-terminal)] text-base w-4 shrink-0">
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-[var(--font-terminal)] text-xs tracking-wider">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-[#7a756f] truncate">
                      {item.sublabel}
                    </div>
                  </div>
                  {isActive && (
                    <motion.span
                      layoutId="activeDot"
                      className="h-1.5 w-1.5 bg-[#00a86b] rounded-sm shrink-0"
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* GitHub Link */}
        <motion.div
          className="mt-4 px-4 pt-3 border-t border-[#d4cfc5]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[10px] text-[#6b6560] hover:text-[#00a86b] transition-colors duration-200 group"
          >
            <svg
              viewBox="0 0 16 16"
              className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110"
              fill="currentColor"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <span className="font-[var(--font-terminal)] tracking-wider">
              GITHUB
            </span>
            <svg
              viewBox="0 0 16 16"
              className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 3l5 5-5 5" />
            </svg>
          </a>
        </motion.div>

        {/* Status Indicator */}
        <div className="mt-3 px-4">
          <div className="text-[10px] text-[#7a756f] font-[var(--font-terminal)]">
            <div className="flex items-center gap-2">
              <span className="radar-dot inline-block w-2 h-2 bg-[#00a86b] rounded-full" />
              <span>ONLINE</span>
            </div>
          </div>
        </div>
      </nav>
    ),
    [pathname]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const parseSize = (value: string) => {
      const trimmed = value.trim();
      if (trimmed.endsWith("rem")) {
        const rootSize = Number.parseFloat(
          getComputedStyle(document.documentElement).fontSize
        );
        return Number.parseFloat(trimmed) * rootSize;
      }
      if (trimmed.endsWith("px")) {
        return Number.parseFloat(trimmed);
      }
      const numeric = Number.parseFloat(trimmed);
      return Number.isNaN(numeric) ? 0 : numeric;
    };

    const updateLayout = () => {
      const styles = getComputedStyle(document.documentElement);
      const maxWidth =
        parseSize(styles.getPropertyValue("--page-max-width")) || 800;
      const padding =
        parseSize(styles.getPropertyValue("--content-padding")) || 32;
      const sidebarWidth = 192;
      const sidebarGutter = 16;
      const requiredWidth = maxWidth + padding * 2 + sidebarWidth + sidebarGutter;
      const compact = window.innerWidth < requiredWidth;
      setIsCompact(compact);
      if (!compact) {
        setMenuOpen(false);
      }
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      {/* Container for sidebar + content */}
      <div className="relative max-w-[var(--page-max-width)] mx-auto px-[var(--content-padding)]">
        {/* Sidebar - fixed to viewport center, aligned to content left */}
        {!isCompact ? (
          <div
            className="fixed top-1/2 -translate-y-1/2 -translate-x-full z-10"
            style={{
              left: "max(var(--content-padding), calc((100vw - var(--page-max-width)) / 2 + var(--content-padding)))",
              marginLeft: "-1rem",
            }}
          >
            {navContent}
          </div>
        ) : null}

        {/* Floating Menu for Compact Layout */}
        {isCompact ? (
          <>
            <motion.button
              onClick={() => setMenuOpen(true)}
              className="fixed bottom-6 left-6 z-30 h-12 w-12 rounded-full border border-[#00a86b] bg-[#f7f4ef] text-[#00a86b] shadow-lg"
              whileHover={{ scale: 1.1, boxShadow: "0 8px 24px rgba(0,168,107,0.3)" }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              aria-label="Open menu"
            >
              <span className="font-[var(--font-terminal)] text-lg">≡</span>
            </motion.button>
            <AnimatePresence>
              {menuOpen && (
                <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
                  <DialogContent className="max-w-[14rem] p-0 border border-[#d4cfc5] bg-[#fdfcf9] shadow-xl rounded-2xl left-4 top-1/2 -translate-y-1/2 translate-x-0 data-[state=open]:translate-y-[-50%] data-[state=closed]:translate-y-[-50%]">
                    <DialogTitle className="sr-only">Navigation Menu</DialogTitle>
                    <div className="p-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#d4cfc5]">
                        <span className="font-[var(--font-terminal)] text-sm text-[#1a1915]">
                          MENU
                        </span>
                      </div>
                      <div className="pt-3">{navContent}</div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </AnimatePresence>
          </>
        ) : null}

        {/* Main Content */}
        <main id="main-content" className="py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              <AdminAuthProvider>{children}</AdminAuthProvider>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
