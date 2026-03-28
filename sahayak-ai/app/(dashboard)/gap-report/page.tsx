import ChatBackground from "@/components/ChatBackground";
import GapGraph from "@/components/GapGraph";

export default function GapReportPage() {
  const totalEligible = 28000;
  const totalReceived = 11200;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050101] text-white">
      <ChatBackground />
      <main className="relative z-10 px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[40px] border border-white/10 bg-slate-950/60 p-8 shadow-[0_60px_140px_rgba(0,0,0,0.45)] backdrop-blur-3xl ring-1 ring-white/10">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Welfare gap report</p>
              <h1 className="text-5xl font-semibold tracking-[-0.03em] text-white">Benefit gap analysis</h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-400">
                Discover the gap between eligible support and what is actually received, with a premium dark interface.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#111418]/80 px-5 py-4 text-right shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Current focus</p>
              <p className="mt-2 text-lg font-semibold text-white">Gap analysis in the same style as the chat UI</p>
            </div>
          </div>

          <GapGraph totalEligible={totalEligible} totalReceived={totalReceived} />
        </div>
      </main>
    </div>
  );
}
