import React, { useEffect, useState } from "react";
import { truthLensApi } from "../services/api";
import type { HistoryItem } from "../services/api";
import { RefreshCw, History, Database } from "lucide-react";

export const HistoryLogs: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await truthLensApi.getHistory();
      setHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-fadeIn">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-zinc-200 dark:border-zinc-800"></div>
          <div className="absolute inset-0 rounded-full border-2 border-t-zinc-900 dark:border-t-zinc-100 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Loading History Logs...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center space-x-3">
            <History size={24} className="text-zinc-500" />
            <span>Verification History</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
            Review detailed record of text audits performed in current session.
          </p>
        </div>
        <button
          onClick={fetchHistory}
          className="btn-secondary self-start"
        >
          <RefreshCw size={14} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* History Table */}
      <div className="premium-card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">Audit Registry Database</h2>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-md border border-zinc-200 dark:border-zinc-700">
            {history.length} Total Records
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
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                  <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400">{item.date}</td>
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
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-400">
                        <Database size={24} />
                      </div>
                      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No news evaluations logged yet.</span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-500">Run a prediction from the dashboard to populate logs.</span>
                    </div>
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
