import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { truthLensApi } from "../services/api";
import type { HistoryItem, PredictResponse } from "../services/api";
import { RefreshCw, History, Database, ChevronDown, ChevronUp } from "lucide-react";
import VerificationPanel from "../components/VerificationPanel";
import ModelComparison from "../components/ModelComparison";

export const HistoryLogs: React.FC = () => {
  const location = useLocation();
  const { highlightId, searchQuery } = location.state || {};

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<PredictResponse | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  
  const scrollRef = useRef<HTMLTableRowElement | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await truthLensApi.getHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch history logs:", e);
      setHistory([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (history.length > 0 && highlightId) {
      const itemToExpand = history.find(h => h.id === highlightId);
      if (itemToExpand && expandedId !== highlightId) {
        handleExpand(itemToExpand);
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        window.history.replaceState({}, document.title);
      }
    }
  }, [history, highlightId]);

  const handleExpand = async (item: HistoryItem) => {
    if (expandedId === item.id) {
      setExpandedId(null);
      setExpandedData(null);
      return;
    }
    setExpandedId(item.id);
    setIsExpanding(true);
    setExpandedData(null);
    try {
      const result = await truthLensApi.predict(item.input_text, item.mode);
      setExpandedData(result);
    } catch (e) {
      console.error("Failed to restore full analysis", e);
    } finally {
      setIsExpanding(false);
    }
  };

  const filteredHistory = history.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.input_text.toLowerCase().includes(q) || item.text_snippet.toLowerCase().includes(q);
  });

  // Removed full page loading and error states to render instantly

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center space-x-3">
              <History size={24} className="text-zinc-500" />
              <span>Verification History</span>
            </h1>
            {loading && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-medium uppercase tracking-wider animate-pulse">
                <RefreshCw size={10} className="animate-spin" /> Updating
              </span>
            )}
            {error && !loading && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-medium uppercase tracking-wider">
                <RefreshCw size={10} /> Sync Failed
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
            Review detailed record of text audits performed in current session.
          </p>
        </div>
        <button
          onClick={fetchHistory}
          className="btn-secondary self-start"
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* History Table */}
      <div className="premium-card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">Audit Registry Database</h2>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-md border border-zinc-200 dark:border-zinc-700">
            {filteredHistory.length} Total Records {searchQuery && '(Filtered)'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50/50 dark:bg-zinc-900/50">
              <tr>
                <th className="px-6 py-4 font-semibold text-zinc-500 dark:text-zinc-400 text-xs">Date</th>
                <th className="px-6 py-4 font-semibold text-zinc-500 dark:text-zinc-400 text-xs">Time</th>
                <th className="px-6 py-4 font-semibold text-zinc-500 dark:text-zinc-400 text-xs">Article Excerpt</th>
                <th className="px-6 py-4 font-semibold text-zinc-500 dark:text-zinc-400 text-xs">Mode</th>
                <th className="px-6 py-4 font-semibold text-zinc-500 dark:text-zinc-400 text-xs">Model Used</th>
                <th className="px-6 py-4 font-semibold text-zinc-500 dark:text-zinc-400 text-xs">Prediction</th>
                <th className="px-6 py-4 font-semibold text-zinc-500 dark:text-zinc-400 text-xs">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredHistory.map((item) => (
                <React.Fragment key={item.id}>
                  <tr 
                    ref={item.id === highlightId ? scrollRef : null}
                    onClick={() => handleExpand(item)}
                    className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group cursor-pointer ${expandedId === item.id || item.id === highlightId ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                  >
                    <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                      {expandedId === item.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {item.date}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400">{item.time}</td>
                    <td className="px-6 py-4 text-xs text-zinc-900 dark:text-zinc-100 font-medium max-w-[250px] truncate">{item.text_snippet}</td>
                    <td className="px-6 py-4">
                      <span className="badge bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 capitalize">
                        {item.mode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-zinc-600 dark:text-zinc-400">{item.model_used}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${item.prediction === "Fake" ? "badge-danger" : "badge-success"}`}>
                        {item.prediction}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.confidence}%</td>
                  </tr>
                  {expandedId === item.id && (
                    <tr>
                      <td colSpan={7} className="p-0 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="bg-zinc-50 dark:bg-[#121214] p-6 lg:p-8 animate-fadeIn border-t border-zinc-200 dark:border-zinc-800">
                          {isExpanding ? (
                            <div className="flex items-center justify-center p-8 space-x-3 text-zinc-500">
                              <RefreshCw size={20} className="animate-spin" />
                              <span className="text-sm font-medium">Restoring complete analysis...</span>
                            </div>
                          ) : expandedData ? (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                                <div className="premium-card p-6 flex flex-col h-auto max-h-[600px] overflow-y-auto bg-white dark:bg-[#18181B]">
                                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Source Material
                                  </h3>
                                  <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-none pr-4">
                                    {item.input_text}
                                  </div>
                                </div>
                                <div className="flex flex-col h-auto">
                                  <VerificationPanel verification={expandedData.verification} />
                                </div>
                              </div>
                              <ModelComparison result={expandedData} />
                            </div>
                          ) : (
                            <div className="text-center p-8 text-red-500 text-sm">
                              Failed to restore full analysis for this item.
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-400">
                        <Database size={24} />
                      </div>
                      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No analyses yet.</span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-500">Analyze your first news article to begin building your history.</span>
                    </div>
                  </td>
                </tr>
              )}
              {history.length > 0 && filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No results found for "{searchQuery}".</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default HistoryLogs;
