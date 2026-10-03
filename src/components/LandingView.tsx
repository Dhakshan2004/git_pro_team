import { useState } from "react";
import ShaderBackground from "./ShaderBackground";

interface LandingViewProps {
  onLaunchStudio: (demoRepoUrl?: string) => void;
  onNavigateTab: (tab: string) => void;
  onShowToast: (msg: string) => void;
}

export default function LandingView({
  onLaunchStudio,
  onNavigateTab,
  onShowToast,
}: LandingViewProps) {
  const [copiedCli, setCopiedCli] = useState(false);
  const [prAccepted, setPrAccepted] = useState(false);
  const [activeSnippetIdx, setActiveSnippetIdx] = useState(0);

  const sampleSnippets = [
    {
      file: "services/auth_controller.py",
      cwe: "CWE-89 • High Severity",
      confidence: "98.4%",
      latency: "380ms",
      vulnDesc: "Unsanitized payload from request.json['login'] propagates into SQL execution statement without parameterized bounds.",
      defLines: [
        { num: 12, code: `def authenticate_user(request):`, type: "normal" },
        { num: 13, code: `    raw_usr = request.json.get('login')`, type: "normal" },
        { num: 14, code: `-   query = f"SELECT * FROM users WHERE u='{raw_usr}'"`, type: "deleted" },
        { num: 15, code: `-   cursor.execute(query)`, type: "deleted" },
        { num: 16, code: `-   record = cursor.fetchone()`, type: "deleted" },
        { num: 17, code: `    return verify_hash(record, request.json)`, type: "normal" },
      ],
      remLines: [
        { num: 12, code: `def authenticate_user(request):`, type: "normal" },
        { num: 13, code: `    raw_usr = request.json.get('login')`, type: "normal" },
        { num: 14, code: `+   stmt = "SELECT id, hash, salt FROM users WHERE u = %s"`, type: "added" },
        { num: 15, code: `+   cursor.execute(stmt, (raw_usr,))`, type: "added" },
        { num: 16, code: `+   record = cursor.fetchone()`, type: "added" },
        { num: 17, code: `    return verify_hash(record, request.json)`, type: "normal" },
      ],
    },
    {
      file: "services/payment_gateway.py",
      cwe: "CWE-89 • High Severity",
      confidence: "99.2%",
      latency: "290ms",
      vulnDesc: "Account ledger query uses dynamic formatting without database bind variables.",
      defLines: [
        { num: 41, code: `def get_account_ledger(account_id, limit=50):`, type: "normal" },
        { num: 42, code: `-   query = f"SELECT * FROM tx WHERE id='{account_id}'"`, type: "deleted" },
        { num: 43, code: `-   res = conn.execute(query)`, type: "deleted" },
        { num: 44, code: `    return [dict(r) for r in res]`, type: "normal" },
      ],
      remLines: [
        { num: 41, code: `def get_account_ledger(account_id: str, limit: int = 50):`, type: "normal" },
        { num: 42, code: `+   query = text("SELECT * FROM tx WHERE id = :acc_id")`, type: "added" },
        { num: 43, code: `+   res = conn.execute(query, {"acc_id": account_id})`, type: "added" },
        { num: 44, code: `    return [dict(r) for r in res]`, type: "normal" },
      ],
    },
  ];

  const currentSnippet = sampleSnippets[activeSnippetIdx];

  const handleCopyCli = () => {
    navigator.clipboard?.writeText("npx prism-ai scan ./services/core --remediate");
    setCopiedCli(true);
    onShowToast("CLI command copied to clipboard!");
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handleAcceptPr = () => {
    setPrAccepted(true);
    onShowToast("PR #481 verified & auto-merged with zero AST regressions!");
  };

  return (
    <div className="relative min-h-screen bg-[#070D0A] text-[#DCE5DF] overflow-x-hidden selection:bg-[#10B981]/30 selection:text-[#A8FFB2]">
      {/* 1. STITCH Living WebGL Shader Background */}
      <ShaderBackground />

      {/* Ambient Light Halos */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#10B981]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[480px] -left-48 w-[500px] h-[500px] bg-[#006328]/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[620px] -right-48 w-[550px] h-[550px] bg-[#10B981]/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Floating Top Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full pt-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto h-20 px-4 sm:px-6 bg-[#08100D]/85 backdrop-blur-xl rounded-2xl border border-[rgba(168,255,178,0.14)] shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(16,185,129,0.06)] flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 min-w-max">
            <div className="w-10 h-10 rounded-xl bg-[#242C28]/90 border border-[#4EDEA3]/40 flex items-center justify-center shadow-[0_0_16px_rgba(78,222,163,0.25)]">
              <span className="material-symbols-outlined text-[#4EDEA3] text-[22px]">
                view_in_ar
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-['Space_Grotesk'] text-lg font-bold tracking-tight text-[#DCE5DF]">
                  PRISM
                </span>
                <span className="text-[10px] font-bold font-['Space_Grotesk'] px-2 py-0.5 rounded bg-[#4EDEA3]/10 text-[#4EDEA3] border border-[#4EDEA3]/30 tracking-widest uppercase">
                  AI CODE INSPECTOR
                </span>
              </div>
              <span className="hidden xl:block text-xs text-[#BBCAAF]/80 -mt-0.5">
                Autonomous Defect Prediction &amp; Vulnerability Remediation
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 px-3 py-1.5 rounded-xl bg-[#161D1A]/60 border border-[rgba(168,255,178,0.1)]">
            <button
              onClick={() => onNavigateTab("Platform")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-[#4EDEA3] bg-[#242C28]/70"
            >
              Platform
            </button>
            <button
              onClick={() => onNavigateTab("Vulnerability Engine")}
              className="px-3 py-1.5 rounded-lg text-xs text-[#BBCAAF] hover:text-[#DCE5DF] transition-colors"
            >
              Vulnerability Engine
            </button>
            <button
              onClick={() => onNavigateTab("Architecture Diff")}
              className="px-3 py-1.5 rounded-lg text-xs text-[#BBCAAF] hover:text-[#DCE5DF] transition-colors"
            >
              Architecture Diff
            </button>
            <button
              onClick={() => onNavigateTab("Benchmarks")}
              className="px-3 py-1.5 rounded-lg text-xs text-[#BBCAAF] hover:text-[#DCE5DF] transition-colors"
            >
              Benchmarks
            </button>
            <button
              onClick={() => onNavigateTab("Docs")}
              className="px-3 py-1.5 rounded-lg text-xs text-[#BBCAAF] hover:text-[#DCE5DF] transition-colors"
            >
              Docs
            </button>
          </nav>

          {/* Action cluster */}
          <div className="flex items-center gap-3 min-w-max">
            {/* Live Operational Status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161D1A]/70 border border-[rgba(168,255,178,0.12)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4EDEA3] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4EDEA3]" />
              </span>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#BBCAAF] uppercase tracking-wider">
                ENGINE: <span className="text-[#4EDEA3] font-semibold">OPERATIONAL</span>
              </span>
            </div>

            {/* Live Demo Trigger */}
            <button
              onClick={() => onLaunchStudio("https://github.com/prism-engine/flask-microservice-core")}
              className="hidden sm:inline-flex items-center px-3.5 py-2 rounded-xl bg-[#242C28]/60 hover:bg-[#242C28] text-[#BBCAAF] hover:text-[#DCE5DF] border border-[rgba(168,255,178,0.15)] text-xs font-medium transition-all"
            >
              Live Demo
            </button>

            {/* Launch Audit Studio Primary Action */}
            <button
              onClick={() => onLaunchStudio()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#4EDEA3] text-[#00422B] font-['Space_Grotesk'] text-xs font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] cursor-pointer"
            >
              <span>Launch Audit Studio</span>
              <span className="material-symbols-outlined text-[16px]">bolt</span>
            </button>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#4EDEA3] flex items-center justify-center text-[#003824]">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="w-full pt-28 pb-20">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10">
          
          {/* 1. Header & Headline Badge */}
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#242C28]/80 backdrop-blur-xl shadow-[0_0_25px_rgba(16,185,129,0.18)] mb-6 transition-all hover:bg-[#2F3733] border border-[rgba(168,255,178,0.18)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4EDEA3] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4EDEA3] shadow-[0_0_8px_#4edea3]" />
              </span>
              <span className="font-['JetBrains_Mono'] text-[11px] font-semibold text-[#6FFBBE] uppercase tracking-wider">
                ⚡ NEXT-GEN AST NEURAL REPAIR • POWERING 2.4M+ PRODUCTION REPOSITORIES
              </span>
            </div>

            {/* Grand Title */}
            <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl lg:text-[56px] font-bold text-[#DCE5DF] tracking-tight leading-[1.08] mb-6">
              Predict Defects. Neutralize Vulnerabilities.
              <span className="block mt-2 bg-gradient-to-r from-[#6FFBBE] via-[#4EDEA3] to-[#84D990] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(78,222,163,0.35)]">
                Auto-Synthesize AST Fixes in Realtime.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#BBCAAF] max-w-2xl mx-auto leading-relaxed mb-8">
              PRISM combines deterministic AST static parsing, Radon cyclomatic complexity evaluation, and generative code synthesis to detect logic flaws and rewrite secure pull requests before code merges.
            </p>

            {/* 2. Hero CTA & Action Cluster */}
            <div className="flex flex-wrap items-center justify-center gap-4 w-full mb-8">
              {/* Primary Action */}
              <button
                onClick={() => onLaunchStudio()}
                className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#10B981] text-[#00422B] font-['Space_Grotesk'] text-sm font-bold tracking-wide shadow-[0_0_30px_rgba(16,185,129,0.45)] hover:shadow-[0_0_45px_rgba(78,222,163,0.65)] hover:bg-[#4EDEA3] transition-all duration-300 cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>Analyze Repository Free</span>
                  <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </span>
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </button>

              {/* Secondary Action */}
              <button
                onClick={() => onLaunchStudio("https://github.com/prism-engine/flask-microservice-core")}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#242C28]/80 hover:bg-[#2F3733] text-[#4EDEA3] font-['Space_Grotesk'] text-sm font-semibold backdrop-blur-xl border border-[rgba(168,255,178,0.2)] transition-all duration-200 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#4EDEA3] text-[18px]">bolt</span>
                <span>Try Interactive Demo (Flask Microservice)</span>
              </button>
            </div>

            {/* Quick-Start Command Widget */}
            <div className="w-full max-w-md mx-auto mb-16">
              <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#08100D]/90 backdrop-blur-2xl border border-[rgba(168,255,178,0.15)] shadow-inner">
                <div className="flex items-center gap-2 min-w-0 font-['JetBrains_Mono'] text-xs">
                  <span className="text-[#4EDEA3] select-none font-bold">$</span>
                  <span className="text-[#DCE5DF] truncate">
                    npx prism-ai scan ./services/core --remediate
                  </span>
                </div>
                <button
                  onClick={handleCopyCli}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#242C28]/70 hover:bg-[#2F3733] text-[#BBCAAF] hover:text-[#4EDEA3] transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {copiedCli ? "check" : "content_copy"}
                  </span>
                  <span className="font-['JetBrains_Mono'] text-[11px] font-semibold">
                    {copiedCli ? "COPIED" : "COPY"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Live Animated Interactive Code & Telemetry Showcase */}
          <div className="relative w-full max-w-5xl mx-auto mb-16">
            {/* Holographic Floating Diagnostic Badges */}
            <div className="hidden lg:flex absolute -top-5 -left-8 z-30 items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#2F3733]/90 backdrop-blur-2xl border border-[rgba(168,255,178,0.25)] shadow-[0_8px_25px_rgba(0,0,0,0.6)]">
              <span className="material-symbols-outlined text-[#4EDEA3] text-[18px]">speed</span>
              <div className="flex flex-col text-left">
                <span className="font-['JetBrains_Mono'] text-[11px] font-semibold text-[#DCE5DF]">
                  -64% Cyclomatic Complexity
                </span>
                <span className="font-['Space_Grotesk'] text-[10px] font-bold text-[#4EDEA3] uppercase">
                  Radon Grade A Achieved
                </span>
              </div>
            </div>

            <div className="hidden lg:flex absolute -bottom-6 -right-6 z-30 items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#2F3733]/90 backdrop-blur-2xl border border-[rgba(168,255,178,0.25)] shadow-[0_12px_30px_rgba(0,0,0,0.7)]">
              <div className="w-6 h-6 rounded-full bg-[#4EDEA3]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#4EDEA3] text-[16px]">check</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-['JetBrains_Mono'] text-[11px] font-semibold text-[#DCE5DF]">
                  Zero Regressions Verified
                </span>
                <span className="font-['Space_Grotesk'] text-[10px] font-bold text-[#BBCAAF] uppercase">
                  Formal AST Graph Invariance
                </span>
              </div>
            </div>

            <div className="hidden md:flex absolute top-1/2 -right-8 -translate-y-1/2 z-30 items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#161D1A]/95 backdrop-blur-xl border border-[rgba(168,255,178,0.2)] shadow-lg">
              <span className="material-symbols-outlined text-[#4AE176] text-[18px]">bolt</span>
              <div className="flex flex-col text-left">
                <span className="font-['JetBrains_Mono'] text-[11px] text-[#DCE5DF] font-bold">
                  ⚡ {currentSnippet.latency} Latency
                </span>
                <span className="font-['Space_Grotesk'] text-[10px] font-bold text-[#4AE176] uppercase">
                  Neural Synthesizer
                </span>
              </div>
            </div>

            {/* Centerpiece Frosted Card */}
            <div className="relative rounded-2xl bg-[#08100D]/85 backdrop-blur-2xl border border-[rgba(168,255,178,0.18)] shadow-[0_24px_80px_rgba(0,0,0,0.8),0_0_40px_rgba(16,185,129,0.12)] overflow-hidden">
              {/* Showcase Window Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 bg-[#161D1A]/70 border-b border-[rgba(168,255,178,0.1)]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FFB4AB]/80 inline-block shadow-[0_0_8px_rgba(255,180,171,0.4)]" />
                  <span className="w-3 h-3 rounded-full bg-[#06BB56]/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-[#4EDEA3]/80 inline-block shadow-[0_0_8px_rgba(78,222,163,0.4)]" />
                  
                  {/* File Selector Tabs */}
                  <div className="flex items-center gap-1 ml-3">
                    {sampleSnippets.map((s, idx) => (
                      <button
                        key={s.file}
                        onClick={() => {
                          setActiveSnippetIdx(idx);
                          setPrAccepted(false);
                        }}
                        className={`font-['JetBrains_Mono'] text-xs px-2.5 py-1 rounded transition-colors ${
                          activeSnippetIdx === idx
                            ? "bg-[#242C28] text-[#DCE5DF] font-semibold border border-[rgba(168,255,178,0.2)]"
                            : "text-[#BBCAAF]/70 hover:text-[#DCE5DF]"
                        }`}
                      >
                        {s.file}
                      </button>
                    ))}
                  </div>

                  <span className="font-['Space_Grotesk'] text-[10px] font-bold px-2 py-0.5 rounded bg-[#242C28] text-[#4EDEA3] uppercase ml-1">
                    {currentSnippet.confidence} Confidence
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#19211E] text-[#BBCAAF]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4EDEA3] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4EDEA3]" />
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[11px] uppercase text-[#DCE5DF]">
                      AST Engine: Synthesizing
                    </span>
                  </div>
                </div>
              </div>

              {/* Two-Column Diff Engine View */}
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[rgba(168,255,178,0.1)] bg-[#08100D]/90 font-['JetBrains_Mono'] text-xs">
                
                {/* Vulnerable Left Pane */}
                <div className="p-5 flex flex-col justify-between bg-[#161D1A]/30">
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(255,180,171,0.15)]">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#FFB4AB] text-[18px]">
                          warning
                        </span>
                        <span className="text-[#FFB4AB] font-semibold uppercase text-xs tracking-wider">
                          Vulnerable Code Detected
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#93000A]/40 text-[#FFB4AB] font-['Space_Grotesk'] text-[10px] font-bold uppercase border border-rose-500/30">
                        {currentSnippet.cwe}
                      </span>
                    </div>

                    {/* Vulnerable Code Listing */}
                    <div className="space-y-1 text-[#BBCAAF]/70 leading-relaxed overflow-x-auto">
                      {currentSnippet.defLines.map((line, idx) => (
                        <div
                          key={idx}
                          className={`flex gap-4 ${
                            line.type === "deleted"
                              ? "bg-[#93000A]/20 -mx-5 px-5 py-0.5 border-l-2 border-rose-500"
                              : ""
                          }`}
                        >
                          <span
                            className={`select-none text-right w-6 ${
                              line.type === "deleted"
                                ? "text-[#FFB4AB] font-bold"
                                : "text-[#86948A]/40"
                            }`}
                          >
                            {line.num}
                          </span>
                          <span
                            className={
                              line.type === "deleted"
                                ? "text-[#FFB4AB] font-medium"
                                : "text-[#BBCAAF]"
                            }
                          >
                            {line.code}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vulnerability Diagnostics Detail */}
                  <div className="mt-4 pt-3 p-3 rounded-lg bg-[#242C28]/60 border border-[rgba(168,255,178,0.08)]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-[#FFB4AB] text-[16px]">
                        bug_report
                      </span>
                      <span className="font-['JetBrains_Mono'] text-[11px] text-[#DCE5DF] font-semibold">
                        Taint Vector Identified
                      </span>
                    </div>
                    <p className="text-xs text-[#BBCAAF] font-sans leading-relaxed">
                      {currentSnippet.vulnDesc}
                    </p>
                  </div>
                </div>

                {/* Synthesized Right Pane */}
                <div className="p-5 flex flex-col justify-between bg-[#08100D]/60">
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(168,255,178,0.15)]">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#4EDEA3] text-[18px]">
                          auto_fix_high
                        </span>
                        <span className="text-[#4EDEA3] font-semibold uppercase text-xs tracking-wider">
                          PRISM Instant AST Refactor
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#4EDEA3]/20 text-[#6FFBBE] font-['Space_Grotesk'] text-[10px] font-bold uppercase border border-[#4EDEA3]/40">
                        Auto-Hardened
                      </span>
                    </div>

                    {/* Remediated Code Listing */}
                    <div className="space-y-1 text-[#BBCAAF]/70 leading-relaxed overflow-x-auto">
                      {currentSnippet.remLines.map((line, idx) => (
                        <div
                          key={idx}
                          className={`flex gap-4 ${
                            line.type === "added"
                              ? "bg-[#10B981]/15 -mx-5 px-5 py-0.5 border-l-2 border-[#10B981]"
                              : ""
                          }`}
                        >
                          <span
                            className={`select-none text-right w-6 ${
                              line.type === "added"
                                ? "text-[#4EDEA3] font-bold"
                                : "text-[#86948A]/40"
                            }`}
                          >
                            {line.num}
                          </span>
                          <span
                            className={
                              line.type === "added"
                                ? "text-[#6FFBBE] font-medium"
                                : "text-[#BBCAAF]"
                            }
                          >
                            {line.code}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Synthesis Metadata Pill Bar */}
                  <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[#242C28]/60 border border-[rgba(168,255,178,0.08)]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#4EDEA3] text-[16px]">
                        verified
                      </span>
                      <span className="font-['JetBrains_Mono'] text-[11px] text-[#4EDEA3] font-medium">
                        AST Invariant Rewritten (Safe)
                      </span>
                    </div>
                    
                    <button
                      onClick={handleAcceptPr}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                        prAccepted
                          ? "bg-[#0E281B] text-[#A8FFB2] border border-[#10B981]/50"
                          : "bg-[#10B981] hover:bg-[#4EDEA3] text-[#00422B] shadow-md shadow-emerald-500/20"
                      }`}
                    >
                      <span>{prAccepted ? "PR #481 Merged ✓" : "Accept PR #481"}</span>
                      <span className="material-symbols-outlined text-[14px]">
                        {prAccepted ? "task_alt" : "merge"}
                      </span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* 4. Live Telemetry Metric Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-16">
            {/* Metric 1 */}
            <div className="p-5 rounded-2xl bg-[#08100D]/80 backdrop-blur-xl border border-[rgba(168,255,178,0.12)] shadow-lg hover:bg-[#161D1A]/70 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-2">
                <span className="font-['Space_Grotesk'] text-[10px] font-bold uppercase text-[#BBCAAF]">
                  OWASP Top 10
                </span>
                <span className="material-symbols-outlined text-[#4EDEA3] text-[18px]">
                  verified_user
                </span>
              </div>
              <div className="font-['Space_Grotesk'] text-2xl sm:text-3xl lg:text-[40px] text-[#DCE5DF] tracking-tight font-bold">
                99.2%
              </div>
              <div className="text-xs text-[#BBCAAF]/90 mt-1">
                Precision Benchmark Score
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-5 rounded-2xl bg-[#08100D]/80 backdrop-blur-xl border border-[rgba(168,255,178,0.12)] shadow-lg hover:bg-[#161D1A]/70 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-2">
                <span className="font-['Space_Grotesk'] text-[10px] font-bold uppercase text-[#BBCAAF]">
                  Autonomous Patches
                </span>
                <span className="material-symbols-outlined text-[#4EDEA3] text-[18px]">
                  auto_fix
                </span>
              </div>
              <div className="font-['Space_Grotesk'] text-2xl sm:text-3xl lg:text-[40px] text-[#4EDEA3] tracking-tight font-bold">
                3.4M+
              </div>
              <div className="text-xs text-[#BBCAAF]/90 mt-1">
                Vulnerabilities Neutralized
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-5 rounded-2xl bg-[#08100D]/80 backdrop-blur-xl border border-[rgba(168,255,178,0.12)] shadow-lg hover:bg-[#161D1A]/70 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-2">
                <span className="font-['Space_Grotesk'] text-[10px] font-bold uppercase text-[#BBCAAF]">
                  MTTR Reduction
                </span>
                <span className="material-symbols-outlined text-[#4AE176] text-[18px]">
                  trending_up
                </span>
              </div>
              <div className="font-['Space_Grotesk'] text-2xl sm:text-3xl lg:text-[40px] text-[#DCE5DF] tracking-tight font-bold">
                18x
              </div>
              <div className="text-xs text-[#BBCAAF]/90 mt-1">
                Faster Security Triage Velocity
              </div>
            </div>

            {/* Metric 4 */}
            <div className="p-5 rounded-2xl bg-[#08100D]/80 backdrop-blur-xl border border-[rgba(168,255,178,0.12)] shadow-lg hover:bg-[#161D1A]/70 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-2">
                <span className="font-['Space_Grotesk'] text-[10px] font-bold uppercase text-[#BBCAAF]">
                  Scan Latency
                </span>
                <span className="material-symbols-outlined text-[#4EDEA3] text-[18px]">
                  timer
                </span>
              </div>
              <div className="font-['Space_Grotesk'] text-2xl sm:text-3xl lg:text-[40px] text-[#DCE5DF] tracking-tight font-bold">
                &lt; 400ms
              </div>
              <div className="text-xs text-[#BBCAAF]/90 mt-1">
                Average AST Deep Engine Scan
              </div>
            </div>
          </div>

          {/* 5. Enterprise Trust Bar */}
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
            <span className="font-['Space_Grotesk'] text-[10px] font-bold text-[#BBCAAF]/70 uppercase tracking-widest mb-6">
              TRUSTED BY SECURITY AND ENGINEERING LEADERS AT LEADING HYPER-GROWTH DEV TEAMS
            </span>

            {/* Tech Monochrome Logo Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-12 opacity-75 hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-xs sm:text-sm text-[#BBCAAF]">
                <span className="material-symbols-outlined text-[20px]">code</span>
                <span>Python 3.12</span>
              </div>
              <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-xs sm:text-sm text-[#BBCAAF]">
                <span className="material-symbols-outlined text-[20px]">memory</span>
                <span>Rust AST</span>
              </div>
              <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-xs sm:text-sm text-[#BBCAAF]">
                <span className="material-symbols-outlined text-[20px]">speed</span>
                <span>Go Engine</span>
              </div>
              <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-xs sm:text-sm text-[#BBCAAF]">
                <span className="material-symbols-outlined text-[20px]">javascript</span>
                <span>Node.js</span>
              </div>
              <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-xs sm:text-sm text-[#BBCAAF]">
                <span className="material-symbols-outlined text-[20px]">token</span>
                <span>Kubernetes</span>
              </div>
              <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-xs sm:text-sm text-[#BBCAAF]">
                <span className="material-symbols-outlined text-[20px]">view_in_ar</span>
                <span>Docker CI</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Sovereign Cryptographic Telemetry Footer */}
      <footer className="w-full bg-[#08100D]/90 border-t border-[rgba(168,255,178,0.1)] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[#BBCAAF] text-xs">
            <span>© 2025 PRISM Intelligence Systems Inc. Sovereign cryptographic telemetry.</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#161D1A] border border-[rgba(168,255,178,0.15)] font-['JetBrains_Mono'] text-[11px] text-[#BBCAAF]">
            <span className="material-symbols-outlined text-[#4EDEA3] text-[14px]">
              terminal
            </span>
            <span>AST REWRITE LATENCY: &lt;1.84ms // ACTIVE PARSER: v4.12-PROD</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#BBCAAF]">
            <button
              onClick={() => onNavigateTab("Docs")}
              className="hover:text-[#4EDEA3] transition-colors cursor-pointer"
            >
              Security Advisory
            </button>
            <button
              onClick={() => onNavigateTab("Docs")}
              className="hover:text-[#4EDEA3] transition-colors cursor-pointer"
            >
              Cryptographic Proofs
            </button>
            <button
              onClick={() => onNavigateTab("Benchmarks")}
              className="hover:text-[#4EDEA3] transition-colors cursor-pointer"
            >
              System Status
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
