"use client";

import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { AssistantPreview } from "./AssistantPreview";
import { GlowButton, primaryCtaClassName } from "./GlowButton";
import { useLanding } from "./LandingInteractionContext";
import { useReducedMotion } from "./useReducedMotion";
import { fadeUp, staggerContainer } from "./variants";

const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => (
    <div
      className="absolute inset-0 z-0 bg-gradient-to-br from-white via-[#f4fdec] to-[#FF671F]/10"
      aria-hidden
    />
  ),
});

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function HeroSection() {
  const { persona } = useLanding();
  const reduced = useReducedMotion();
  const bgParallaxRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (reduced || !bgParallaxRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(bgParallaxRef.current, {
        yPercent: 14,
        ease: "none",
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, bgParallaxRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      id="hero"
      className="relative min-h-[85dvh] overflow-hidden pt-24"
    >
      <div
        ref={bgParallaxRef}
        className="absolute inset-0 bg-transparent flex"
      >
        <div className="absolute top-0 left-0 w-[50%] h-[50%] rounded-full bg-[#FF671F]/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] rounded-full bg-[#046A38]/10 blur-[120px] pointer-events-none" />
      </div>
      <HeroScene />

      <div className="relative z-10 mx-auto flex max-w-[95rem] flex-col items-center justify-between gap-10 px-4 pb-12 lg:flex-row lg:items-center lg:px-8 lg:pb-16">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="w-full max-w-lg shrink-0"
        >
          <motion.p
            variants={fadeUp}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FF671F]/30 bg-[#FF671F]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF671F]"
          >
            Sahayak AI
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="text-4xl font-bold leading-[1.08] tracking-tight text-gray-900 sm:text-5xl lg:text-[3.2rem]"
          >
            Discover government schemes that actually fit{" "}
            <span className="bg-gradient-to-r from-[#FF671F] to-[#046A38] bg-clip-text text-transparent">
              your life
            </span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-6 text-lg leading-relaxed text-gray-700 drop-shadow-sm font-medium"
          >
            Personalized guidance for students, women entrepreneurs, farmers,
            job seekers, startups, senior citizens, and families—so you spend
            minutes finding support, not hours decoding portals.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link href="/chat" className={primaryCtaClassName}>
              Get Started Free
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <GlowButton
              variant="secondary"
              onClick={() => scrollToId("how-it-works")}
              className="gap-2"
            >
              See How It Works
              <ChevronDown className="h-4 w-4" aria-hidden />
            </GlowButton>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}          className="w-full max-w-[500px] shrink-0"        >
          <AssistantPreview persona={persona} />
        </motion.div>
      </div>
    </section>
  );
}
