import { useState } from "react";

interface MetricsExplorerViewProps {
  onBackToAudit: () => void;
  onShowToast: (msg: string) => void;
}

export default function MetricsExplorerView({
  onBackToAudit,
  onShowToast,
}: MetricsExplorerViewProps) {
  const [selectedModule, setSelectedModule] = useState("All Modules");

  const modulesData = [
    { name: "Payment Gateway", cyclomatic: 7, halstead: 84, cognitive: 5, status: "A" },
    { name: "Dispatch Engine", cyclomatic: 18, halstead: 142, cognitive: 16, status: "F (Refactored to A)" },
    { name: "JWT Auth Handler", cyclomatic: 4, halstead: 52, cognitive: 3, status: "A" },
    { name: "Redis Connection Pool", cyclomatic: 5, halstead: 68, cognitive: 4, status: "B" },
    { name: "Environment Config", cyclomatic: 2, halstead: 31, cognitive: 1, status: "A" },
  ];

  const owaspData = [
    { code: "A01:2021", name: "Broken Access Control", score: 99.4, status: "Hardened" },
    { code: "A02:2021", name: "Cryptographic Failures", score: 98.8, status: "Hardened" },
    { code: "A03:2021", name: "Injection (SQL / NoSQL)", score: 99.7, status: "Patched" },
    { code: "A04:2021", name: "Insecure Design", score: 96.2, status: "Verified" },
    { code: "A05:2021", name: "Security Misconfiguration", score: 99.1, status: "Patched" },
    { code: "A07:2021", name: "Identification & Auth", score: 98.9, status: "Hardened" },
    { code: "A08:2021", name: "Software & Data Integrity", score: 97.5, status: "Verified" },
    { code: "A09:2021", name: "Security Logging Failures", score: 99.0, status: "Compliant" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0D1A14]/80 backdrop-blur-xl border border-[rgba(168,255,178,0.12)] shadow-glass-card">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#A8FFB2] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span>RADON AST &amp; HALSTEAD TELEMETRY PROFILER</span>
          </div>
          <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-white">
            Codebase Complexity &amp; OWASP Compliance Explorer
          </h2>
          <p className="text-xs text-[#87998D] mt-1">
            Deterministic AST metrics across all repository packages evaluated against ISO/IEC 25010 maintainability benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBackToAudit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#142B20] hover:bg-[#1A382A] text-xs font-medium text-[#A8FFB2] border border-[#10B981]/30 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Return to Audit Matrix</span>
          </button>
        </div>
      </div>

      {/* Grid: Complexity Breakdown + OWASP Top 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Radon Complexity by Module */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0D1A14]/80 backdrop-blur-xl border border-[rgba(168,255,178,0.12)] shadow-glass-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  Radon Cyclomatic Complexity &amp; Cognitive Volume
                </h3>
                <p className="text-xs text-[#87998D]">
                  Distribution of cyclomatic score and cognitive nesting levels
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#A8FFB2] px-2 py-0.5 rounded bg-[#102419] border border-[#10B981]/30">
                Radon Target: &lt; 10
              </span>
            </div>

            <div className="space-y-3">
              {modulesData.map((mod) => (
                <div
                  key={mod.name}
                  onClick={() => {
                    setSelectedModule(mod.name);
                    onShowToast(`Drilled down into module: ${mod.name}`);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedModule === mod.name
                      ? "bg-[#142D21] border-[#10B981]/50 shadow-sm"
                      : "bg-[#0A1610]/70 hover:bg-[#11241B] border-[rgba(168,255,178,0.08)]"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-[#E6F9EC] font-sans font-semibold">{mod.name}</span>
                    <span className="text-[11px] text-[#A8FFB2]">Grade: {mod.status}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-[#87998D] pt-1 border-t border-[rgba(168,255,178,0.06)]">
                    <div>
                      <span>Cyclomatic: </span>
                      <strong className={mod.cyclomatic > 10 ? "text-amber-400" : "text-[#4EDEA3]"}>
                        {mod.cyclomatic}
                      </strong>
                    </div>
                    <div>
                      <span>Halstead Vol: </span>
                      <strong className="text-white">{mod.halstead}</strong>
                    </div>
                    <div>
                      <span>Cognitive: </span>
                      <strong className={mod.cognitive > 10 ? "text-rose-400" : "text-[#4EDEA3]"}>
                        {mod.cognitive}
                      </strong>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-[#13261D] h-1.5 rounded-full overflow-hidden mt-2.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        mod.cyclomatic > 10
                          ? "bg-gradient-to-r from-amber-400 to-rose-500"
                          : "bg-gradient-to-r from-[#10B981] to-[#4EDEA3]"
                      }`}
                      style={{ width: `${Math.min(100, (mod.cyclomatic / 20) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: OWASP Top 10 Security Posture */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0D1A14]/80 backdrop-blur-xl border border-[rgba(168,255,178,0.12)] shadow-glass-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  OWASP Top 10 Coverage
                </h3>
                <p className="text-xs text-[#87998D]">
                  Automated AST pattern ruleset validation score
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#4EDEA3] font-bold">
                99.2% AVG
              </span>
            </div>

            <div className="space-y-2.5">
              {owaspData.map((item) => (
                <div
                  key={item.code}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#08130E] border border-[rgba(168,255,178,0.08)] text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 font-semibold">{item.code}</span>
                    <span className="text-[#C8E7D5] font-sans truncate max-w-[170px]">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[#A8FFB2] font-bold">{item.score}%</span>
                    <span className="text-[10px] text-[#4EDEA3] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
