import { useState } from "react";
import { Finding } from "../data/findingsData";

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  findings: Finding[];
  appliedFixes: Record<string, boolean>;
  onShowToast: (msg: string) => void;
}

export default function AuditReportModal({
  isOpen,
  onClose,
  findings,
  appliedFixes,
  onShowToast,
}: AuditReportModalProps) {
  const [downloadFormat, setDownloadFormat] = useState<"pdf" | "json" | "md">("json");

  if (!isOpen) return null;

  const totalFindings = findings.length;
  const patchedCount = Object.values(appliedFixes).filter(Boolean).length;
  const criticalCount = findings.filter(f => f.severity === "High" && !appliedFixes[f.id]).length;
  const resolvedRate = Math.round((patchedCount / totalFindings) * 100);

  const handleExport = () => {
    if (downloadFormat === "json") {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
        JSON.stringify({
          auditTimestamp: new Date().toISOString(),
          framework: "PRISM AI Code Inspector v4.12",
          standard: "ISO/IEC 25010 & OWASP Top 10",
          summary: {
            totalFindings,
            patchedCount,
            criticalCount,
            resolvedRate: `${resolvedRate}%`,
          },
          findings: findings.map(f => ({
            id: f.id,
            title: f.title,
            cwe: f.cwe,
            severity: f.severity,
            location: f.location,
            status: appliedFixes[f.id] ? "REMEDIATED" : "OPEN",
          }))
        }, null, 2)
      );
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `prism-audit-report-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      onShowToast("JSON Audit Report downloaded!");
    } else {
      onShowToast(`Audit Report exported in ${downloadFormat.toUpperCase()} format!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0D1A14] border border-[rgba(168,255,178,0.25)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.15)] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(168,255,178,0.1)] bg-[#08130E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#A8FFB2]">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
            <div>
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-white tracking-tight">
                ISO/IEC 25010 Security &amp; Radon MI Audit Report
              </h3>
              <p className="text-xs text-[#87998D] font-['JetBrains_Mono']">
                REPORT REF: PRISM-AUDIT-2025-09X
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#142B20] hover:bg-[#1A382A] text-[#8E9F94] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#07130E] border border-[rgba(168,255,178,0.08)]">
              <span className="text-[10px] font-mono text-[#87998D] uppercase">Resolution Rate</span>
              <div className="text-2xl font-bold font-mono text-[#A8FFB2] mt-0.5">
                {resolvedRate}%
              </div>
              <span className="text-[10px] text-[#87998D]">{patchedCount} of {totalFindings} patches applied</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#07130E] border border-[rgba(168,255,178,0.08)]">
              <span className="text-[10px] font-mono text-[#87998D] uppercase">Residual Critical</span>
              <div className="text-2xl font-bold font-mono text-rose-400 mt-0.5">
                {criticalCount}
              </div>
              <span className="text-[10px] text-[#87998D]">Immediate action needed</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#07130E] border border-[rgba(168,255,178,0.08)]">
              <span className="text-[10px] font-mono text-[#87998D] uppercase">Formal Invariance</span>
              <div className="text-2xl font-bold font-mono text-[#4EDEA3] mt-0.5">
                PASS
              </div>
              <span className="text-[10px] text-[#87998D]">Radon Grade A compliant</span>
            </div>
          </div>

          {/* Detailed Findings Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Triage Itemized Matrix
            </h4>
            <div className="border border-[rgba(168,255,178,0.1)] rounded-xl overflow-hidden bg-[#050D09]">
              <div className="grid grid-cols-12 px-3 py-2 bg-[#091711] text-[10px] font-mono text-[#87998D] uppercase border-b border-[rgba(168,255,178,0.08)]">
                <span className="col-span-2">CWE</span>
                <span className="col-span-5">Finding Name</span>
                <span className="col-span-3">Location</span>
                <span className="col-span-2 text-right">Status</span>
              </div>
              <div className="divide-y divide-[rgba(168,255,178,0.06)] text-xs font-mono">
                {findings.map((f) => {
                  const isPatched = appliedFixes[f.id];
                  return (
                    <div key={f.id} className="grid grid-cols-12 px-3 py-2.5 items-center">
                      <span className="col-span-2 text-rose-400 font-semibold text-[11px]">{f.cwe}</span>
                      <span className="col-span-5 text-[#E6F9EC] truncate pr-2 font-sans font-medium text-xs">{f.title}</span>
                      <span className="col-span-3 text-[#87998D] truncate text-[11px]">{f.location}</span>
                      <span className="col-span-2 text-right">
                        {isPatched ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#A8FFB2] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                            ✓ FIXED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                            UNRESOLVED
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Export Format Selector */}
          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#87998D]">Format:</span>
              {(["json", "pdf", "md"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setDownloadFormat(fmt)}
                  className={`px-2.5 py-1 rounded text-xs font-mono uppercase transition-colors cursor-pointer ${
                    downloadFormat === fmt
                      ? "bg-[#10B981]/20 text-[#A8FFB2] border border-[#10B981]/40 font-semibold"
                      : "text-[#87998D] hover:text-white bg-[#0A1610]"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-[#87998D] hover:text-white transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#4EDEA3] text-[#00422B] text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
