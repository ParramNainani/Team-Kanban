"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { PersonaId } from "./LandingInteractionContext";

type Props = {
  id: PersonaId;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onSelect: (id: PersonaId) => void;
};

export function UseCaseChip({
  id,
  label,
  icon: Icon,
  active,
  onSelect,
}: Props) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(id)}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`flex min-w-[140px] flex-1 flex-col items-center gap-2 rounded-2xl border p-4 text-center transition sm:min-w-[160px] ${
        active
          ? "border-[#E15A15]/50 bg-[#DA1702]/15 shadow-[0_0_32px_-12px_rgba(218,23,2,0.4)]"
          : "border-white/10 bg-white/[0.03] hover:border-[#E15A15]/30"
      }`}
    >
      <span
        className={`rounded-xl border p-2 ${
          active
            ? "border-[#E15A15]/40 bg-[#5C0301]/40 text-[#E15A15]"
            : "border-white/10 text-[#A78F62]"
        }`}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span
        className={`text-xs font-semibold sm:text-sm ${
          active ? "text-[#EAE9DC]" : "text-[#635E5C]"
        }`}
      >
        {label}
      </span>
    </motion.button>
  );
}
