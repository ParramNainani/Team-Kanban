"use client";

import { motion } from "framer-motion";

type Props = {
  children: string;
  active?: boolean;
  onClick: () => void;
};

export function PromptChip({ children, active, onClick }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`rounded-full border px-3 py-1.5 text-left text-[11px] font-medium transition sm:text-xs ${
        active
          ? "border-[#FF671F]/60 bg-[#FF671F]/20 text-slate-900 shadow-[0_0_20px_-6px_rgba(255,103,31,0.45)]"
          : "border-slate-300 bg-white text-slate-600 hover:border-[#046A38]/35 hover:text-slate-900"
      }`}
    >
      {children}
    </motion.button>
  );
}
