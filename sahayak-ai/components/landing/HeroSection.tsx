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
      className="absolute inset-0 z-0 bg-gradient-to-br from-[#050101] via-[#120504] to-[#5C0301]/40"
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
      className="relative min-h-[100dvh] overflow-hidden pt-24"
    >
      <div
        ref={bgParallaxRef}
        className="absolute inset-0 bg-gradient-to-br from-[#050101] via-[#120504] to-[#5C0301]/30"
      />
      <HeroScene />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-14 px-4 pb-24 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:pb-32">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-xl"
        >
          <motion.p
            variants={fadeUp}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E15A15]/30 bg-[#DA1702]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#A78F62]"
          >
            Sahayak AI
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="text-4xl font-bold leading-[1.08] tracking-tight text-[#EAE9DC] sm:text-5xl lg:text-[3.2rem]"
          >
            Discover government schemes that actually fit{" "}
            <span className="bg-gradient-to-r from-[#E15A15] via-[#DA1702] to-[#A78F62] bg-clip-text text-transparent">
              your life
            </span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-6 text-lg leading-relaxed text-[#635E5C]"
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
          transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <AssistantPreview persona={persona} />
        </motion.div>
      </div>
    </section>
  );
}
