"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAdminFetch } from "@/components/admin-auth-provider";

export default function ItemDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const adminFetch = useAdminFetch();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    setError(null);
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setIsDeleting(true);
    try {
      const response = await adminFetch(`/api/records/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Delete failed.");
      }
      router.push("/library");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setIsDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {confirming ? (
          <motion.button
            key="confirm"
            onClick={handleDelete}
            disabled={isDeleting}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-xs font-mono text-red-600 bg-red-100 border-2 border-red-400 px-4 py-2.5 rounded disabled:opacity-50"
          >
            {isDeleting ? "..." : "CONFIRM?"}
          </motion.button>
        ) : (
          <motion.button
            key="delete"
            onClick={handleDelete}
            disabled={isDeleting}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(254,226,226,1)" }}
            whileTap={{ scale: 0.95 }}
            className="text-xs font-mono text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded disabled:opacity-50"
          >
            [DEL]
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-2 text-xs text-red-600"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
