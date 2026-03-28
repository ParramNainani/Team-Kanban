"use client";

import { motion } from "framer-motion";
import { fadeUp } from "./variants";

type Props = {
  stat: string;
  title: string;
  body: string;
};

export function BenefitCard({ stat, title, body }: Props) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="rounded-3xl border border-slate-200 bg-white p-8 transition hover:border-[#FF671F]/30 shadow-sm hover:shadow-md"
    >
      <p className="font-mono text-4xl font-bold tracking-tight text-[#FF671F] sm:text-5xl">
        {stat}
      </p>
      <h3 className="mt-4 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{body}</p>
    </motion.div>
  );
}
