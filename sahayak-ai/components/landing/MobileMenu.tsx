"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";
import { GlowButton, primaryCtaClassName } from "./GlowButton";

const LINKS: { href: string; label: string }[] = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#benefits", label: "Benefits" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#faq", label: "FAQ" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onNavigate: (href: string) => void;
};

export function MobileMenu({ open, onClose, onNavigate }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.nav
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed right-0 top-0 z-[70] flex h-full w-[min(100%,20rem)] flex-col border-l border-white/10 bg-[#120504] p-6 shadow-2xl lg:hidden"
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="font-bold text-[#EAE9DC]">Menu</span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-[#A78F62] hover:bg-white/5"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="flex flex-col gap-1">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="block rounded-xl px-3 py-3 text-[#EAE9DC]/90 hover:bg-white/5"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(l.href);
                      onClose();
                    }}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-col gap-3 border-t border-white/10 pt-6">
              <GlowButton
                variant="secondary"
                className="w-full"
                onClick={() => {
                  onNavigate("#demo");
                  onClose();
                }}
              >
                Try Assistant
              </GlowButton>
              <Link
                href="/chat"
                className={`${primaryCtaClassName} w-full text-center`}
                onClick={onClose}
              >
                Try Chat Now
              </Link>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}

