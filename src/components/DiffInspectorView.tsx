import { useState } from "react";
import { Finding } from "../data/findingsData";

interface DiffInspectorViewProps {
  findings: Finding[];
  appliedFixes: Record<string, boolean>;
  onApplyAllFixes: () => void;
  onBackToAudit: () => void;
  onShowToast: (msg: string) => void;
}

export default function DiffInspectorView({
  findings,
  appliedFixes,
  onApplyAllFixes,
  onBackToAudit,
  onShowToast,
}: DiffInspectorViewProps) {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [viewMode, setViewMode] = useState<"split" | "unified">("split");
  const [copiedPatch, setCopiedPatch] = useState(false);
  const [prCreated, setPrCreated] = useState(false);

  const activeFinding = findings[selectedFileIdx] || findings[0];

  const handleCopyPatch = () => {
    const patchContent = `--- a/${activeFinding.location}\n+++ b/${activeFinding.location}\n@@ -1,7 +1,7 @@\n${activeFinding.refactoredCode}`;
    navigator.clipboard?.writeText(patchContent);
    setCopiedPatch(true);
    onShowToast("Unified git patch copied to clipboard!");
    setTimeout(() => setCopiedPatch(false), 2000);
  };

  const handleCreatePr = () => {
    setPrCreated(true);
    onShowToast("Pull Request created on branch: prism-ai/patch-remediation (#482)!");
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0D1A14]/80 backdrop-blur-xl border border-[rgba(168,255,178,0.12)] shadow-glass-card">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#A8FFB2] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <span>MULTI-FILE AST SYNTHESIS DIFF INSPECTOR</span>
          </div>
          <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-white">
            Unified Git Tree Remediation Diff
          </h2>
          <p className="text-xs text-[#87998D] mt-1">
            Examine formal AST transformations, verified invariants, and type assertions across modified files.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#08130E] border border-[rgba(168,255,178,0.1)]">
            <button
              onClick={() => setViewMode("split")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                viewMode === "split"
                  ? "bg-[#142B20] text-[#A8FFB2] border border-[#10B981]/30 font-semibold"
                  : "text-[#8E9F94] hover:text-white"
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode("unified")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                viewMode === "unified"
                  ? "bg-[#142B20] text-[#A8FFB2] border border-[#10B981]/30 font-semibold"
                  : "text-[#8E9F94] hover:text-white"
              }`}
            >
              Unified
            </button>
          </div>

          <button
            onClick={handleCopyPatch}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F231A] hover:bg-[#153124] border border-[rgba(168,255,178,0.18)] text-xs text-[#DCE5DF] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-[#A8FFB2]">
              {copiedPatch ? "check" : "content_copy"}
            </span>
            <span>{copiedPatch ? "Copied" : "Copy Patch"}</span>
          </button>

          <button
            onClick={handleCreatePr}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              prCreated
                ? "bg-[#0E281B] text-[#A8FFB2] border border-[#10B981]/50"
                : "bg-[#10B981] hover:bg-[#4EDEA3] text-[#00422B] shadow-emerald-500/25"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {prCreated ? "task_alt" : "merge"}
            </span>
            <span>{prCreated ? "PR #482 Created" : "Create Pull Request"}</span>
          </button>

          <button
            onClick={onBackToAudit}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#142B20] hover:bg-[#1A382A] text-xs font-medium text-[#A8FFB2] border border-[#10B981]/30 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Audit Matrix</span>
          </button>
        </div>
      </div>

      {/* Main Diff Layout: File list sidebar + Diff viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* File List */}
        <div className="lg:col-span-4 bg-[#0D1A14]/80 backdrop-blur-xl rounded-2xl p-4 border border-[rgba(168,255,178,0.12)] space-y-2">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(168,255,178,0.08)]">
            <span className="text-xs font-bold text-white uppercase font-mono">Modified Files</span>
            <span className="text-[11px] font-mono text-[#A8FFB2]">{findings.length} Files</span>
          </div>

          <div className="space-y-1.5">
            {findings.map((item, idx) => {
              const isSelected = selectedFileIdx === idx;
              const isFixed = appliedFixes[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedFileIdx(idx)}
                  className={`w-full p-3 rounded-xl text-left transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-[#142D21] border-[#10B981]/50 text-white shadow-xs"
                      : "bg-[#08130E] hover:bg-[#11241B] border-[rgba(168,255,178,0.06)] text-[#87998D]"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="font-semibold truncate text-[#DCE5DF]">
                      {item.location.split(":")[0]}
                    </span>
                    {isFixed && (
                      <span className="text-[10px] text-[#A8FFB2] bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        Patched
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-rose-400">-{item.linesChanged.removed}</span>
                    <span className="text-[#4EDEA3]">+{item.linesChanged.added} lines</span>
                    <span className="text-[#87998D]">{item.cwe}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={onApplyAllFixes}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#22C55E] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">done_all</span>
              <span>Apply All Synthesized Patches</span>
            </button>
          </div>
        </div>

        {/* Diff Viewport */}
        <div className="lg:col-span-8 bg-[#0D1A14]/80 backdrop-blur-xl rounded-2xl border border-[rgba(168,255,178,0.12)] overflow-hidden shadow-glass-card">
          <div className="flex items-center justify-between px-5 py-3 bg-[#08130E] border-b border-[rgba(168,255,178,0.1)] text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#10B981] text-[18px]">
                description
              </span>
              <span className="text-white font-medium">{activeFinding.location}</span>
              <span className="text-[#A8FFB2] text-[10px] px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/30">
                {activeFinding.cwe}
              </span>
            </div>
            <span className="text-[#87998D] font-mono text-[11px]">
              Branch: <code className="text-[#A8FFB2]">prism-ai/patch-remediation</code>
            </span>
          </div>

          {viewMode === "split" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[rgba(168,255,178,0.1)] text-xs font-mono">
              <div className="p-4 bg-[#140608]/40 overflow-x-auto">
                <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2">
                  Original Defective
                </div>
                <pre className="text-rose-200/90 leading-relaxed whitespace-pre selection:bg-rose-900/60">
                  {activeFinding.originalCode}
                </pre>
              </div>

              <div className="p-4 bg-[#081C13]/50 overflow-x-auto">
                <div className="text-[10px] font-bold text-[#A8FFB2] uppercase tracking-widest mb-2">
                  PRISM Synthesized
                </div>
                <pre className="text-[#C8FCE0] leading-relaxed whitespace-pre selection:bg-emerald-900/60">
                  {activeFinding.refactoredCode}
                </pre>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#050D09] overflow-x-auto text-xs font-mono space-y-1">
              <div className="text-[10px] text-[#87998D] uppercase pb-2 border-b border-[rgba(168,255,178,0.08)]">
                Unified Linear Diff
              </div>
              <div className="text-rose-400 bg-rose-950/30 -mx-4 px-4 py-1 border-l-2 border-rose-500">
                <pre className="whitespace-pre">
                  {activeFinding.originalCode.split("\n").map(l => `-  ${l}`).join("\n")}
                </pre>
              </div>
              <div className="text-[#A8FFB2] bg-emerald-950/30 -mx-4 px-4 py-1 border-l-2 border-[#10B981]">
                <pre className="whitespace-pre">
                  {activeFinding.refactoredCode.split("\n").map(l => `+  ${l}`).join("\n")}
                </pre>
              </div>
            </div>
          )}

          {/* Rationale Footer */}
          <div className="p-4 bg-[#08130E] border-t border-[rgba(168,255,178,0.08)]">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 font-mono">
              Formal Invariant Verification Checks:
            </h4>
            <div className="space-y-1 text-xs text-[#A7C4B5]">
              {activeFinding.rationale.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[#10B981] font-bold">✓</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
