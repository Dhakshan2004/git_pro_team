import { useState } from "react";
import { Finding, DEMO_REPOSITORIES } from "../data/findingsData";

interface AuditCenterViewProps {
  findings: Finding[];
  appliedFixes: Record<string, boolean>;
  onApplyFix: (id: string) => void;
  onShowToast: (msg: string) => void;
  activeFindingId: string;
  onSelectFinding: (id: string) => void;
  findingCategory: string;
  onChangeCategory: (cat: string) => void;
  onFilterVulnerabilities: () => void;
  repoUrl: string;
  onChangeRepoUrl: (url: string) => void;
}

export default function AuditCenterView({
  findings,
  appliedFixes,
  onApplyFix,
  onShowToast,
  activeFindingId,
  onSelectFinding,
  findingCategory,
  onChangeCategory,
  onFilterVulnerabilities,
  repoUrl,
  onChangeRepoUrl,
}: AuditCenterViewProps) {
  const [ingestionTab, setIngestionTab] = useState<"github" | "zip">("github");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>("");
  const [meterHovered, setMeterHovered] = useState(false);
  const [sparklineHoverIdx, setSparklineHoverIdx] = useState<number | null>(null);
  const [radarMetricHover, setRadarMetricHover] = useState<string | null>(null);
  const [copiedLeft, setCopiedLeft] = useState(false);
  const [copiedRight, setCopiedRight] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const activeFinding =
    findings.find((f) => f.id === activeFindingId) || findings[0];

  const patchedCount = Object.values(appliedFixes).filter(Boolean).length;
  const currentRisk = Math.max(8, 23 - patchedCount * 3);
  const currentQuality = Math.min(95, 78 + patchedCount * 3);
  const currentVulnerabilities = Math.max(1, 14 - patchedCount * 2);

  const filteredFindings = findings
    .filter((item) => {
      if (findingCategory === "All") return true;
      if (findingCategory === "Critical Security")
        return item.category === "Critical Security";
      if (findingCategory === "High Complexity")
        return item.category === "High Complexity";
      if (findingCategory === "Code Smells")
        return item.category === "Code Smells";
      return true;
    })
    .filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.cwe.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q)
      );
    });

  const handleRunAnalysis = (overrideUrl?: string) => {
    setIsAnalyzing(true);
    const targetUrl = overrideUrl || repoUrl;
    if (overrideUrl) onChangeRepoUrl(overrideUrl);

    setAnalysisProgress("Generating AST Abstract Syntax Tree...");
    setTimeout(() => {
      setAnalysisProgress("Evaluating Radon cyclomatic complexity invariants...");
    }, 450);

    setTimeout(() => {
      setAnalysisProgress("Synthesizing neural vulnerability remediation vectors...");
    }, 900);

    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisProgress("");
      onShowToast(
        `Deep scan complete for ${targetUrl.split("/").pop() || "repository"}! 5 findings indexed.`
      );
    }, 1400);
  };

  const handleCopyCode = (text: string, side: "left" | "right") => {
    navigator.clipboard?.writeText(text);
    if (side === "left") {
      setCopiedLeft(true);
      setTimeout(() => setCopiedLeft(false), 2000);
    } else {
      setCopiedRight(true);
      setTimeout(() => setCopiedRight(false), 2000);
    }
    onShowToast("Code snippet copied to clipboard");
  };

  const sparklineData = [
    { day: "Mon", score: 68, x: 10, y: 38 },
    { day: "Tue", score: 71, x: 38, y: 32 },
    { day: "Wed", score: 69, x: 66, y: 35 },
    { day: "Thu", score: 74, x: 94, y: 26 },
    { day: "Fri", score: 73, x: 122, y: 28 },
    { day: "Sat", score: 76, x: 150, y: 21 },
    { day: "Sun", score: currentQuality, x: 180, y: 14 },
  ];

  const renderCategoryIcon = (key: string) => {
    switch (key) {
      case "sql":
        return (
          <svg className="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3-1.8 0-3.48-.18-4.85-.5" />
            <path d="M3 5v14c0 1.66 4 3 9 3 1.5 0 2.92-.12 4.15-.35" />
            <path d="M21 5v4" />
            <path d="M19 13l-4 6h4l-2 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(244, 63, 94, 0.25)" />
          </svg>
        );
      case "ast":
        return (
          <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="4" r="2.5" fill="rgba(245, 158, 11, 0.2)" />
            <circle cx="6" cy="12" r="2.5" fill="rgba(245, 158, 11, 0.2)" />
            <circle cx="18" cy="12" r="2.5" fill="rgba(245, 158, 11, 0.2)" />
            <circle cx="4" cy="20" r="2" fill="rgba(245, 158, 11, 0.2)" />
            <circle cx="9" cy="20" r="2" fill="rgba(245, 158, 11, 0.2)" />
            <circle cx="18" cy="20" r="2" fill="rgba(245, 158, 11, 0.2)" />
            <path d="M12 6.5v3m0 0L6 12m6-2.5L18 12" strokeLinecap="round" />
            <path d="M6 14.5L4 18M6 14.5L9 18M18 14.5V18" strokeLinecap="round" />
          </svg>
        );
      case "jwt":
        return (
          <svg className="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" />
            <rect x="9.5" y="11" width="5" height="4" rx="1" fill="rgba(244, 63, 94, 0.2)" />
            <path d="M10.5 11V9a1.5 1.5 0 013 0v2" strokeLinecap="round" />
            <line x1="8" y1="8" x2="16" y2="16" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case "memory":
        return (
          <svg className="w-4 h-4 text-[#A8FFB2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="5" y="5" width="14" height="14" rx="2" />
            <line x1="9" y1="9" x2="9" y2="15" />
            <line x1="12" y1="9" x2="12" y2="15" />
            <line x1="15" y1="9" x2="15" y2="15" />
            <path d="M19 12h3M19 8h3M19 16h3M2 12h3M2 8h3M2 16h3" />
            <path d="M15 19v3m2-1.5l-2 1.5-2-1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 2. REPOSITORY INGESTION WORKSPACE */}
      <section className="bg-[#0D1A14]/80 backdrop-blur-xl rounded-3xl p-6 sm:p-7 shadow-glass-card border border-[rgba(168,255,178,0.12)] relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[#A8FFB2] text-xs font-mono font-medium mb-1">
              <span className="material-symbols-outlined text-[#10B981] text-[16px] animate-pulse">
                auto_awesome
              </span>
              <span>Automated Static &amp; AST Neural Quality Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-white tracking-tight">
              Project Ingestion &amp; Vulnerability Matrix
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
              Execute automated deep-scan AST parsing, Radon cyclomatic complexity evaluation, and neural defect scoring across your microservice codebase.
            </p>
          </div>

          {/* Quick Demo Pill with Dropdown Option */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                handleRunAnalysis(
                  "https://github.com/prism-engine/flask-microservice-core"
                )
              }
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#12261C] hover:bg-[#173224] border border-[#10B981]/30 text-xs font-medium text-[#C8E7D5] transition-all duration-200 group cursor-pointer active:scale-95 shadow-sm"
            >
              <svg
                className="w-4 h-4 text-[#A8FFB2] group-hover:scale-110 transition-transform animate-pulse"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
              </svg>
              <span>
                Try demo:{" "}
                <strong className="text-white underline decoration-[#10B981]/60">
                  Flask Microservice
                </strong>
              </span>
            </button>
          </div>
        </div>

        {/* Ingestion Dual-Tab Switcher */}
        <div className="mt-6 pt-5 border-t border-[rgba(168,255,178,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIngestionTab("github")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  ingestionTab === "github"
                    ? "bg-[#142D21] text-[#A8FFB2] border border-[#10B981]/40 shadow-sm font-semibold"
                    : "text-[#8E9F94] hover:text-white bg-[#0A1610]/70 border border-[rgba(168,255,178,0.08)]"
                }`}
              >
                <span className="material-symbols-outlined text-[16px] text-[#10B981]">
                  alt_route
                </span>
                <span>GitHub Repository URL</span>
              </button>
              <button
                onClick={() => setIngestionTab("zip")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  ingestionTab === "zip"
                    ? "bg-[#142D21] text-[#A8FFB2] border border-[#10B981]/40 shadow-sm font-semibold"
                    : "text-[#8E9F94] hover:text-white bg-[#0A1610]/70 border border-[rgba(168,255,178,0.08)]"
                }`}
              >
                <span className="material-symbols-outlined text-[16px] text-[#10B981]">
                  cloud_upload
                </span>
                <span>Upload Project ZIP</span>
              </button>
            </div>

            {/* Quick Repository Presets */}
            {ingestionTab === "github" && (
              <div className="flex items-center gap-2 text-xs font-mono text-[#87998D]">
                <span>Presets:</span>
                {DEMO_REPOSITORIES.map((repo) => (
                  <button
                    key={repo.name}
                    onClick={() => handleRunAnalysis(repo.url)}
                    className="px-2 py-0.5 rounded bg-[#0A1610] hover:bg-[#142D21] hover:text-[#A8FFB2] border border-[rgba(168,255,178,0.08)] transition-colors cursor-pointer text-[11px]"
                  >
                    {repo.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tab 1: GitHub URL Form */}
          {ingestionTab === "github" ? (
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg
                    className="w-5 h-5 text-slate-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => onChangeRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/repository"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#06110D] border border-[rgba(168,255,178,0.18)] focus:border-[#10B981] focus:ring-2 focus:ring-emerald-500/20 text-sm text-[#E6F9EC] placeholder-slate-500 font-mono transition-all outline-none shadow-inner"
                />
              </div>
              <button
                onClick={() => handleRunAnalysis()}
                disabled={isAnalyzing}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#10B981] to-[#22C55E] hover:from-[#34D399] hover:to-[#4ADE80] active:scale-95 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-950"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Analyzing AST Graph...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px] text-slate-950">
                      memory
                    </span>
                    <span>Run AI Analysis</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Tab 2: Minimalist Drag and Drop ZIP Dropzone */
            <div
              onClick={() =>
                handleRunAnalysis("local-archive:flask_service_v2.1.zip")
              }
              className="border-2 border-dashed border-[rgba(168,255,178,0.2)] hover:border-[#10B981] rounded-2xl p-6 text-center bg-[#07130E]/60 hover:bg-[#0D2218]/40 transition-all cursor-pointer group flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-[#A8FFB2] mb-3 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px] text-[#A8FFB2]">
                  cloud_upload
                </span>
              </div>
              <p className="text-sm font-medium text-[#E6F9EC] mb-1">
                Drag &amp; drop code archive (
                <span className="text-[#A8FFB2] font-mono">.zip</span>) up to 100MB
              </p>
              <p className="text-xs text-[#87998D]">
                Click to browse or drop an exported codebase to run offline security triage
              </p>
            </div>
          )}

          {/* Analysis Real-time Status Log */}
          {isAnalyzing && (
            <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-[#07130E] border border-[rgba(168,255,178,0.15)] text-xs font-mono text-[#A8FFB2] animate-pulse">
              <span className="material-symbols-outlined text-[16px] text-[#10B981]">
                sync
              </span>
              <span>{analysisProgress}</span>
            </div>
          )}
        </div>
      </section>

      {/* 3. KEY METRICS & DEFECT RISK STRIP */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Defect Risk % with glowing radial meter */}
        <div
          className="bg-[#0D1A14]/80 backdrop-blur-xl rounded-2xl p-5 shadow-glass-card border border-[rgba(168,255,178,0.12)] hover:border-[#10B981]/40 transition-all flex flex-col justify-between relative overflow-hidden group"
          onMouseEnter={() => setMeterHovered(true)}
          onMouseLeave={() => setMeterHovered(false)}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#87998D] uppercase tracking-wider">
              Defect Risk Index
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-amber-400">
                warning
              </span>
              Moderate Risk
            </span>
          </div>

          <div className="flex items-center gap-4 my-2">
            {/* Enhanced Circular Radial Meter SVG with Glowing Gradient Stroke */}
            <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0 cursor-help">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 44 44">
                <defs>
                  <linearGradient id="risk-gradient-dark" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                  <filter id="glow-risk-dark" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.5" result="glow" />
                    <feComposite in="SourceGraphic" in2="glow" operator="over" />
                  </filter>
                </defs>
                <circle cx="22" cy="22" r="17.5" fill="none" stroke="#13261D" strokeWidth="4" />
                <circle
                  cx="22"
                  cy="22"
                  r="17.5"
                  fill="none"
                  stroke="url(#risk-gradient-dark)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${(currentRisk / 100) * 110} 110`}
                  className="transition-all duration-700 ease-out"
                  filter={meterHovered ? "url(#glow-risk-dark)" : "none"}
                />
                <circle
                  cx="38.5"
                  cy="28.5"
                  r="2.2"
                  fill="#f59e0b"
                  stroke="#070D0A"
                  strokeWidth="1"
                  className="pulse-ring-anim"
                />
              </svg>
              <span className="absolute font-bold text-base text-white font-mono tracking-tight">
                {currentRisk}%
              </span>
            </div>

            <div>
              <p className="text-xs text-white font-semibold">21–40% Threshold</p>
              <p className="text-[11px] text-[#87998D] leading-tight mt-0.5">
                Statistical probability of regression in next sprint
              </p>
            </div>
          </div>

          <div className="relative mt-1">
            <div className="w-full bg-[#13261D] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full shadow-xs transition-all duration-500"
                style={{ width: `${currentRisk}%` }}
              />
            </div>
            {meterHovered && (
              <div className="absolute -top-7 left-[20%] -translate-x-1/2 bg-[#050D09] text-white border border-amber-500/40 text-[10px] font-mono px-2 py-0.5 rounded shadow whitespace-nowrap z-20 pointer-events-none">
                AST Hazard: {currentRisk}% (Safe &lt; 15%)
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Code Quality Score with SVG Sparkline Trend */}
        <div className="bg-[#0D1A14]/80 backdrop-blur-xl rounded-2xl p-5 shadow-glass-card border border-[rgba(168,255,178,0.12)] hover:border-[#10B981]/40 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[#87998D] uppercase tracking-wider">
              Quality Score
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-[#A8FFB2] border border-emerald-500/30 font-mono">
              +{4.2 + patchedCount * 1.5}% vs baseline
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                  {currentQuality}%
                </span>
                <span className="text-xs text-[#87998D]">/ 100 benchmark</span>
              </div>
              <p className="text-[11px] text-[#87998D]">Clean architectural decoupling</p>
            </div>

            {/* SVG 7-Day Sparkline Trend Curve */}
            <div className="relative w-28 h-10">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 190 48">
                <defs>
                  <linearGradient id="sparkline-grad-dark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 10 38 L 38 32 L 66 35 L 94 26 L 122 28 L 150 21 L 180 14 L 180 48 L 10 48 Z"
                  fill="url(#sparkline-grad-dark)"
                />
                <path
                  d="M 10 38 L 38 32 L 66 35 L 94 26 L 122 28 L 150 21 L 180 14"
                  fill="none"
                  stroke="#4EDEA3"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="180" cy="14" r="3.5" fill="#A8FFB2" stroke="#070D0A" strokeWidth="1.5" />
                <circle cx="180" cy="14" r="6" fill="#10B981" opacity="0.4" className="animate-ping" />
                {sparklineData.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    className="opacity-0 hover:opacity-100 fill-[#A8FFB2] stroke-[#070D0A] stroke-2 cursor-pointer transition-opacity"
                    onMouseEnter={() => setSparklineHoverIdx(i)}
                    onMouseLeave={() => setSparklineHoverIdx(null)}
                  />
                ))}
              </svg>

              {sparklineHoverIdx !== null && (
                <div className="absolute -top-7 right-0 bg-[#050D09] border border-emerald-500/40 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow pointer-events-none">
                  {sparklineData[sparklineHoverIdx].day}: {sparklineData[sparklineHoverIdx].score}%
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5 mt-2">
            <div className="w-full bg-[#13261D] h-2 rounded-full overflow-hidden border border-[rgba(168,255,178,0.1)]">
              <div
                className="bg-gradient-to-r from-[#10B981] to-[#4EDEA3] h-full rounded-full shadow-sm transition-all duration-500"
                style={{ width: `${currentQuality}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#87998D] font-mono">
              <span>Target: 75%</span>
              <span className="text-[#A8FFB2] font-semibold">Optimal: 85%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Maintainability Index with SVG Multi-Arc Gauge */}
        <div className="bg-[#0D1A14]/80 backdrop-blur-xl rounded-2xl p-5 shadow-glass-card border border-[rgba(168,255,178,0.12)] hover:border-[#10B981]/40 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[#87998D] uppercase tracking-wider">
              Maintainability
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-[#A8FFB2] border border-emerald-500/30 font-mono">
              Radon MI: Grade A
            </span>
          </div>

          <div className="flex items-center justify-between my-1">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-white font-mono">72</span>
                <span className="text-sm text-[#87998D] font-mono">/ 100</span>
              </div>
              <p className="text-[11px] text-[#87998D]">Halstead &amp; cyclomatic balance</p>
            </div>

            <div className="relative w-14 h-14 cursor-pointer" title="Radon MI Radar">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#13261D" strokeWidth="2.5" />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeDasharray="75 100"
                  strokeLinecap="round"
                  onMouseEnter={() => setRadarMetricHover("Radon: 75%")}
                  onMouseLeave={() => setRadarMetricHover(null)}
                />
                <circle cx="18" cy="18" r="11" fill="none" stroke="#13261D" strokeWidth="2.5" />
                <circle
                  cx="18"
                  cy="18"
                  r="11"
                  fill="none"
                  stroke="#4edea3"
                  strokeWidth="2.5"
                  strokeDasharray="55 100"
                  strokeLinecap="round"
                  onMouseEnter={() => setRadarMetricHover("Halstead: 78%")}
                  onMouseLeave={() => setRadarMetricHover(null)}
                />
                <circle cx="18" cy="18" r="7" fill="none" stroke="#13261D" strokeWidth="2.5" />
                <circle
                  cx="18"
                  cy="18"
                  r="7"
                  fill="none"
                  stroke="#a8ffb2"
                  strokeWidth="2.5"
                  strokeDasharray="40 100"
                  strokeLinecap="round"
                  onMouseEnter={() => setRadarMetricHover("Cognitive: 64%")}
                  onMouseLeave={() => setRadarMetricHover(null)}
                />
              </svg>
              {radarMetricHover && (
                <div className="absolute -top-7 -right-2 bg-[#050D09] border border-emerald-500/40 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow whitespace-nowrap z-20">
                  {radarMetricHover}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-2">
            <div className="h-1.5 flex-1 rounded-full bg-[#10B981]" />
            <div className="h-1.5 flex-1 rounded-full bg-[#10B981]" />
            <div className="h-1.5 flex-1 rounded-full bg-[#10B981]" />
            <div className="h-1.5 flex-1 rounded-full bg-[#13261D]" />
          </div>
        </div>

        {/* Card 4: Triage Tally */}
        <div className="bg-[#0D1A14]/80 backdrop-blur-xl rounded-2xl p-5 shadow-glass-card border border-[rgba(168,255,178,0.12)] hover:border-[#10B981]/40 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#87998D] uppercase tracking-wider">
              Triage Tally
            </span>
            <span className="text-[11px] font-mono text-[#87998D]">31 Total Flags</span>
          </div>

          <div className="grid grid-cols-2 gap-2 my-2">
            {/* Vulnerabilities Pill */}
            <div
              onClick={onFilterVulnerabilities}
              className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between group/v cursor-pointer hover:bg-rose-950/60 transition-colors"
            >
              <div>
                <span className="text-lg font-bold text-rose-400 font-mono leading-none block">
                  {currentVulnerabilities}
                </span>
                <span className="text-[10px] text-rose-300 font-medium">Vulnerabilities</span>
              </div>
              <svg
                className="w-5 h-5 text-rose-400 group-hover/v:scale-110 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
              </svg>
            </div>

            {/* Code Smells Pill */}
            <div
              onClick={() => onChangeCategory("Code Smells")}
              className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between group/s cursor-pointer hover:bg-emerald-950/60 transition-colors"
            >
              <div>
                <span className="text-lg font-bold text-[#A8FFB2] font-mono leading-none block">
                  17
                </span>
                <span className="text-[10px] text-emerald-300 font-medium">Code Smells</span>
              </div>
              <svg
                className="w-5 h-5 text-[#A8FFB2] group-hover/s:rotate-12 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10 2v7.31L4.2 18.2a2 2 0 001.6 3.8h12.4a2 2 0 001.6-3.8L14 9.31V2" />
                <line x1="8.5" y1="2" x2="15.5" y2="2" />
                <circle cx="12" cy="15" r="1.5" fill="#10b981" />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#87998D] pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>9 High Severity</span>
            </div>
            <span
              onClick={onFilterVulnerabilities}
              className="text-[#A8FFB2] font-medium hover:underline cursor-pointer flex items-center gap-0.5"
            >
              View breakdown &rarr;
            </span>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE DIAGNOSTIC & CODE REMEDIATION WORKSPACE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Detected Findings */}
        <div className="lg:col-span-5 bg-[#0D1A14]/80 backdrop-blur-xl rounded-3xl p-5 shadow-glass-card border border-[rgba(168,255,178,0.12)] flex flex-col h-[740px]">
          {/* Header & Filter Tabs */}
          <div className="pb-4 border-b border-[rgba(168,255,178,0.08)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                <h2 className="text-base font-bold text-white tracking-tight font-['Space_Grotesk']">
                  Detected Findings
                </h2>
              </div>
              <span className="text-xs font-mono text-[#A8FFB2] px-2 py-0.5 rounded-md bg-[#132A1F] border border-[#10B981]/25">
                {filteredFindings.length} Items
              </span>
            </div>

            {/* Search Input Filter */}
            <div className="relative mb-2.5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search findings by CWE, keyword, file..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#07130E] border border-[rgba(168,255,178,0.15)] text-xs text-white placeholder-slate-500 outline-none focus:border-[#10B981]"
              />
              <span className="material-symbols-outlined text-[14px] text-slate-500 absolute left-2.5 top-2.5">
                search
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {["All", "Critical Security", "High Complexity", "Code Smells"].map(
                (category) => (
                  <button
                    key={category}
                    onClick={() => onChangeCategory(category)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      findingCategory === category
                        ? "bg-[#163626] text-[#A8FFB2] border border-[#10B981]/50 font-semibold shadow-xs"
                        : "text-[#87998D] hover:text-white bg-[#0A1610]/70 border border-[rgba(168,255,178,0.08)]"
                    }`}
                  >
                    {category}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Scrollable Findings List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 pt-3">
            {filteredFindings.map((item) => {
              const isSelected = item.id === activeFinding.id;
              const isFixed = appliedFixes[item.id];

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectFinding(item.id)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all border text-left relative group ${
                    isSelected
                      ? "bg-[#122A1E]/90 border-[#10B981]/50 border-l-4 border-l-[#10B981] shadow-glow-mint"
                      : "bg-[#0A1610]/70 hover:bg-[#11241B]/70 border-[rgba(168,255,178,0.08)] hover:border-[rgba(168,255,178,0.2)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-[#07130E] border border-[rgba(168,255,178,0.12)] shadow-xs flex items-center justify-center">
                        {renderCategoryIcon(item.typeKey)}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                          item.severity === "High"
                            ? "bg-rose-950/60 text-rose-300 border border-rose-500/30"
                            : "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {item.severity}
                      </span>
                      <span className="text-[11px] text-[#87998D] font-mono">
                        {item.complexity}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isFixed && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#A8FFB2] bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-500/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> Patched
                        </span>
                      )}
                      <div
                        className={`transition-transform duration-200 text-slate-500 group-hover:text-[#A8FFB2] ${
                          isSelected ? "translate-x-0.5 text-[#A8FFB2]" : "group-hover:translate-x-1"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          chevron_right
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-white tracking-tight mb-1">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed mb-2">
                    {item.summary}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#A7C4B5] bg-[#07120D] px-2.5 py-1 rounded-lg border border-[rgba(168,255,178,0.08)]">
                    <span className="truncate">{item.location}</span>
                    <span className="text-[10px] text-[#87998D] font-sans group-hover:text-[#A8FFB2]">
                      Preview &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: PRISM AI Remediation & Code Diff */}
        <div className="lg:col-span-7 bg-[#0D1A14]/80 backdrop-blur-xl rounded-3xl p-5 shadow-glass-card border border-[rgba(168,255,178,0.12)] flex flex-col space-y-4">
          
          {/* 1. AI Risk Analysis Card */}
          <div className="p-4 rounded-2xl bg-[#091711] border border-[rgba(168,255,178,0.15)] relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#0F261C] text-[#A8FFB2] border border-[#10B981]/30 shadow-xs mt-0.5">
                <svg
                  className="w-5 h-5 text-[#A8FFB2]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="6" cy="7" r="2.5" />
                  <circle cx="6" cy="17" r="2.5" />
                  <circle cx="12" cy="12" r="2.5" fill="rgba(168, 255, 178, 0.3)" />
                  <circle cx="18" cy="7" r="2.5" />
                  <circle cx="18" cy="17" r="2.5" />
                  <line x1="8.5" y1="7" x2="10" y2="10.5" strokeDasharray="2 1" />
                  <line x1="8.5" y1="17" x2="10" y2="13.5" strokeDasharray="2 1" />
                  <line x1="14" y1="10.5" x2="15.5" y2="7" strokeDasharray="2 1" />
                  <line x1="14" y1="13.5" x2="15.5" y2="17" strokeDasharray="2 1" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white tracking-tight font-['Space_Grotesk']">
                      PRISM AI Diagnostic Vector
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-950/60 text-rose-300 border border-rose-500/30 font-semibold">
                      {activeFinding.cwe} Validated
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#87998D]">
                    Confidence: {activeFinding.confidence}
                  </span>
                </div>
                <p className="text-xs text-[#A7C4B5] leading-relaxed">
                  {activeFinding.analysis}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Side-by-side Refined Code Diff Viewer */}
          <div className="rounded-2xl border border-[rgba(168,255,178,0.14)] bg-[#050D09] overflow-hidden shadow-glass-card">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#091711] border-b border-[rgba(168,255,178,0.1)] text-xs font-mono">
              <div className="flex items-center gap-2 text-[#87998D]">
                <span className="material-symbols-outlined text-[16px] text-[#10B981]">
                  terminal
                </span>
                <span className="text-[#E6F9EC] font-medium">{activeFinding.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-rose-400 font-sans font-medium">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Defective
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-[#A8FFB2] font-sans font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" /> AI Remediated
                </span>
              </div>
            </div>

            {/* Split View */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[rgba(168,255,178,0.1)] text-xs font-mono">
              {/* Left Pane: Original Defective Snippet */}
              <div className="p-4 bg-[#140608]/40 overflow-x-auto relative group/orig">
                <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                  <span>ORIGINAL (DEFECTIVE)</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyCode(activeFinding.originalCode, "left")}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#200A0D] hover:bg-rose-950 border border-rose-500/30 text-rose-300 text-[10px] transition-colors cursor-pointer"
                      title="Copy defective snippet"
                    >
                      <span className="material-symbols-outlined text-[12px]">
                        {copiedLeft ? "check" : "content_copy"}
                      </span>
                      <span>{copiedLeft ? "Copied" : "Copy"}</span>
                    </button>
                    <span className="text-rose-500 font-mono text-[10px]">- VULNERABLE</span>
                  </div>
                </div>
                <pre className="text-rose-200/90 leading-relaxed selection:bg-rose-900/60 whitespace-pre">
                  {activeFinding.originalCode}
                </pre>
              </div>

              {/* Right Pane: AI-Refactored Patch */}
              <div className="p-4 bg-[#081C13]/50 overflow-x-auto relative group/patch">
                <div className="text-[10px] font-bold text-[#A8FFB2] uppercase tracking-widest mb-2 flex items-center justify-between">
                  <span>AI REFACTORED (SECURE)</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyCode(activeFinding.refactoredCode, "right")}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#0D291C] hover:bg-emerald-950 border border-emerald-500/30 text-[#A8FFB2] text-[10px] transition-colors cursor-pointer"
                      title="Copy refactored snippet"
                    >
                      <span className="material-symbols-outlined text-[12px]">
                        {copiedRight ? "check" : "content_copy"}
                      </span>
                      <span>{copiedRight ? "Copied" : "Copy"}</span>
                    </button>
                    <span className="text-[#10B981] font-mono text-[10px]">+ SYNTHESIZED</span>
                  </div>
                </div>
                <pre className="text-[#C8FCE0] leading-relaxed selection:bg-emerald-900/60 whitespace-pre">
                  {activeFinding.refactoredCode}
                </pre>
              </div>
            </div>
          </div>

          {/* 3. Action Items Outlining Fix Rationale & CTA */}
          <div className="p-4 rounded-2xl bg-[#091711] border border-[rgba(168,255,178,0.12)] space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 font-['Space_Grotesk']">
              <span className="material-symbols-outlined text-[15px] text-amber-400">
                warning
              </span>
              <span>ARCHITECTURAL REMEDIATION RATIONALE</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-[#A7C4B5]">
              {activeFinding.rationale.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[#A8FFB2] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[12px] text-[#A8FFB2]">
                      check
                    </span>
                  </span>
                  <span className="text-[#C8E7D5]">{point}</span>
                </li>
              ))}
            </ul>

            {/* Target branch footer with SVG Git fork icon & commit badge */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[rgba(168,255,178,0.08)]">
              <div className="flex items-center gap-2 text-[11px] text-[#87998D] font-mono">
                <span className="material-symbols-outlined text-[16px] text-[#10B981]">
                  alt_route
                </span>
                <span>Branch:</span>
                <span className="text-[#E6F9EC] font-semibold underline decoration-[#10B981]/50">
                  prism-ai/patch-remediation
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#102419] text-[#A8FFB2] text-[10px] border border-[#10B981]/20">
                  #c4a89f2
                </span>
              </div>

              <button
                onClick={() => onApplyFix(activeFinding.id)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95 group/btn cursor-pointer ${
                  appliedFixes[activeFinding.id]
                    ? "bg-[#0E281B] text-[#A8FFB2] border border-[#10B981]/50 cursor-default"
                    : "bg-gradient-to-r from-[#10B981] to-[#22C55E] hover:from-[#34D399] hover:to-[#4ADE80] text-slate-950 shadow-lg shadow-emerald-500/25"
                }`}
              >
                {appliedFixes[activeFinding.id] ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] text-[#A8FFB2]">
                      check_circle
                    </span>
                    <span>Remediation Applied</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 text-slate-950 group-hover/btn:rotate-12 transition-transform duration-300"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <span>Apply AI Fix</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
