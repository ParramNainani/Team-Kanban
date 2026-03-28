"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export const primaryCtaClassName =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#DA1702] to-[#E15A15] px-6 py-3 text-sm font-semibold text-[#EAE9DC] shadow-[0_0_36px_-6px_rgba(218,23,2,0.55)] transition hover:from-[#E15A15] hover:to-[#DA1702] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E15A15]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050101]";

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
    "relative inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E15A15]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050101] disabled:pointer-events-none disabled:opacity-40";

  const styles = {
    primary: primaryCtaClassName,
    secondary:
      "border border-[#A78F62]/35 bg-white/[0.04] text-[#EAE9DC] backdrop-blur-sm hover:border-[#E15A15]/45 hover:bg-white/[0.07]",
    ghost: "text-[#EAE9DC]/85 hover:bg-white/[0.05]",
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
