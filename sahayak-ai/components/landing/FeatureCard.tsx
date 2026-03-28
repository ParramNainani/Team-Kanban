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
      className={`cursor-pointer rounded-3xl border p-6 backdrop-blur-md transition-shadow ${
        active
          ? "border-[#E15A15]/45 bg-[#DA1702]/10 shadow-[0_0_40px_-14px_rgba(218,23,2,0.35)]"
          : "border-white/10 bg-white/[0.04] hover:border-[#E15A15]/25"
      }`}
      onClick={() => onSelect(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(id);
        }
      }}
    >
      <div className="mb-4 inline-flex rounded-2xl border border-[#E15A15]/25 bg-[#5C0301]/30 p-3 text-[#E15A15]">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold text-[#EAE9DC]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#635E5C]">{description}</p>
      {active && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 border-t border-white/10 pt-4 text-sm text-[#EAE9DC]/80"
        >
          {detail}
        </motion.p>
      )}
    </motion.article>
  );
}
