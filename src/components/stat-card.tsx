"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

// Animated counter hook
function useAnimatedCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutExpo
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

// Animated bar hook
function useAnimatedBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

export function AnimatedBar({
  value,
  max,
  color = "#1c1a17",
  delay = 0,
}: {
  value: number;
  max: number;
  color?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useAnimatedBar();
  const percent = max > 0 ? (value / max) * 100 : 0;

  return (
    <div ref={ref} className="h-2 flex-1 rounded-full bg-[#efe8e0] overflow-hidden">
      <motion.div
        className="h-2 rounded-full"
        style={{ background: color }}
        initial={{ scaleX: 0 }}
        animate={isVisible ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{
          duration: 0.8,
          delay: delay * 0.1,
          ease: [0.4, 0, 0.2, 1],
        }}
        {...{ style: { background: color, transformOrigin: "left" } }}
      />
    </div>
  );
}

export default function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note?: string;
}) {
  // Try to parse numeric value for animation
  const numericValue = typeof value === "number" ? value : parseFloat(value);
  const isNumeric = !isNaN(numericValue);
  const { count, ref } = useAnimatedCounter(isNumeric ? numericValue : 0);

  return (
    <Card className="spotlight-card rounded-2xl border-black/5 bg-white/70 shadow-sm card-hover-lift">
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wide text-[#78716a]">
          {label}
        </p>
        <div ref={ref} className="mt-2 stat-counter">
          <p className="text-2xl font-display font-semibold text-[#1c1a17]">
            {isNumeric ? (
              <>
                {count}
                {typeof value === "string"
                  ? value.replace(/\d+\.?\d*/, "").trim()
                  : ""}
              </>
            ) : (
              value
            )}
          </p>
        </div>
        {note && <p className="mt-2 text-xs text-[#635d56]">{note}</p>}
      </CardContent>
    </Card>
  );
}
