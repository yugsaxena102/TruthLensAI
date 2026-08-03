import React from "react";
import { Target, Search, FileText, CheckCircle2, AlertTriangle, XCircle, Info, FileSearch } from "lucide-react";
import type { VerificationResponse } from "../services/api";
import { SourceBadge } from "./SourceBadge";

interface VerificationPanelProps {
  verification: VerificationResponse;
}

const getVerdictStyles = (verdict: string) => {
  const v = verdict.toLowerCase();

  if (v.includes("verified") || v.includes("true") || v.includes("real")) {
    return {
      container: "from-emerald-500/5 to-emerald-500/10 border-emerald-200/50 dark:border-emerald-900/50",
      badge: "bg-emerald-500 text-white shadow-emerald-500/30 border border-emerald-400 dark:border-emerald-600",
      bar: "bg-gradient-to-r from-emerald-400 to-emerald-600",
      icon: "text-emerald-500",
      bgIcon: "bg-emerald-100 dark:bg-emerald-900/30",
      IconComponent: CheckCircle2,
    };
  }

  if (v.includes("false") || v.includes("fake")) {
    return {
      container: "from-red-500/5 to-red-500/10 border-red-200/50 dark:border-red-900/50",
      badge: "bg-red-500 text-white shadow-red-500/30 border border-red-400 dark:border-red-600",
      bar: "bg-gradient-to-r from-red-400 to-red-600",
      icon: "text-red-500",
      bgIcon: "bg-red-100 dark:bg-red-900/30",
      IconComponent: XCircle,
    };
  }

  if (v.includes("misleading") || v.includes("partially")) {
    return {
      container: "from-amber-500/5 to-amber-500/10 border-amber-200/50 dark:border-amber-900/50",
      badge: "bg-amber-500 text-white shadow-amber-500/30 border border-amber-400 dark:border-amber-600",
      bar: "bg-gradient-to-r from-amber-400 to-amber-600",
      icon: "text-amber-500",
      bgIcon: "bg-amber-100 dark:bg-amber-900/30",
      IconComponent: AlertTriangle,
    };
  }

  return {
    container: "from-zinc-500/5 to-zinc-500/10 border-zinc-200/50 dark:border-zinc-800/50",
    badge: "bg-zinc-600 text-white shadow-zinc-500/30 border border-zinc-500",
    bar: "bg-gradient-to-r from-zinc-400 to-zinc-600",
    icon: "text-zinc-500",
    bgIcon: "bg-zinc-100 dark:bg-zinc-800",
    IconComponent: Info,
  };
};

export const VerificationPanel: React.FC<VerificationPanelProps> = ({ verification }) => {
  const styles = getVerdictStyles(verification.verdict);
  const VerdictIcon = styles.IconComponent;

  return (
    <div className={`premium-card p-6 lg:p-10 animate-fadeIn transition-colors bg-gradient-to-br ${styles.container} backdrop-blur-xl relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 dark:bg-white/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>

      <div className="space-y-8 relative z-10">
        
        {/* 1. Agentic AI Verification (Verdict) */}
        <div className="bg-zinc-50/80 dark:bg-zinc-900/80 p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm flex items-center gap-5 relative overflow-hidden">
          <div className={`p-3.5 rounded-xl ${styles.bgIcon} ${styles.icon}`}>
            <VerdictIcon size={28} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block mb-1">
              Agentic AI Verification
            </span>
            <span className={`inline-flex items-center text-sm font-bold uppercase px-3 py-1 rounded-md shadow-sm ${styles.badge} tracking-wider`}>
              {verification.verdict}
            </span>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-zinc-200 via-zinc-200 to-transparent dark:from-zinc-800 dark:via-zinc-800 dark:to-transparent opacity-70"></div>

        <div className="flex flex-col gap-8">
          
          {/* 5. Confidence */}
          <div className="bg-zinc-50/80 dark:bg-zinc-900/80 p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-end mb-3">
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center">
                <Target size={14} className="mr-1.5" />
                Agentic Confidence
              </span>
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-none">
                {verification.confidence}%
              </span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-3 shadow-inner overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${styles.bar} relative overflow-hidden`}
                style={{ width: `${Math.min(verification.confidence, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
          </div>

          {/* 2. Verification Summary */}
          <div>
            <h4 className="flex items-center text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-widest mb-3">
              <FileText size={16} className="mr-2 text-zinc-500" />
              Verification Summary
            </h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50/50 dark:bg-zinc-900/50 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              {verification.summary}
            </p>
          </div>

          {/* 4. Reasoning */}
          <div>
            <h4 className="flex items-center text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-widest mb-3">
              <Search size={16} className="mr-2 text-zinc-500" />
              Reasoning Process
            </h4>
            <div className="bg-zinc-50/80 dark:bg-zinc-900/80 p-6 rounded-2xl border-l-4 border-l-zinc-500 border-y border-y-zinc-200 border-r border-r-zinc-200 dark:border-y-zinc-800 dark:border-r-zinc-800 shadow-sm relative">
              <div className="absolute top-4 right-4 text-zinc-200 dark:text-zinc-800">
                <FileSearch size={36} />
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line relative z-10">
                {verification.reasoning}
              </p>
            </div>
          </div>

          {/* 3. Trusted Sources */}
          {verification.sources.length > 0 && (
            <div className="flex flex-col">
              <h4 className="flex items-center text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-widest mb-3">
                <span className="flex items-center justify-center bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 rounded-full w-5 h-5 mr-2 text-[10px] shadow-sm">
                  {verification.sources.length}
                </span>
                Trusted Sources
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {verification.sources.map((source, index) => (
                  <SourceBadge key={index} source={source} />
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default VerificationPanel;
