"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GlowButton, primaryCtaClassName } from "./GlowButton";
import { scrollToSection } from "./Navbar";

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#DA1702]/30 via-[#5C0301]/20 to-transparent"
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-4xl rounded-3xl border border-[#E15A15]/30 bg-[#120504]/90 px-6 py-16 text-center shadow-[0_0_80px_-24px_rgba(218,23,2,0.5)] backdrop-blur-xl sm:px-12"
      >
        <h2 className="text-3xl font-bold tracking-tight text-[#EAE9DC] sm:text-4xl">
          Discover the support you may be missing
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[#635E5C]">
          Move from guesswork to a shortlist of programs that match your story—then
          walk into applications with documents and confidence.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/chat" className={primaryCtaClassName}>
            Start with Sahayak AI
          </Link>
          <GlowButton
            variant="secondary"
            onClick={() => scrollToSection("demo")}
          >
            Preview the assistant
          </GlowButton>
        </div>
      </motion.div>
    </section>
  );
}
