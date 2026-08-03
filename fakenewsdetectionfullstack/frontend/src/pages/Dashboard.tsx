import React, { useEffect, useState } from "react";
import { 
  FileText, 
  ShieldAlert, 
  TrendingUp, 
  Clock, 
  Cpu, 
  Database, 
  RefreshCw 
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { useNavigate } from "react-router-dom";
import { truthLensApi } from "../services/api";
import type { AnalyticsResponse, HistoryItem } from "../services/api";

const DEFAULT_ANALYTICS: AnalyticsResponse = {
  total_predictions: 0,
  fake_percentage: 0,
  real_percentage: 0,
  average_confidence: 0,
  average_inference_time: 0,
  distribution_pie: {},
  model_performance_bar: {},
  timeline_line: [],
  current_mode: "production"
};

export const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsResponse>(DEFAULT_ANALYTICS);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [analyticsResult, historyResult] = await Promise.allSettled([
        truthLensApi.getAnalytics(),
        truthLensApi.getHistory()
      ]);

      if (analyticsResult.status === 'fulfilled' && analyticsResult.value) {
        setAnalytics(analyticsResult.value);
      } else {
        console.error("Analytics fetch failed:", analyticsResult.status === 'rejected' ? analyticsResult.reason : 'Empty response');
        setError(true);
      }

      if (historyResult.status === 'fulfilled' && historyResult.value) {
        setHistory(Array.isArray(historyResult.value) ? historyResult.value : []);
      } else {
        console.error("History fetch failed:", historyResult.status === 'rejected' ? historyResult.reason : 'Empty response');
        setHistory([]);
      }
    } catch (e) {
      console.error("Unexpected error fetching dashboard data:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const PIE_COLORS = ["#ef4444", "#22c55e"]; // Red vs Green

  const pieData = Object.entries(analytics.distribution_pie).map(([key, val]) => ({
    name: key,
    value: val,
  }));

  const barData = Object.entries(analytics.model_performance_bar).map(([key, val]) => ({
    model: key,
    confidence: val,
  }));

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Overview
            </h2>
            {loading && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-medium uppercase tracking-wider animate-pulse">
                <RefreshCw size={10} className="animate-spin" /> Updating
              </span>
            )}
            {error && !loading && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-medium uppercase tracking-wider">
                <ShieldAlert size={10} /> Live Data Unavailable
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Real-time telemetry and validation precision across classifier models.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="btn-secondary self-start"
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Quick History Access */}
      {history.length > 0 && (() => {
        const latestFake = history.find(item => item.prediction === 'Fake');
        const latestVerification = history[0];

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            {latestFake && (
              <div className="premium-card p-6 border-l-4 border-l-red-500 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert size={14} /> Latest Fake News Alert
                    </span>
                    <span className="text-[10px] text-zinc-500">{latestFake.date}</span>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2 italic mb-4">
                    "{latestFake.text_snippet}"
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/single-analysis', { state: { autoAnalyzeText: latestFake.input_text, mode: latestFake.mode } })}
                  className="btn-primary w-full sm:w-auto bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/50"
                >
                  Continue from last fake news analysis
                </button>
              </div>
            )}
            
            {(!latestFake || latestFake.id !== latestVerification.id) && (
              <div className={`premium-card p-6 border-l-4 ${latestVerification.prediction === 'Fake' ? 'border-l-red-500' : 'border-l-green-500'} flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${latestVerification.prediction === 'Fake' ? 'text-red-500' : 'text-green-500'}`}>
                      <FileText size={14} /> Latest Verification
                    </span>
                    <span className="text-[10px] text-zinc-500">{latestVerification.date}</span>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2 italic mb-4">
                    "{latestVerification.text_snippet}"
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/single-analysis', { state: { autoAnalyzeText: latestVerification.input_text, mode: latestVerification.mode } })}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Reopen latest analysis
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
        
        {/* Total Scans */}
        <div className="premium-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Scans</span>
            <div className="text-zinc-900 dark:text-zinc-100">
              <FileText size={18} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{analytics.total_predictions}</span>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Aggregated workspace scans</span>
          </div>
        </div>

        {/* Fake Rate */}
        <div className="premium-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Fake Rate</span>
            <div className="text-red-500 dark:text-red-400">
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-500">{analytics.fake_percentage}%</span>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Total detected misinformation</span>
          </div>
        </div>

        {/* Avg Confidence */}
        <div className="premium-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Avg Confidence</span>
            <div className="text-green-500 dark:text-green-400">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{analytics.average_confidence}%</span>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Mean model evaluation weight</span>
          </div>
        </div>

        {/* Inference Latency */}
        <div className="premium-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Latency</span>
            <div className="text-blue-500 dark:text-blue-400">
              <Clock size={18} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">180ms</span>
              <span className="badge badge-info">Optimal</span>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Active classification speed</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger-children">
        
        {/* Left Chart: Line Chart */}
        <div className="lg:col-span-2 premium-card p-6 flex flex-col">
          <div className="mb-6 flex flex-col space-y-1">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Classification Trends</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Timeline tracking article classifications</p>
          </div>
          <div className="h-72 w-full flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.timeline_line} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" vertical={false} />
                <XAxis dataKey="date" stroke="currentColor" className="text-zinc-400 dark:text-zinc-500" style={{ fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="currentColor" className="text-zinc-400 dark:text-zinc-500" style={{ fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ 
                    background: "var(--bg-card)", 
                    border: "1px solid var(--border-color)", 
                    borderRadius: "8px", 
                    color: "var(--text-primary)", 
                    fontSize: 12,
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
                  }} 
                  cursor={{ stroke: 'var(--border-color)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 500, paddingTop: "20px" }} />
                <Line type="monotone" dataKey="total" name="Total Predictions" stroke="#71717a" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="fake" name="Fake News" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="real" name="Real News" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Pie Chart */}
        <div className="premium-card p-6 flex flex-col justify-between">
          <div className="mb-6 flex flex-col space-y-1">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Data Distribution</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Categorical division of prediction outputs</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {pieData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)" }} />
                  <Legend wrapperStyle={{ fontSize: 12, fontWeight: 500 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center space-y-2">
                <Database className="mx-auto text-zinc-300 dark:text-zinc-700" size={24} />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">No predictions logged yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Charts Grid - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger-children">
        
        {/* Left Chart: Bar Chart */}
        <div className="lg:col-span-2 premium-card p-6 flex flex-col">
          <div className="mb-6 flex flex-col space-y-1">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Model Confidence Profile</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Comparison of average individual confidence benchmarks</p>
          </div>
          <div className="h-64 w-full flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" vertical={false} />
                <XAxis dataKey="model" stroke="currentColor" className="text-zinc-400 dark:text-zinc-500" style={{ fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis domain={[80, 100]} stroke="currentColor" className="text-zinc-400 dark:text-zinc-500" style={{ fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Average Confidence']} 
                  cursor={{ fill: 'var(--border-color)', opacity: 0.4 }} 
                  contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)" }} 
                />
                <Bar dataKey="confidence" name="Avg Confidence %" radius={[4, 4, 0, 0]}>
                  {barData.map((_, index) => (
                    <Cell key={`cell-${index}`} className="fill-zinc-800 dark:fill-zinc-200" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Active Models List */}
        <div className="premium-card p-6 flex flex-col">
          <div className="mb-6 flex flex-col space-y-1">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 flex items-center space-x-2">
              <Cpu size={16} />
              <span>Active Models</span>
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Current configuration parameters</p>
          </div>

          <div className="space-y-5 mt-2">
            {/* RoBERTa */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
              <div className="space-y-1">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 block">RoBERTa-Fake-v2</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Primary Contextual</span>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <span className="badge badge-success">Active</span>
                <span className="text-[10px] text-zinc-400 font-mono">240ms</span>
              </div>
            </div>

            {/* BERT */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/50">
              <div className="space-y-1">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 block">BERT-Base</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Speed Screening</span>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <span className="badge bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">Idle</span>
                <span className="text-[10px] text-zinc-400 font-mono">120ms</span>
              </div>
            </div>

            {/* GPT-Detector */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 block">GPT-Detector</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Syntactic Evaluation</span>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <span className="badge badge-info">Optimized</span>
                <span className="text-[10px] text-zinc-400 font-mono">195ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Log Table */}
      <div className="premium-card overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Recent Verifications</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Database list of predictions executed in current system sandbox runtime.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50/50 dark:bg-zinc-900/50">
              <tr>
                <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-xs">Date & Time</th>
                <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-xs">Article Excerpt</th>
                <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-xs">Mode</th>
                <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-xs">Model</th>
                <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-xs">Prediction</th>
                <th className="px-6 py-3 font-medium text-zinc-500 dark:text-zinc-400 text-xs text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {history.slice(0, 5).map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400">
                    {item.date} <span className="mx-1">•</span> {item.time}
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-900 dark:text-zinc-100 max-w-[250px] truncate">
                    {item.text_snippet}
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 capitalize">
                      {item.mode}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                    {item.model_used}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${item.prediction === "Fake" ? "badge-danger" : "badge-success"}`}>
                      {item.prediction}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-100 text-right">
                    {item.confidence}%
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No verifications logged yet.
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
export default Dashboard;
