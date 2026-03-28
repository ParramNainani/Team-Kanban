"use client";

import Link from "next/link";
import Image from "next/image";

const cols = [
  {
    title: "Product",
    links: [
      { href: "#features", label: "Features" },
      { href: "#how-it-works", label: "How it works" },
      { href: "/chat", label: "Assistant" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "#faq", label: "FAQ" },
      { href: "#testimonials", label: "Stories" },
      { href: "#benefits", label: "Benefits" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "#", label: "Privacy" },
      { href: "#", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[#D9CABE] bg-[#E3D4C0]/80 py-10 backdrop-blur-md">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl overflow-hidden shadow-sm">
              <Image src="/logo.png" alt="Sahayak Logo" width={56} height={56} className="h-full w-full object-cover" />
            </span>
            <span className="text-xl font-bold text-slate-900">Sahayak AI</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
            Citizen-first guidance for government schemes—clear eligibility,
            fewer dead ends, and next steps you can use today.
          </p>
          <p className="mt-6 text-xs text-slate-500/80">
            Contact:{" "}
            <a href="mailto:hello@sahayak.ai" className="text-[#FF671F] hover:underline">
              hello@sahayak.ai
            </a>
          </p>
          <div className="mt-4 flex gap-4 text-sm">
            <a
              href="https://twitter.com"
              className="text-slate-500 hover:text-slate-900"
              rel="noreferrer"
            >
              X
            </a>
            <a
              href="https://linkedin.com"
              className="text-slate-500 hover:text-slate-900"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              {c.title}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l.label}>
                  {l.href.startsWith("/") ? (
                    <Link
                      href={l.href}
                      className="text-slate-500 hover:text-slate-900"
                    >
                      {l.label}
                    </Link>
                  ) : (
                    <a
                      href={l.href}
                      className="text-slate-500 hover:text-slate-900"
                    >
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Company
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-500">
            <li>
              <span className="cursor-default">About</span>
            </li>
            <li>
              <span className="cursor-default">Careers</span>
            </li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-7xl px-4 text-center text-xs text-slate-500/60 lg:px-8">
        © {new Date().getFullYear()} Sahayak AI. Verify scheme details on official
        government portals before you apply.
      </p>
    </footer>
  );
}
