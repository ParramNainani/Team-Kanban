"use client";

import { motion } from "framer-motion";
import { fadeUp } from "./variants";

type Props = {
  quote: string;
  name: string;
  role: string;
  initials: string;
};

export function TestimonialCard({ quote, name, role, initials }: Props) {
  return (
    <motion.figure
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md"
    >
      <div
        className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[#DA1702]/15 blur-3xl"
        aria-hidden
      />
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#A78F62]/30 bg-[#5C0301]/40 text-sm font-bold text-[#A78F62]">
        {initials}
      </div>
      <blockquote className="text-base leading-relaxed text-[#EAE9DC]/90">
        “{quote}”
      </blockquote>
      <figcaption className="mt-6 border-t border-white/10 pt-6">
        <span className="font-semibold text-[#EAE9DC]">{name}</span>
        <span className="mt-1 block text-sm text-[#635E5C]">{role}</span>
      </figcaption>
    </motion.figure>
  );
}
