"use client";

import { motion } from "framer-motion";
import { MessageSquareText, Search, Sparkles } from "lucide-react";
import { useLanding } from "./LandingInteractionContext";
import { fadeUp, staggerContainer } from "./variants";

const steps = [
  {
    n: "01",
    title: "Tell us about your situation",
    body: "Share your goals, location, and life stage in everyday language—no form fatigue.",
    icon: MessageSquareText,
  },
  {
    n: "02",
    title: "AI analyzes relevant schemes",
    body: "We map your answers to program rules, published criteria, and typical document asks.",
    icon: Search,
  },
  {
    n: "03",
    title: "Get tailored recommendations",
    body: "See prioritized schemes, eligibility notes, and a checklist so you know what to prepare next.",
    icon: Sparkles,
  },
];

export function HowItWorksSection() {
  const { activeStep, setActiveStep } = useLanding();

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute left-[1.35rem] top-0 hidden h-full w-px bg-gradient-to-b from-[#E15A15]/50 via-[#DA1702]/30 to-transparent md:block lg:left-8"
        aria-hidden
      />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="relative space-y-8"
      >
        {steps.map((s, i) => {
          const Icon = s.icon;
          const active = activeStep === i;
          return (
            <motion.div
              key={s.n}
              variants={fadeUp}
              className="relative flex gap-6 md:gap-10"
            >
              <button
                type="button"
                onClick={() => setActiveStep(i)}
                className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-bold transition md:h-14 md:w-14 ${
                  active
                    ? "border-[#E15A15]/50 bg-[#DA1702]/25 text-[#EAE9DC] shadow-[0_0_24px_-8px_rgba(218,23,2,0.45)]"
                    : "border-white/10 bg-white/[0.04] text-[#A78F62] hover:border-[#E15A15]/35"
                }`}
                aria-pressed={active}
              >
                {s.n}
              </button>
              <motion.div
                onHoverStart={() => setActiveStep(i)}
                className={`flex-1 rounded-3xl border p-6 backdrop-blur-md transition md:p-8 ${
                  active
                    ? "border-[#E15A15]/35 bg-white/[0.06]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/15"
                }`}
              >
                <div className="flex items-start gap-4">
                  <Icon className="mt-1 h-6 w-6 text-[#E15A15]" aria-hidden />
                  <div>
                    <h3 className="text-xl font-semibold text-[#EAE9DC]">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#635E5C]">
                      {s.body}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
