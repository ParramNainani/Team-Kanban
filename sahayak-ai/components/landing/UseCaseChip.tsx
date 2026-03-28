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
          ? "border-[#FF671F]/40 bg-[#FFF5EF] shadow-lg shadow-[#FF671F]/10 scale-100"
          : "border-[#D9CABE] bg-white/40 hover:bg-white/70 hover:border-[#C7B5A3]"
      }`}
    >
      <span
        className={`rounded-2xl border p-3 transition-colors ${
          active
            ? "border-[#FF671F]/30 bg-white text-[#FF671F] shadow-sm"
            : "border-[#D9CABE]/50 bg-white/50 text-[#8F857D]"
        }`}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span
        className={`text-xs font-semibold sm:text-sm ${
          active ? "text-[#1F1A17]" : "text-[#6A635D]"
        }`}
      >
        {label}
      </span>
    </motion.button>
  );
}
