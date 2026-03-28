"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export const primaryCtaClassName =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF671F] to-[#E15A15] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_36px_-6px_rgba(255,103,31,0.55)] transition hover:from-[#E15A15] hover:to-[#FF671F] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E15A15]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

type Props = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
};

export function GlowButton({
  children,
  variant = "primary",
  className = "",
  type = "button",
  disabled,
  onClick,
}: Props) {
  const base =
    "relative inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF671F]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-40";

  const styles = {
    primary: primaryCtaClassName,
    secondary:
      "border border-[#046A38]/30 bg-white/50 text-slate-900 backdrop-blur-sm hover:border-[#046A38]/60 hover:bg-slate-50",
    ghost: "text-slate-700 hover:bg-slate-100",
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
