"use client";

import { motion } from "framer-motion";
import { fadeUp } from "./variants";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: Props) {
  const alignCls = align === "center" ? "mx-auto text-center" : "";

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={`max-w-3xl ${alignCls}`}
    >
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#A78F62]">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-[#EAE9DC] sm:text-4xl lg:text-[2.6rem] lg:leading-[1.1]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-[#635E5C] sm:text-lg">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
