"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cardHover, fadeUp } from "./variants";

type Props = {
  id: string;
  title: string;
  description: string;
  detail: string;
  icon: LucideIcon;
  active: boolean;
  onSelect: (id: string) => void;
};

export function FeatureCard({
  id,
  title,
  description,
  detail,
  icon: Icon,
  active,
  onSelect,
}: Props) {
  return (
    <motion.article
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      whileHover={cardHover}
      className={`cursor-pointer rounded-[2rem] border p-7 backdrop-blur-xl transition-all duration-300 ${
        active
          ? "border-[#FF671F]/30 bg-[#FFF5EF]/90 shadow-xl shadow-[#FF671F]/5 scale-[1.02]"
          : "border-[#D9CABE] bg-white/40 hover:bg-white/70 hover:border-[#C7B5A3] hover:shadow-lg hover:shadow-black/5"
      }`}
      onClick={() => onSelect(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(id);
        }
      }}
    >
      <div className={`mb-5 inline-flex rounded-2xl border p-3.5 transition-colors ${
        active 
          ? "border-[#FF671F]/30 bg-white text-[#FF671F] shadow-sm" 
          : "border-[#D9CABE]/50 bg-white/50 text-[#8F857D]"
      }`}>
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold text-[#1F1A17]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#6A635D]">{description}</p>
      {active && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 border-t border-slate-200 pt-4 text-sm text-[#6A635D]"
        >
          {detail}
        </motion.p>
      )}
    </motion.article>
  );
}
