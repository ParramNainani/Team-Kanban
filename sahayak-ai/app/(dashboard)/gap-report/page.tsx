"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, Loader2 } from "lucide-react";
import ChatBackground from "@/components/ChatBackground";
import GapGraph from "@/components/GapGraph";
import type { ScoredScheme, UserProfile } from "@/types";

export default function GapReportPage() {
  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState<ScoredScheme[]>([]);
  const [totalBenefit, setTotalBenefit] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGapData() {
      try {
        // Try to load the last saved profile from sessionStorage
        const savedProfile = sessionStorage.getItem("sahayak_profile");
        let userProfile: UserProfile;

        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          userProfile = {
            age: parsed.age ?? 30,
            gender: parsed.gender ?? "male",
            occupation: parsed.occupation ?? "any",
            income: parsed.income ?? 300000,
            category: parsed.category ?? "All",
            state: parsed.state ?? "All",
            maritalStatus: parsed.maritalStatus ?? "any",
            landOwnership: parsed.landOwnership ?? false,
          };
          setProfile(parsed);
        } else {
          // Default demo profile if no chat has been completed yet
          userProfile = {
            age: 30,
            gender: "male",
            occupation: "farmer",
            income: 200000,
            category: "All",
            state: "All",
            maritalStatus: "married",
            landOwnership: true,
          };
          setProfile(userProfile);
        }

        const res = await fetch("/api/gap-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userProfile),
        });

        if (!res.ok) throw new Error("Failed to fetch gap report");

        const data = await res.json();
        setSchemes(data.schemes || []);
        setTotalBenefit(data.totalBenefit || 0);
      } catch (err) {
        console.error("Gap report error:", err);
        setError("Failed to load gap analysis. Please try chatting with Sahayak first.");
      } finally {
        setLoading(false);
      }
    }

    loadGapData();
  }, []);

  // Calculate realistic gap data from matched schemes
  const totalEligible = totalBenefit;
  // Estimate: user is currently receiving ~40% of what they're eligible for
  const totalReceived = Math.round(totalEligible * 0.4);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050101] text-white">
      <ChatBackground />
      <main className="relative z-10 px-4 py-10 sm:px-6 lg:px-10">
        {/* Back button */}
        <div className="mx-auto max-w-6xl mb-6">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#E15A15] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Chat
          </Link>
        </div>

        <div className="mx-auto max-w-6xl overflow-hidden rounded-[40px] border border-white/10 bg-slate-950/60 p-8 shadow-[0_60px_140px_rgba(0,0,0,0.45)] backdrop-blur-3xl ring-1 ring-white/10">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.35em] text-amber-300 flex items-center gap-2">
                <BarChart3 size={16} />
                Welfare gap report
              </p>
              <h1 className="text-5xl font-semibold tracking-[-0.03em] text-white">Benefit gap analysis</h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-400">
                Discover the gap between government support you&apos;re eligible for and what you may currently be receiving.
                {profile && !sessionStorage.getItem("sahayak_profile") && (
                  <span className="block mt-2 text-amber-300/70">
                    Showing results for a demo profile. Chat with Sahayak to see your personalized report.
                  </span>
                )}
              </p>
            </div>
            {profile && (
              <div className="rounded-3xl border border-white/10 bg-[#111418]/80 px-5 py-4 text-right shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Your profile</p>
                <div className="mt-2 space-y-1 text-sm text-gray-300">
                  {profile.occupation && <p className="capitalize">{profile.occupation}</p>}
                  {profile.age && <p>Age {profile.age}</p>}
                  {profile.state && profile.state !== "All" && <p>{profile.state}</p>}
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[#E15A15]" />
              <span className="ml-3 text-gray-400">Analyzing welfare gap...</span>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
              <p className="text-gray-400">{error}</p>
              <Link href="/chat" className="mt-4 inline-block text-[#E15A15] hover:text-[#DA1702] transition-colors">
                Go to Chat →
              </Link>
            </div>
          ) : (
            <>
              <GapGraph totalEligible={totalEligible} totalReceived={totalReceived} />

              {/* Scheme breakdown */}
              {schemes.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-lg font-semibold text-gray-200 mb-4">
                    Matched Schemes ({schemes.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {schemes.map((s, idx) => (
                      <div key={`gap-${s.id}-${idx}`} className="rounded-xl border border-[#333]/50 bg-[#151515]/90 p-5 hover:border-[#E15A15]/40 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-sm font-semibold text-[#A78F62]">{s.name}</h3>
                          <span className="text-[#E15A15] font-bold text-sm">
                            ₹{s.estimatedBenefit.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">{s.benefits}</p>
                        {s.links && s.links.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {s.links.map((link, lidx) => (
                              <a key={lidx} href={link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300 underline bg-blue-500/10 px-1.5 py-0.5 rounded">
                                Apply →
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
