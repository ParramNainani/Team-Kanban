import type { Metadata } from "next";
import "./globals.css";
import CursorEffect from "@/components/CursorEffect";
import { AuthProvider } from "@/components/AuthProvider";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export const metadata: Metadata = {
  title: "Sahayak AI — Discover government schemes that fit your situation",    
  description:
    "Personalized AI guidance to find relevant government schemes, eligibility signals, and document readiness.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-[#050101] text-[#EAE9DC]">
        <AuthProvider>
          <CursorEffect />
          {children}
          <FloatingWhatsApp />
        </AuthProvider>
      </body>
    </html>
  );
}



