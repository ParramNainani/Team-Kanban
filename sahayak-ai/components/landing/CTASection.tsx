"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GlowButton, primaryCtaClassName } from "./GlowButton";
import { scrollToSection } from "./Navbar";

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-12 lg:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#FF671F]/10 via-[#046A38]/5 to-transparent"
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-4xl rounded-3xl border border-[#FF671F]/20 bg-[#EFE9DF]/90 px-6 py-12 text-center shadow-xl backdrop-blur-xl sm:px-12"
      >
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Discover the support you may be missing
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-gray-700">
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
