"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Briefcase,
  Globe2,
  GraduationCap,
  Heart,
  Home,
  Languages,
  Layers,
  MessageCircle,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Tractor,
  Zap,
} from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import { BenefitCard } from "./BenefitCard";
import { CTASection } from "./CTASection";
import { DemoPanel } from "./DemoPanel";
import { FAQAccordion, type FAQItem } from "./FAQAccordion";
import { FeatureCard } from "./FeatureCard";
import { Footer } from "./Footer";
import { HeroSection } from "./HeroSection";
import { HowItWorksSection } from "./HowItWorksSection";
import GapGraph from "@/components/GapGraph";
import {
  LandingProvider,
  useLanding,
  type PersonaId,
} from "./LandingInteractionContext";
import { Navbar } from "./Navbar";
import { SectionHeading } from "./SectionHeading";
import { TestimonialCard } from "./TestimonialCard";
import { UseCaseChip } from "./UseCaseChip";
import { useReducedMotion } from "./useReducedMotion";

const FEATURES = [
  {
    id: "matching",
    title: "Personalized Scheme Matching",
    description:
      "Maps your profile to programs you can realistically qualify for—not a dump of every scheme online.",
    detail:
      "We weigh income bands, geography, category, and education level against published criteria.",
    icon: Search,
  },
  {
    id: "eligibility",
    title: "Eligibility Insights",
    description:
      "Translates dense rules into clear signals: likely, borderline, or needs one more document.",
    detail:
      "You see why a scheme fits before you invest hours in a portal.",
    icon: Shield,
  },
  {
    id: "guidance",
    title: "Instant AI Guidance",
    description:
      "Ask in your language. Sahayak keeps answers short, structured, and actionable.",
    detail:
      "Follow-up prompts help you refine income, location, or occupation in seconds.",
    icon: MessageCircle,
  },
  {
    id: "documents",
    title: "Document Readiness Tips",
    description:
      "Know what to gather first—income proof, domicile, institution letters—before you start.",
    detail:
      "Checklists adapt when you switch schemes or add family members.",
    icon: Layers,
  },
  {
    id: "lang",
    title: "Multilingual Support",
    description:
      "Switch phrasing without losing context—useful for caregivers and community helpers.",
    detail:
      "Core flows stay consistent so you are not re-explaining from scratch.",
    icon: Languages,
  },
  {
    id: "fast",
    title: "Fast Trusted Discovery",
    description:
      "Minutes to a shortlist instead of nights of PDF hunting across departments.",
    detail:
      "We prioritize official sources and flag where states add their own layer.",
    icon: Zap,
  },
] as const;

const USE_CASES: {
  id: PersonaId;
  label: string;
  icon: typeof GraduationCap;
}[] = [
  { id: "student", label: "Students", icon: GraduationCap },
  { id: "women", label: "Women Entrepreneurs", icon: Briefcase },
  { id: "farmer", label: "Farmers", icon: Tractor },
  { id: "job", label: "Job Seekers", icon: Rocket },
  { id: "startup", label: "Startups", icon: Globe2 },
  { id: "senior", label: "Senior Citizens", icon: Heart },
  { id: "rural", label: "Rural Families", icon: Home },
];

const FAQ: FAQItem[] = [
  {
    q: "How does Sahayak AI recommend schemes?",
    a: "We match what you share—age, income band, location, occupation, and goals—to scheme rules published by government sources, then explain the fit in plain language.",
  },
  {
    q: "Is it free to use?",
    a: "You can explore guidance and shortlists without a card. Deeper workflows may unlock with an account as we add saved profiles and reminders.",
  },
  {
    q: "Does it guarantee eligibility?",
    a: "No. Final eligibility is always decided by the issuing authority. We help you prepare accurate applications and highlight risks before you submit.",
  },
  {
    q: "Can it help me prepare documents?",
    a: "Yes. You get ordered checklists and plain descriptions of what each document proves—so you walk into centers or portals prepared.",
  },
  {
    q: "Does it support multiple categories of users?",
    a: "Students, entrepreneurs, farmers, job seekers, startups, seniors, and rural households each get tailored prompts and examples.",
  },
  {
    q: "Can I use it on mobile?",
    a: "The experience is responsive. Complex forms may still be easier on desktop, but discovery and guidance work well on phones.",
  },
];

