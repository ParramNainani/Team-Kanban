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
      className="relative overflow-hidden rounded-3xl border border-[#D9CABE] bg-[#F5F0E6]/80 p-8 shadow-sm backdrop-blur-md transition-shadow hover:shadow-md"
    >
      <div
        className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[#FF671F]/10 blur-3xl"
        aria-hidden
      />
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D9CABE] bg-[#EADAC5] text-sm font-bold text-gray-700">
        {initials}
      </div>
      <blockquote className="text-base leading-relaxed text-gray-800">
        “{quote}”
      </blockquote>
      <figcaption className="mt-6 border-t border-[#D9CABE] pt-6">
        <span className="font-semibold text-gray-900">{name}</span>
        <span className="mt-1 block text-sm text-gray-600">{role}</span>
      </figcaption>
    </motion.figure>
  );
}
