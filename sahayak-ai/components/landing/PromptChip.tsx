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
          ? "border-[#E15A15]/60 bg-[#DA1702]/20 text-[#EAE9DC] shadow-[0_0_20px_-6px_rgba(218,23,2,0.45)]"
          : "border-white/10 bg-white/[0.04] text-[#635E5C] hover:border-[#E15A15]/35 hover:text-[#EAE9DC]/90"
      }`}
    >
      {children}
    </motion.button>
  );
}
