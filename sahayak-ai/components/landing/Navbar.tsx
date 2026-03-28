"use client";

import gsap from "gsap";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { GlowButton, primaryCtaClassName } from "./GlowButton";
import { MobileMenu } from "./MobileMenu";
import { fadeUp } from "./variants";
import { useReducedMotion } from "./useReducedMotion";
import { useAuth } from "@/components/AuthProvider";

const NAV = [
  { id: "features", label: "Features" },
  { id: "how-it-works", label: "How It Works" },
  { id: "benefits", label: "Benefits" },
  { id: "testimonials", label: "Testimonials" },
  { id: "faq", label: "FAQ" },
] as const;

const SPY_IDS = [
  "hero",
  "features",
  "how-it-works",
  "benefits",
  "demo",
  "testimonials",
  "faq",
] as const;

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function Navbar() {
  const reduced = useReducedMotion();
  const navRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState<string>("hero");
  const { user, signInWithGoogle, signOut } = useAuth();

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav || reduced) return;

    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const down = y > lastY;
      if (y > 80 && down) {
        gsap.to(nav, {
          y: -nav.offsetHeight,
          duration: 0.35,
          ease: "power2.out",
          overwrite: true,
        });
      } else {
        gsap.to(nav, { y: 0, duration: 0.35, ease: "power2.out", overwrite: true });
      }
      lastY = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit?.target?.id) setActive(hit.target.id);
      },
      { rootMargin: "-38% 0px -38% 0px", threshold: [0, 0.1, 0.25, 0.5] }
    );

    SPY_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });

    return () => obs.disconnect();
  }, []);

  return (
    <>
      <motion.header
        ref={navRef}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="navbar-fixed fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl"
        style={{ willChange: "transform" }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-900"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("hero");
            }}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-xl overflow-hidden shadow-sm">
              <img src="/logo.png" alt="Sahayak Logo" className="h-full w-full object-cover" />
            </span>
            <span className="text-xl font-bold tracking-tight">Sahayak AI</span>
          </Link>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Primary navigation"
          >
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.id);
                }}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active === item.id
                    ? "text-[#FF671F]"
                    : "text-[#635E5C] hover:text-slate-900"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <GlowButton
              variant="ghost"
              className="!px-3"
              onClick={() => scrollToSection("demo")}
            >
              Try Assistant
            </GlowButton>
            {user ? (
              <>
                <Link href="/chat" className={primaryCtaClassName}>
                  Go to Chat
                </Link>
                <button onClick={signOut} className="rounded-lg px-3 py-2 text-sm font-medium text-[#635E5C] hover:text-slate-900 transition">
                  Sign Out
                </button>
              </>
            ) : (
              <button onClick={signInWithGoogle} className={primaryCtaClassName}>
                Sign In / Sign Up
              </button>
            )}
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-slate-900 lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </button>
        </div>
      </motion.header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onNavigate={scrollToSection}
      />
    </>
  );
}

