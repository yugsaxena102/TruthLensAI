import React from "react";
import { ExternalLink, Globe } from "lucide-react";
import type { VerificationSource } from "../services/api";

interface SourceBadgeProps {
  source: VerificationSource;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source }) => {
  // Check if the URL is non-empty and structurally valid
  let isValidUrl = false;
  if (source.url && source.url.trim() !== "") {
    try {
      new URL(source.url);
      isValidUrl = true;
    } catch {
      // Invalid URL format
      isValidUrl = false;
    }
  }

  const baseClasses =
    "group flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 transition-all shadow-sm overflow-hidden relative";

  if (isValidUrl) {
    return (
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClasses} hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800`}
        aria-label={`Open source: ${source.name}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        <div className="p-1.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-500 group-hover:scale-105 transition-transform">
          <Globe size={12} />
        </div>
        <span className="flex-1 truncate z-10">{source.name}</span>
        <ExternalLink size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-zinc-400 transition-all flex-shrink-0 z-10" />
      </a>
    );
  }

  return (
    <span className={`${baseClasses} opacity-80 cursor-default bg-zinc-100/50 dark:bg-zinc-900/50`}>
      <div className="p-1.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-400">
        <Globe size={12} />
      </div>
      <span className="flex-1 truncate text-zinc-500 dark:text-zinc-500">{source.name}</span>
    </span>
  );
};

export default SourceBadge;
