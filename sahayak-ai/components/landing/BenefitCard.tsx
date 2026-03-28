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
      className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-8 backdrop-blur-md transition hover:border-[#E15A15]/25"
    >
      <p className="font-mono text-4xl font-bold tracking-tight text-[#E15A15] sm:text-5xl">
        {stat}
      </p>
      <h3 className="mt-4 text-xl font-semibold text-[#EAE9DC]">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[#635E5C]">{body}</p>
    </motion.div>
  );
}
