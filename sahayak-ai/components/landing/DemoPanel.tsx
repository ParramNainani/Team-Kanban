"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  FileStack,
  LineChart,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

const TABS = [
  { id: "discover", label: "Discover", icon: LineChart },
  { id: "eligibility", label: "Eligibility", icon: ShieldCheck },
  { id: "benefits", label: "Benefits", icon: BarChart3 },
  { id: "documents", label: "Documents", icon: FileStack },
] as const;

type TabId = (typeof TABS)[number]["id"];

const CONTENT: Record<
  TabId,
  { headline: string; body: string; metrics: [string, string, string] }
> = {
  discover: {
    headline: "Curated subsidies for your farm",
    body: "We analyze land holding, crop type, and state budgets to find actionable agricultural grants—skipping irrelevant ones.",
    metrics: ["8 subsidies", "Active now", "Maharashtra"],
  },
  eligibility: {
    headline: "Simplified criteria breakdown",
    body: "Land size limits, irrigation status, and crop requirements explained clearly so you know exactly what you qualify for.",
    metrics: ["Verified match", "Land < 2 Ha", "Drip reqs"],
  },
  benefits: {
    headline: "Clear subsidy details",
    body: "Understand the exact percentage of subsidy, maximum cap per hectare, and the timeline for multi-stage disbursement.",
    metrics: ["50-80% cover", "Up to ₹1L", "Direct transfer"],
  },
  documents: {
    headline: "Targeted document prep",
    body: "Aadhaar, 7/12 extract, and quotation for equipment—organized by what you need to upload first to start the claim.",
    metrics: ["3 core docs", "Land records", "Bank details"],
  },
};

function MiniCounter({ value, label }: { value: number; label: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf: number;
    const t0 = performance.now();
    const dur = 900;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      setN(Math.floor(value * (0.4 + 0.6 * (1 - Math.pow(1 - p, 3)))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <p className="font-mono text-2xl font-bold text-[#E15A15]">{n}</p>
      <p className="text-[10px] uppercase tracking-wider text-[#635E5C]">
        {label}
      </p>
    </div>
  );
}

export function DemoPanel() {
  const [tab, setTab] = useState<TabId>("discover");
  const c = CONTENT[tab];

  return (
    <div
      id="demo-panel"
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#120504] to-[#050101] shadow-2xl backdrop-blur-xl"
    >
      <div className="flex overflow-x-auto hide-scrollbar gap-2 border-b border-white/10 p-3 sm:p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`relative flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wide transition sm:text-sm ${
                active ? "text-[#EAE9DC]" : "text-[#635E5C] hover:text-[#EAE9DC]/80"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="demo-tab-bg"
                  className="absolute inset-0 rounded-xl border border-[#E15A15]/35 bg-[#DA1702]/15"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="h-4 w-4" aria-hidden />
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 p-4 sm:grid-cols-[1fr_200px] sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A78F62]">
              Example conversation
            </p>
            <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-black/35 p-4">
              <p className="text-[10px] uppercase text-[#635E5C]">User</p>
              <p className="text-sm text-[#EAE9DC]/90">
                I am a small farmer from Maharashtra looking for a subsidy to
                install a drip irrigation system.
              </p>
            </div>
            <div className="mt-3 rounded-2xl border border-[#E15A15]/25 bg-[#DA1702]/10 p-4">
              <p className="text-[10px] uppercase text-[#E15A15]">Assistant</p>
              <p className="mt-2 text-sm leading-relaxed text-[#EAE9DC]/85">
                {c.headline}. {c.body}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {c.metrics.map((m, j) => (
                  <li
                    key={`${tab}-${j}`}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-[#A78F62]"
                  >
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col gap-3">
          <MiniCounter value={8} label="Schemes matched" />
          <div className="rounded-2xl border border-[#E15A15]/25 bg-[#5C0301]/30 p-4">
            <p className="text-[10px] uppercase text-[#635E5C]">
              Eligibility confidence
            </p>
            <p className="mt-1 text-xl font-bold text-[#E15A15]">High</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[10px] uppercase text-[#635E5C]">
              Documents flagged
            </p>
            <p className="mt-1 text-xl font-bold text-[#EAE9DC]">3</p>
          </div>
        </div>
      </div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 left-1/2 h-28 w-[75%] -translate-x-1/2 rounded-full bg-[#DA1702]/20 blur-3xl"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4.5, repeat: Infinity }}
      />
    </div>
  );
}
