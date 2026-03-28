"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, FileWarning } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { fadeUp } from "./variants";

const stats = [
  { label: "Welfare Schemes Matched", value: "240k+", icon: TrendingUp },
  { label: "Citizens Assisted", value: "1.2M", icon: Users },
  { label: "Support Gap Reports", value: "850k", icon: FileWarning },
];

export function AnalyticsSection() {
  return (
    <section id="analytics" className="relative py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          title="Sahayak Impact & Gap Analytics"
          subtitle="Real-time transparency on the social welfare gaps being bridged through AI."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="bg-[#FDFCF8] border border-slate-200 p-8 rounded-3xl shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                <stat.icon size={120} />
              </div>
              <stat.icon className="text-[#FF671F] mb-4" size={32} />
              <div className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-widest">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-16 bg-[#FDFCF8] border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-8">
            <BarChart3 className="text-[#046A38]" />
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Support Gap Generation</h3>
          </div>
          
          <div className="h-64 sm:h-80 w-full flex items-end justify-between sm:justify-around gap-2 pb-6 border-b border-slate-200 relative pt-10">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-6 w-10 flex-col justify-between text-xs text-slate-400 font-mono hidden sm:flex">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
            
            {/* Grid lines */}
            <div className="absolute left-10 right-0 top-0 bottom-6 flex-col justify-between pointer-events-none hidden sm:flex">
              <div className="w-full h-px border-t border-dashed border-slate-200" />
              <div className="w-full h-px border-t border-dashed border-slate-200" />
              <div className="w-full h-px border-t border-dashed border-slate-200" />
              <div className="w-full h-px border-t border-dashed border-slate-200" />
              <div className="w-full h-px border-t border-dashed border-slate-200" />
            </div>

            {/* Bars */}
            {[
              { month: "Jan", filled: 30, gap: 70 },
              { month: "Feb", filled: 45, gap: 55 },
              { month: "Mar", filled: 65, gap: 35 },
              { month: "Apr", filled: 75, gap: 25 },
              { month: "May", filled: 88, gap: 12 },
              { month: "Jun", filled: 94, gap: 6 },
            ].map((data, idx) => (
              <div key={idx} className="relative flex flex-col justify-end w-full max-w-[40px] sm:max-w-[60px] h-full group z-10 sm:ml-10">
                {/* Gap Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: `${data.gap}%` }}
                  transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                  className="w-full bg-[#FF671F]/10 border-t border-x border-[#FF671F]/30 rounded-t-lg backdrop-blur-sm relative"
                  title={`Gap generation: ${data.gap}%`}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono text-[#FF671F] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Gap: {data.gap}%
                  </div>
                </motion.div>
                {/* Filled/Bridged Bar */}
                 <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: `${data.filled}%` }}
                  transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                  className="w-full bg-[#046A38] rounded-t-md shadow-lg relative"
                  title={`Gaps Bridged: ${data.filled}%`}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono text-[#046A38] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Bridged: {data.filled}%
                  </div>
                </motion.div>
                {/* Label */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-medium text-slate-500">
                  {data.month}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#046A38]" />
              <span>Gaps Bridged Successfully</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#FF671F]/20 border border-[#FF671F]/30" />
              <span>Support Gap Generated (Unclaimed)</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}