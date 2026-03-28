"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, FileText, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { PersonaId } from "./LandingInteractionContext";
import { PromptChip } from "./PromptChip";

const PROMPTS: { id: string; label: string; query: string }[] = [
  {
    id: "scholarship",
    label: "Scholarship help",
    query: "I'm a college student from Bihar looking for scholarship support.",
  },
  {
    id: "farmer",
    label: "Farm credit & subsidies",
    query: "I cultivate wheat in Punjab—what credit or subsidy schemes apply?",
  },
  {
    id: "startup",
    label: "Startup funding",
    query: "We're a DPIIT-registered startup hiring in tier-2 cities.",
  },
];

const PERSONA_COPY: Record<
  PersonaId,
  { scheme: string; benefit: string; doc: string; badge: string }
> = {
  student: {
    scheme: "National Scholarship Portal — merit-linked awards",
    benefit: "Up to ₹50,000/year for eligible income brackets",
    doc: "Income certificate, institution ID, bank details",
    badge: "Education",
  },
  women: {
    scheme: "Women entrepreneur credit & stand-up initiatives",
    benefit: "Concessional rates and fee waivers where states align",
    doc: "Business registration, project note, identity proof",
    badge: "Women-led",
  },
  farmer: {
    scheme: "PM-KISAN & allied crop insurance windows",
    benefit: "Direct support and risk cover tied to land records",
    doc: "Land records, bank DBT, cultivator declaration",
    badge: "Agriculture",
  },
  job: {
    scheme: "Skill missions & placement-linked stipends",
    benefit: "Training-to-job pathways with stipend where applicable",
    doc: "ID proof, education records, category certificate if needed",
    badge: "Employment",
  },
  startup: {
    scheme: "Startup India fund & state innovation credits",
    benefit: "Tax relief windows and curated lender intros",
    doc: "Incorporation, DPIIT recognition, cap table summary",
    badge: "Innovation",
  },
  senior: {
    scheme: "Pension & social security top-ups",
    benefit: "Higher floor payouts where state schemes stack",
    doc: "Age proof, residence, bank mandate",
    badge: "Seniors",
  },
  rural: {
    scheme: "Rural housing & livelihood missions",
    benefit: "Asset creation grants with panchayat-aligned checks",
    doc: "Domicile, household survey refs, occupation proof",
    badge: "Rural",
  },
};

type Props = {
  persona: PersonaId;
};

export function AssistantPreview({ persona }: Props) {
  const [activePrompt, setActivePrompt] = useState(PROMPTS[0].id);
  const active = PROMPTS.find((p) => p.id === activePrompt) ?? PROMPTS[0];
  const p = useMemo(() => PERSONA_COPY[persona], [persona]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
      <div className="mb-4 flex flex-wrap gap-2">
        {PROMPTS.map((chip) => (
          <PromptChip
            key={chip.id}
            active={activePrompt === chip.id}
            onClick={() => setActivePrompt(chip.id)}
          >
            {chip.label}
          </PromptChip>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${activePrompt}-${persona}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#A78F62]">
              You
            </p>
            <p className="mt-1 text-sm text-[#EAE9DC]/90">{active.query}</p>
          </div>

          <div className="rounded-2xl border border-[#E15A15]/30 bg-[#DA1702]/10 p-4">
            <div className="flex items-center gap-2 text-[#E15A15]">
              <Sparkles className="h-4 w-4" aria-hidden />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Sahayak AI
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[#EAE9DC]/85">
              Based on your profile, start with{" "}
              <span className="font-semibold text-[#EAE9DC]">{p.scheme}</span>.
              We&apos;ll verify income or land context next so eligibility is
              clearer before you apply.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[10px] text-[#635E5C]">Schemes matched</p>
              <p className="mt-1 text-lg font-semibold text-[#EAE9DC]">3</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[10px] text-[#635E5C]">Confidence</p>
              <p className="mt-1 text-lg font-semibold text-[#E15A15]">High</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[10px] text-[#635E5C]">Documents</p>
              <p className="mt-1 text-lg font-semibold text-[#EAE9DC]">4</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#A78F62]/25 bg-black/30 p-4">
            <div className="flex items-start gap-3">
              <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#E15A15]" />
              <div>
                <p className="text-xs font-semibold text-[#EAE9DC]">
                  {p.scheme}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#635E5C]">
                  {p.benefit}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#E15A15]/30 bg-[#DA1702]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#EAE9DC]">
                    {p.badge}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-[#635E5C]">
                    <FileText className="h-3 w-3" aria-hidden />
                    {p.doc}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 left-1/2 h-24 w-[70%] -translate-x-1/2 rounded-full bg-[#DA1702]/25 blur-3xl"
        animate={{ opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
