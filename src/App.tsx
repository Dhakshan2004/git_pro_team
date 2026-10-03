import { useState } from "react";
import LandingView from "./components/LandingView";
import AuditCenterView from "./components/AuditCenterView";
import MetricsExplorerView from "./components/MetricsExplorerView";
import DiffInspectorView from "./components/DiffInspectorView";
import AuditReportModal from "./components/AuditReportModal";
import { INITIAL_FINDINGS, Finding } from "./data/findingsData";

export default function App() {
  // Navigation state: 'landing' (Screen 1) | 'audit-center' (Screen 2) | 'metrics-explorer' | 'diff-inspector'
  const [currentScreen, setCurrentScreen] = useState<"landing" | "audit-center" | "metrics-explorer" | "diff-inspector">("landing");
  
  // Active audit studio state
  const [findings] = useState<Finding[]>(INITIAL_FINDINGS);
  const [appliedFixes, setAppliedFixes] = useState<Record<string, boolean>>({});
  const [activeFindingId, setActiveFindingId] = useState<string>("vuln-01");
  const [findingCategory, setFindingCategory] = useState<string>("All");
  const [repoUrl, setRepoUrl] = useState<string>("https://github.com/prism-engine/flask-microservice-core");

  // Modal & Toast states
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3800);
  };

  const handleLaunchStudio = (demoRepoUrl?: string) => {
    if (demoRepoUrl) {
      setRepoUrl(demoRepoUrl);
      triggerToast(`Loaded demo repository: ${demoRepoUrl.split("/").pop()}`);
    }
    setCurrentScreen("audit-center");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplyFix = (id: string) => {
    setAppliedFixes((prev) => ({ ...prev, [id]: true }));
    triggerToast("PRISM AI remediation patch generated & applied to working branch!");
  };

  const handleApplyAllFixes = () => {
    const allFixed: Record<string, boolean> = {};
    findings.forEach((f) => {
      allFixed[f.id] = true;
    });
    setAppliedFixes(allFixed);
    triggerToast("All 5 synthesized AST patches applied to working tree!");
  };

  const handleFilterVulnerabilities = () => {
    setFindingCategory("Critical Security");
    triggerToast("Filtered findings to Critical Security vulnerabilities.");
  };

  return (
    <div className="min-h-screen bg-[#070D0A] text-[#DCE5DF] font-sans relative selection:bg-[#10B981]/30 selection:text-[#A8FFB2]">
      {/* Toast Notification Container */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-[#0D1E16]/95 border border-[#10B981]/40 shadow-2xl backdrop-blur-xl text-sm text-[#E6F9EC] transition-all animate-bounce">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#10B981] animate-ping" />
          <span className="material-symbols-outlined text-[#A8FFB2] text-[20px]">
            check_circle
          </span>
          <span className="font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Screen 1: The PRISM Landing Page */}
      {currentScreen === "landing" ? (
        <LandingView
          onLaunchStudio={handleLaunchStudio}
          onNavigateTab={(tab) => {
            if (tab === "Platform") {
              setCurrentScreen("landing");
            } else if (tab === "Vulnerability Engine" || tab === "Benchmarks") {
              setCurrentScreen("metrics-explorer");
            } else if (tab === "Architecture Diff") {
              setCurrentScreen("diff-inspector");
            } else if (tab === "Docs") {
              setIsReportOpen(true);
            }
          }}
          onShowToast={triggerToast}
        />
      ) : (
        /* Screen 2 & Secondary Screens: PRISM Studio Workspace */
        <div className="relative min-h-screen pb-16 bg-[#070D0A]">
          {/* Deep Obsidian Ambient Glows */}
          <div className="fixed top-0 left-1/4 w-[650px] h-[650px] rounded-full ambient-glow-emerald pointer-events-none -z-10 blur-3xl opacity-75" />
          <div className="fixed top-1/3 right-10 w-[600px] h-[600px] rounded-full ambient-glow-mint pointer-events-none -z-10 blur-3xl opacity-60" />
          <div className="fixed bottom-10 left-1/3 w-[750px] h-[750px] rounded-full ambient-glow-center pointer-events-none -z-10 blur-3xl opacity-50" />

          {/* MAIN CONTAINER */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
            
            {/* 1. GLASSMORPHIC DARK NAVIGATION BAR */}
            <header className="bg-[#0D1A14]/75 backdrop-blur-xl rounded-2xl px-5 py-3.5 shadow-glass-card border border-[rgba(168,255,178,0.12)] flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-40">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentScreen("landing")}
                  className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981]/20 to-[#059669]/35 border border-[#10B981]/30 shadow-inner group cursor-pointer"
                  title="Return to PRISM Landing Page"
                >
                  <svg
                    className="w-6 h-6 text-[#A8FFB2] transition-transform duration-500 group-hover:rotate-12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <polygon points="12 2 22 20 2 20" strokeLinejoin="round" />
                    <line
                      x1="12"
                      y1="2"
                      x2="12"
                      y2="20"
                      strokeDasharray="2 2"
                      stroke="rgba(168, 255, 178, 0.6)"
                    />
                    <circle cx="12" cy="11" r="2.5" fill="#10B981" />
                  </svg>
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4EDEA3]" />
                  </span>
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => setCurrentScreen("landing")}
                      className="font-extrabold tracking-wider text-white text-lg font-['Space_Grotesk'] cursor-pointer hover:text-[#A8FFB2] transition-colors"
                    >
                      PRISM
                    </span>
                    <span className="text-[11px] font-mono tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#A8FFB2] border border-emerald-500/25 font-semibold">
                      AI CODE INSPECTOR
                    </span>
                  </div>
                  <p className="text-xs text-[#87998D] tracking-tight">
                    Defect Prediction &amp; Vulnerability Remediation
                  </p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="flex items-center p-1 rounded-full bg-[#08130E] border border-[rgba(168,255,178,0.1)] shadow-inner">
                <button
                  onClick={() => setCurrentScreen("audit-center")}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                    currentScreen === "audit-center"
                      ? "bg-[#142B20] text-[#A8FFB2] shadow-sm border border-[#10B981]/30 font-semibold"
                      : "text-[#8E9F94] hover:text-white hover:bg-white/5"
                  }`}
                >
                  Audit Center
                </button>
                <button
                  onClick={() => setCurrentScreen("metrics-explorer")}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                    currentScreen === "metrics-explorer"
                      ? "bg-[#142B20] text-[#A8FFB2] shadow-sm border border-[#10B981]/30 font-semibold"
                      : "text-[#8E9F94] hover:text-white hover:bg-white/5"
                  }`}
                >
                  Metrics Explorer
                </button>
                <button
                  onClick={() => setCurrentScreen("diff-inspector")}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                    currentScreen === "diff-inspector"
                      ? "bg-[#142B20] text-[#A8FFB2] shadow-sm border border-[#10B981]/30 font-semibold"
                      : "text-[#8E9F94] hover:text-white hover:bg-white/5"
                  }`}
                >
                  Diff Inspector
                </button>
                <button
                  onClick={() => setCurrentScreen("landing")}
                  className="px-4 py-1.5 rounded-full text-xs font-medium text-[#8E9F94] hover:text-[#4EDEA3] transition-colors cursor-pointer"
                  title="View Landing Page Presentation"
                >
                  Overview Page ↗
                </button>
              </nav>

              {/* Status and Audit CTA */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-xs text-[#A8FFB2] font-mono font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]" />
                  </span>
                  <span>Engine: Operational</span>
                </div>

                <button
                  onClick={() => setIsReportOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0F231A]/80 hover:bg-[#153124] border border-[rgba(168,255,178,0.18)] text-xs font-medium text-[#DCE5DF] transition-all duration-200 group active:scale-95 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#A8FFB2] group-hover:translate-y-0.5 transition-transform">
                    download
                  </span>
                  <span>Audit Report</span>
                </button>
              </div>
            </header>

            {/* SCREEN VIEW SWITCHER */}
            {currentScreen === "audit-center" && (
              <AuditCenterView
                findings={findings}
                appliedFixes={appliedFixes}
                onApplyFix={handleApplyFix}
                onShowToast={triggerToast}
                activeFindingId={activeFindingId}
                onSelectFinding={setActiveFindingId}
                findingCategory={findingCategory}
                onChangeCategory={setFindingCategory}
                onFilterVulnerabilities={handleFilterVulnerabilities}
                repoUrl={repoUrl}
                onChangeRepoUrl={setRepoUrl}
              />
            )}

            {currentScreen === "metrics-explorer" && (
              <MetricsExplorerView
                onBackToAudit={() => setCurrentScreen("audit-center")}
                onShowToast={triggerToast}
              />
            )}

            {currentScreen === "diff-inspector" && (
              <DiffInspectorView
                findings={findings}
                appliedFixes={appliedFixes}
                onApplyAllFixes={handleApplyAllFixes}
                onBackToAudit={() => setCurrentScreen("audit-center")}
                onShowToast={triggerToast}
              />
            )}

          </div>

          {/* Audit Report Modal */}
          <AuditReportModal
            isOpen={isReportOpen}
            onClose={() => setIsReportOpen(false)}
            findings={findings}
            appliedFixes={appliedFixes}
            onShowToast={triggerToast}
          />
        </div>
      )}
    </div>
  );
}
