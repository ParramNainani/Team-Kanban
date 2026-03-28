"use client";

import Link from "next/link";

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
    <footer className="border-t border-white/10 bg-[#050101]/90 py-16 backdrop-blur-md">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E15A15]/40 bg-[#DA1702]/20 text-sm font-bold text-[#EAE9DC]">
              S
            </span>
            <span className="text-lg font-bold text-[#EAE9DC]">Sahayak AI</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#635E5C]">
            Citizen-first guidance for government schemes—clear eligibility,
            fewer dead ends, and next steps you can use today.
          </p>
          <p className="mt-6 text-xs text-[#635E5C]/80">
            Contact:{" "}
            <a href="mailto:hello@sahayak.ai" className="text-[#A78F62] hover:underline">
              hello@sahayak.ai
            </a>
          </p>
          <div className="mt-4 flex gap-4 text-sm">
            <a
              href="https://twitter.com"
              className="text-[#635E5C] hover:text-[#EAE9DC]"
              rel="noreferrer"
            >
              X
            </a>
            <a
              href="https://linkedin.com"
              className="text-[#635E5C] hover:text-[#EAE9DC]"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#635E5C]">
              {c.title}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l.label}>
                  {l.href.startsWith("/") ? (
                    <Link
                      href={l.href}
                      className="text-[#635E5C] hover:text-[#EAE9DC]"
                    >
                      {l.label}
                    </Link>
                  ) : (
                    <a
                      href={l.href}
                      className="text-[#635E5C] hover:text-[#EAE9DC]"
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
          <p className="text-xs font-semibold uppercase tracking-widest text-[#635E5C]">
            Company
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[#635E5C]">
            <li>
              <span className="cursor-default">About</span>
            </li>
            <li>
              <span className="cursor-default">Careers</span>
            </li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-7xl px-4 text-center text-xs text-[#635E5C]/60 lg:px-8">
        © {new Date().getFullYear()} Sahayak AI. Verify scheme details on official
        government portals before you apply.
      </p>
    </footer>
  );
}