function PageInner() {
  const reduced = useReducedMotion();
  const { persona, setPersona, activeFeatureId, setActiveFeatureId } =
    useLanding();
  const demoRef = useRef<HTMLElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (reduced) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      // Removing the pin on demoRef to fix the scroll in pasted image 2
      /*
      if (!demoRef.current) return;
      const st = ScrollTrigger.create({
        trigger: demoRef.current,
        start: "top top",
        end: "+=130%",
        pin: true,
        pinSpacing: true,
      });
      return () => st.kill();
      */
    });

    return () => mm.revert();
  }, [reduced]);

  return (
    <div ref={rootRef} className="relative min-h-screen bg-[#FDFCF8] text-gray-900 selection:bg-[#FF671F]/30">
      {/* Background color bands spanning the page scroll */}
      <div className="pointer-events-none absolute inset-0 z-[0] overflow-hidden" aria-hidden>
        {/* Saffron Band */}
        <div className="absolute top-[80vh] left-0 right-0 h-[200vh] bg-gradient-to-b from-transparent via-[#FF671F]/10 to-transparent" />
        {/* Green Band */}
        <div className="absolute bottom-0 left-0 right-0 h-[200vh] bg-gradient-to-t from-[#046A38]/10 via-[#046A38]/5 to-transparent" />
      </div>

      <Navbar />
      <main className="relative z-10">
        <HeroSection />

        <section
          id="use-cases"
          className="py-12"
        >
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <SectionHeading
              align="center"
              eyebrow="Who we help"
              title="Pick a path—preview updates instantly"
              subtitle="Tap a profile to reshape the assistant preview with schemes and language tuned to that journey."
            />
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {USE_CASES.map((u) => (
                <UseCaseChip
                  key={u.id}
                  id={u.id}
                  label={u.label}
                  icon={u.icon}
                  active={persona === u.id}
                  onSelect={setPersona}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-28 py-12 lg:py-12">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <SectionHeading
              eyebrow="Features"
              title="Built for clarity under pressure"
              subtitle="Every surface is designed to reduce cognitive load while you navigate real bureaucracy."
            />
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <FeatureCard
                  key={f.id}
                  id={f.id}
                  title={f.title}
                  description={f.description}
                  detail={f.detail}
                  icon={f.icon}
                  active={activeFeatureId === f.id}
                  onSelect={(id) =>
                    setActiveFeatureId(activeFeatureId === id ? null : id)
                  }
                />
              ))}
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-28 py-12 lg:py-12"
        >
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <SectionHeading
              eyebrow="How it works"
              title="From story to shortlist in three moves"
            />
            <div className="mt-10 max-w-3xl">
              <HowItWorksSection />
            </div>
          </div>
        </section>

        <section
          ref={demoRef}
          id="demo"
          className="scroll-mt-28 py-24  lg:py-32"
        >
          <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-2 lg:items-start lg:gap-16 lg:px-8">
            <div className="lg:sticky lg:top-28">
              <SectionHeading
                eyebrow="Assistant demo"
                title="The same intelligence powers discovery and paperwork"
                subtitle="Tabs mirror how teams actually work: discover options, validate eligibility, quantify benefits, then line up documents."
              />
              <ul className="mt-8 space-y-3 text-sm text-[#635E5C]">
                <li className="flex gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#E15A15]" />
                  Streaming answers with pinned sources for reviewers.
                </li>
                <li className="flex gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#E15A15]" />
                  Metrics update as you switch tabs—no page reload theatrics.
                </li>
              </ul>
            </div>
            <DemoPanel />
          </div>
        </section>

        <section id="gap-visualization" className="scroll-mt-28 py-14 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="rounded-[40px] border border-slate-200/20 bg-white/95 p-8 shadow-[0_40px_120px_rgba(15,23,42,0.12)]">
              <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-[#BF5700]">Benefit gap preview</p>
                  <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">See the gap at a glance</h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                    A quick chart view of received benefits versus total eligible support for a clearer decision.
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 px-5 py-4 text-right text-sm text-slate-600 ring-1 ring-slate-200/70">
                  <p className="font-semibold uppercase tracking-[0.3em] text-slate-400">Insight panel</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">Connected to the main launch experience</p>
                </div>
              </div>
              <GapGraph totalEligible={28000} totalReceived={11200} theme="light" />
            </div>
          </div>
        </section>

        <section id="benefits" className="scroll-mt-28 py-12 lg:py-12">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <SectionHeading
              align="center"
              eyebrow="Benefits"
              title="Why citizens stay after the first query"
            />
            <div className="mt-10 grid gap-8 lg:grid-cols-3">
              <BenefitCard
                stat="Minutes"
                title="Faster access to relevant schemes"
                body="Skip the endless PDF loop. Sahayak compresses discovery into a prioritized shortlist you can discuss with family or advisors."
              />
              <BenefitCard
                stat="Clear"
                title="Less confusion, more clarity"
                body="Eligibility is translated into signals you can act on—what to fix, what to upload, and what to verify on the official portal."
              />
              <BenefitCard
                stat="Personal"
                title="Discovery for real-life situations"
                body="Students, caregivers, founders, and farmers each get phrasing and examples that mirror how people actually describe their lives."
              />
            </div>
          </div>
        </section>

        <section
          id="testimonials"
          className="scroll-mt-28 border-t border-slate-200 py-12 lg:py-12"
        >
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <SectionHeading
              align="center"
              eyebrow="Testimonials"
              title="Trusted when the stakes are personal"
            />
            <div className="mt-10 grid gap-8 lg:grid-cols-3">
              <TestimonialCard
                initials="AP"
                name="Ananya P."
                role="Undergraduate student, Patna"
                quote="I stopped guessing scholarship portals. Sahayak narrowed three programs I could actually apply for and listed certificates in order."
              />
              <TestimonialCard
                initials="RK"
                name="Rakesh K."
                role="Wheat farmer, Punjab"
                quote="Credit and insurance names used to blur together. Now I ask in Punjabi, get the scheme names, and know what land papers to carry."
              />
              <TestimonialCard
                initials="SJ"
                name="Sana J."
                role="Boutique owner, Hyderabad"
                quote="Women entrepreneur schemes finally made sense—what counts as turnover, which bank windows accept our paperwork, and what to expect next."
              />
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-28 py-12 lg:py-12">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <SectionHeading
              align="center"
              eyebrow="FAQ"
              title="Straight answers before you commit time"
            />
            <div className="mt-10">
              <FAQAccordion items={FAQ} />
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

export function LandingPage() {
  return (
    <LandingProvider>
      <PageInner />
    </LandingProvider>
  );
}
