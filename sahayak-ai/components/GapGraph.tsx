
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export type GapGraphProps = {
  totalEligible: number;
  totalReceived: number;
  unit?: "currency" | "people" | "schemes";
};

function formatValue(value: number, unit: "currency" | "people" | "schemes" = "currency") {
  const numValue = value ?? 0;
  if (unit === "people" || unit === "schemes") {
    return `${numValue.toLocaleString("en-IN")}`;
  }
  return `₹${numValue.toLocaleString("en-IN")}`;
}

export default function GapGraph({ totalEligible, totalReceived, unit = "currency" }: GapGraphProps) {
  const formatCurrency = (val: number) => formatValue(val, unit);

  // Edge case: no eligible data
  if (typeof totalEligible !== "number" || totalEligible <= 0) {
    return (
      <div className="rounded-2xl border border-[#333]/50 bg-[#151515]/90 p-6 text-center text-gray-400 shadow-md backdrop-blur">
        <span className="text-sm">No eligible benefit data available.</span>
      </div>
    );
  }

  const receivedPercent = totalEligible > 0 ? Math.round((totalReceived / totalEligible) * 100) : 0;
  const missingPercent = 100 - receivedPercent;

  const missing = Math.max(totalEligible - totalReceived, 0);
  const barData = [
    { name: "Received", value: totalReceived },
    { name: "Eligible", value: totalEligible },
  ];
  const accent = "#E15A15";
  const grayTick = "#888888";
  const secondary = "#2f2f35";
  const pieData = [
    { name: "Receiving", value: Math.min(totalReceived, totalEligible), color: accent },
    { name: "Missing", value: missing, color: secondary },
  ];

  // Custom center label for donut
  function DonutCenter() {
    return (
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none",
        }}
        className="select-none"
      >
        <div className="text-xs font-semibold text-[#A78F62] tracking-wider uppercase">Gap</div>
        <div className="text-lg font-bold text-[#E15A15] leading-tight">{formatCurrency(missing)}</div>
      </div>
    );
  }

  // Custom legend for donut
  function DonutLegend() {
    return (
      <div className="flex flex-col gap-2 w-full mt-4">
        {pieData.map((entry, idx) => (
          <div key={entry.name} className="flex items-center gap-3 justify-between bg-[#18181b]/60 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: entry.color }}></span>
              <span className="text-gray-200 text-sm font-medium truncate">{entry.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-300 text-sm font-semibold">{formatCurrency(entry.value)}</span>
              <span className="text-gray-400 text-xs font-medium">{idx === 0 ? receivedPercent : missingPercent}%</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Custom tooltip for donut
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function CustomPieTooltip({ active, payload }: any) {
    if (!active || !payload || !payload.length) return null;
    const entry = payload[0].payload;
    const percent = entry.name === "Receiving" ? receivedPercent : missingPercent;
    return (
      <div className="rounded-xl border border-[#333]/60 bg-[#18181b] px-4 py-2 text-gray-200 shadow-lg text-xs">
        <div className="font-semibold text-[#A78F62] mb-1">{entry.name}</div>
        <div className="flex items-center gap-2">
          <span className="text-gray-200">{formatCurrency(entry.value)}</span>
          <span className="text-gray-400">({percent}%)</span>
        </div>
      </div>
    );
  }

  // Custom tooltip for bar chart with explicit high-contrast colors
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="!bg-[#111111] border border-[#E15A15]/60 rounded-xl px-4 py-3 shadow-[0_0_18px_rgba(225,90,21,0.18)]">
        <p className="!text-[#FF8A3D] font-bold text-sm mb-1">
          {label}
        </p>
        <p className="!text-white font-medium text-sm">
          Value: {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-[#333]/50 bg-[#151515]/90 p-6 shadow-md backdrop-blur space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#A78F62] font-semibold mb-1">Welfare gap insight</p>
          <h3 className="text-lg font-semibold text-gray-100 mb-1">{unit === "currency" ? "Benefit gap analysis" : unit === "people" ? "Beneficiary reach analysis" : "Discoverable Programs vs Claimed"}</h3>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <span className="rounded-full bg-[#222]/50 border border-[#E15A15]/20 text-[#E15A15] text-xs font-semibold px-3 py-1 uppercase tracking-wider">Gap: {formatCurrency(missing)}{unit === "currency" ? "/mo" : ""}</span>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        {/* Bar Chart */}
        <div className="flex-1 min-w-0 rounded-xl border border-[#333]/50 bg-[#1a1a1a]/80 p-4 shadow-sm backdrop-blur flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-[#A78F62] font-semibold">Monthly comparison</span>
            <span className="rounded px-2 py-0.5 text-[10px] bg-[#222]/50 border border-[#333]/50 text-gray-400">Bar chart</span>
          </div>
          <div className="flex-1 w-full min-h-[200px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barGap={24} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#232323" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: grayTick, fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: grayTick, fontSize: 12 }} tickFormatter={v => formatCurrency(v)} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "#E15A1511" }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={800}>
                  {barData.map((entry, idx) => (
                    <Cell key={entry.name} fill={idx === 0 ? accent : "#555"} cursor="pointer" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Pie/Donut Chart - Refined */}
        <div className="flex-1 min-w-0 rounded-xl border border-[#333]/50 bg-[#1a1a1a]/80 p-6 shadow-md backdrop-blur flex flex-col justify-between">
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider text-[#A78F62] font-semibold">Distribution</span>
              <span className="rounded px-2 py-0.5 text-[10px] bg-[#222]/50 border border-[#333]/50 text-gray-400 ml-auto">Pie chart</span>
            </div>
            <div className="text-xs text-gray-400 mb-3">How support is split between current and missed benefits</div>
          </div>
          <div className="relative flex flex-col items-center justify-center w-full" style={{ minHeight: 200 }}>
            <ResponsiveContainer width={"100%"} height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="#151515"
                  isAnimationActive
                  animationDuration={900}
                  label={false}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} cursor="pointer" />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label overlay */}
            <DonutCenter />
          </div>
          {/* Custom legend */}
          <DonutLegend />
          {/* Summary sentence */}
          <div className="mt-4 text-xs text-gray-400 text-center">
            {receivedPercent < 100
              ? unit === "currency"
                ? `You are currently receiving only ${receivedPercent}% of the support you qualify for.`
                : unit === "people" 
                  ? `Currently, only ${receivedPercent}% of eligible individuals are successfully receiving support.`
                  : "Claimable many, claimed none. Based on your profile, you are leaving schemes on the table."
              : unit === "currency" 
                ? "You are receiving all the support you qualify for!"
                : unit === "people"
                  ? "Full reach! 100% of eligible individuals are receiving support."
                  : "You have verified and claimed all identified schemes."}
          </div>
        </div>
      </div>
    </div>
  );
}
