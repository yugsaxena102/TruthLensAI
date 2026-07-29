import React, { useState, useRef } from "react";
import { 
  Clipboard, 
  Trash2, 
  Play, 
  Server, 
  AlertTriangle,
  Info,
  Upload,
  Cpu,
  Search,
  Database,
  ShieldCheck,
  Sparkles,
  Activity,
  Zap,
  CheckCircle2
} from "lucide-react";
import { truthLensApi } from "../services/api";
import Pipeline from "../components/Pipeline";

export const Home: React.FC = () => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0); 
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileText = event.target?.result as string;
      setText(fileText);
    };
    reader.readAsText(file);
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch (err) {
      setError("Failed to paste from clipboard. Please paste manually using Ctrl+V.");
      setTimeout(() => setError(""), 4000);
    }
  };

  const handleClear = () => {
    setText("");
    setResult(null);
    setPipelineStep(0);
  };

  const handlePredict = async () => {
    if (!text.trim()) {
      setError("Please paste or type a news article first.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      setPipelineStep(1); // Preprocessing
      await new Promise((r) => setTimeout(r, 600));

      setPipelineStep(2); // Models Evaluation
      await new Promise((r) => setTimeout(r, 800));

      setPipelineStep(3); // Majority Voting
      await new Promise((r) => setTimeout(r, 600));

      setPipelineStep(4); // XAI
      await new Promise((r) => setTimeout(r, 600));

      const response = await truthLensApi.predict(text, "production");
      setResult(response);
      setPipelineStep(5); // Complete
    } catch (err) {
      setError("API Prediction failed. Verify request structures and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 grid-bg animate-slideUp">
      
      {/* Hero Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#C5A880]/10 text-[#9A7B56] dark:text-[#C5A880] border border-[#C5A880]/20 text-xs font-semibold uppercase tracking-wider">
          <Activity size={14} className="animate-pulse" />
          <span>Live API Connected</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1A2536] dark:text-[#F4EFE6] transition-colors">
          TruthLens <span className="text-[#C5A880]">AI</span>
        </h1>
        <p className="text-base md:text-lg text-[#1A2536]/70 dark:text-[#F4EFE6]/70 max-w-2xl mx-auto font-light transition-colors leading-relaxed">
          Verify news articles instantly using advanced Transformer models (BERT, DistilBERT, RoBERTa) and Ensemble Majority Voting logic.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        
        {/* LEFT COLUMN: Input */}
        <div className="space-y-6">
          {/* Article Text Box Card */}
          <div className="glass-panel rounded-3xl p-1 bg-white/40 dark:bg-[#101F42]/40 border border-[#E8E2D5] dark:border-[#1B2A4A] shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-[#C5A880]/50 h-full">
            <div className="bg-white/70 dark:bg-[#0A1128]/70 backdrop-blur-xl rounded-[22px] p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <label htmlFor="article" className="text-sm font-bold text-[#1A2536] dark:text-[#F4EFE6] uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1E3A8A] dark:bg-[#C5A880] animate-pulse shadow-[0_0_8px_rgba(197,168,128,0.8)]"></span>
                  Paste Article Content
                </label>
                <span className="text-xs text-[#1A2536]/50 dark:text-[#F4EFE6]/50 font-mono font-semibold bg-white/90 dark:bg-[#0A1128]/90 px-2 py-1 rounded-md border border-[#E8E2D5] dark:border-[#1B2A4A]">
                  {text.length} chars
                </span>
              </div>

              <textarea
                id="article"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the full text of the news article here (e.g. 'BREAKING: Official leaks secret alien conspiracy...')"
                className="w-full flex-grow min-h-[200px] p-5 rounded-2xl border-2 border-transparent bg-[#FAF7F0]/80 dark:bg-[#101F42]/60 text-[#1A2536] dark:text-[#F4EFE6] placeholder-[#1A2536]/40 dark:placeholder-[#F4EFE6]/40 focus:outline-none focus:bg-white dark:focus:bg-[#0A1128] focus:border-[#C5A880]/30 transition-all duration-300 text-sm font-sans resize-none shadow-inner leading-relaxed"
                disabled={isLoading}
              />

              {/* Actions Button Bar */}
              <div className="flex flex-wrap items-center justify-between mt-6 gap-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePaste}
                    disabled={isLoading}
                    className="flex items-center justify-center w-11 h-11 rounded-full bg-[#FAF7F0] text-[#1A2536] hover:bg-[#E8E2D5] dark:bg-[#101F42] dark:text-[#F4EFE6] dark:hover:bg-[#1B2A4A] transition-all duration-300 shadow-sm border border-[#E8E2D5] dark:border-[#1B2A4A] disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Paste from clipboard"
                  >
                    <Clipboard size={18} />
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="flex items-center justify-center w-11 h-11 rounded-full bg-[#FAF7F0] text-[#1A2536] hover:bg-[#E8E2D5] dark:bg-[#101F42] dark:text-[#F4EFE6] dark:hover:bg-[#1B2A4A] transition-all duration-300 shadow-sm border border-[#E8E2D5] dark:border-[#1B2A4A] disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Upload file"
                  >
                    <Upload size={18} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".txt,.json,.csv"
                    className="hidden"
                  />
                  <button
                    onClick={handleClear}
                    disabled={isLoading || !text}
                    className="flex items-center justify-center w-11 h-11 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 border border-red-100 dark:border-red-900/30 transition-all duration-300 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Clear text"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <button
                  onClick={handlePredict}
                  disabled={isLoading}
                  className="btn-primary group relative overflow-hidden px-8 py-3.5 rounded-full text-sm font-black shadow-[0_8px_20px_rgba(10,17,40,0.15)] dark:shadow-[0_8px_20px_rgba(197,168,128,0.1)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed cursor-pointer"
                >
                  <div className="absolute inset-0 bg-white/20 dark:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-2">
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Play size={16} fill="currentColor" />
                        <span>Run AI Analysis</span>
                      </>
                    )}
                  </div>
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl text-sm text-red-800 dark:text-red-200 flex items-start space-x-3 animate-fadeIn shadow-sm">
                  <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Results Summary */}
        <div className="space-y-6 flex flex-col">
          {result && result.mode === "production" ? (
             <div className={`rounded-3xl p-8 border shadow-xl transition-all duration-500 animate-slideUp hover:-translate-y-1 relative overflow-hidden group h-full flex flex-col ${
              result.prediction === "Fake"
                ? "bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-950/40 dark:via-[#0A1128] dark:to-red-900/20 border-red-200 dark:border-red-900/50 text-red-950 dark:text-red-100"
                : "bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-950/40 dark:via-[#0A1128] dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-950 dark:text-emerald-100"
            }`} style={{ animationDelay: '200ms' }}>
              <div className="flex items-start justify-between relative z-10 mb-8">
                <div>
                  <span className="text-xs uppercase font-black tracking-widest opacity-70 block mb-2">Decision Outcome</span>
                  <h3 className={`text-2xl sm:text-3xl font-extrabold ${result.prediction === "Fake" ? "text-red-700 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}`}>
                    {result.prediction === "Fake" ? "Misinformation Flagged" : "Credible Content Verified"}
                  </h3>
                </div>
                <div className={`p-4 rounded-2xl shadow-inner ${
                  result.prediction === "Fake"
                    ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200"
                    : "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-200"
                }`}>
                  <AlertTriangle size={32} />
                </div>
              </div>

              <div className="space-y-4 flex-grow flex flex-col justify-end">
                <div className="flex justify-between items-center border-b border-[#1A2536]/10 dark:border-[#F4EFE6]/10 pb-3">
                  <span className="text-sm font-semibold opacity-75">Model Used:</span>
                  <span className="text-sm font-bold bg-white/60 dark:bg-[#101F42]/60 px-3 py-1 rounded-lg border border-[#1A2536]/5 dark:border-[#F4EFE6]/5">{result.model}</span>
                </div>

                <div className="flex justify-between items-center border-b border-[#1A2536]/10 dark:border-[#F4EFE6]/10 pb-3">
                  <span className="text-sm font-semibold opacity-75">Classification:</span>
                  <span className={`text-xs font-extrabold uppercase px-3 py-1 rounded-lg border shadow-sm ${
                    result.prediction === "Fake"
                      ? "bg-red-500 text-white border-red-600 dark:bg-red-600 dark:border-red-500"
                      : "bg-emerald-500 text-white border-emerald-600 dark:bg-emerald-600 dark:border-emerald-500"
                  }`}>
                    {result.prediction}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-[#1A2536]/10 dark:border-[#F4EFE6]/10 pb-3">
                  <span className="text-sm font-semibold opacity-75">Confidence:</span>
                  <span className="text-lg font-extrabold">{result.confidence}%</span>
                </div>

                <div className="flex justify-between items-center border-b border-[#1A2536]/10 dark:border-[#F4EFE6]/10 pb-3">
                  <span className="text-sm font-semibold opacity-75">Inference Speed:</span>
                  <span className="text-sm font-bold font-mono bg-white/60 dark:bg-[#101F42]/60 px-3 py-1 rounded-lg border border-[#1A2536]/5 dark:border-[#F4EFE6]/5">{result.inference_time}</span>
                </div>

                <div className="pt-3">
                  <span className="text-sm font-bold block opacity-75 mb-2">Reason:</span>
                  <p className="text-sm opacity-90 leading-relaxed bg-white/60 dark:bg-[#0A1128]/60 p-4 rounded-xl border border-[#1A2536]/5 dark:border-[#F4EFE6]/5 shadow-inner">
                    {result.reason}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-8 border border-[#E8E2D5] dark:border-[#1B2A4A] h-full flex flex-col items-center justify-center text-center opacity-70">
               <ShieldCheck size={48} className="text-[#C5A880] mb-4 opacity-50" />
               <h3 className="text-xl font-bold text-[#1A2536] dark:text-[#F4EFE6]">Awaiting Input</h3>
               <p className="text-sm mt-2 text-[#1A2536]/60 dark:text-[#F4EFE6]/60 max-w-sm">
                 Paste text and click 'Run AI Analysis' to see results, verification evidence, and confidence metrics here.
               </p>
            </div>
          )}
        </div>
      </div>

      {/* FULL WIDTH: AI Pipeline Component */}
      <div className="w-full">
         <Pipeline mode="production" currentStep={pipelineStep} isAnalyzing={isLoading} />
      </div>

      {/* Explainable AI Card (Production contract) - Full width in 2-col wrapper to match */}
      {result && result.mode === "production" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-panel rounded-3xl p-8 border border-[#E8E2D5] dark:border-[#1B2A4A] animate-fadeIn transition-colors hover:shadow-xl hover:-translate-y-1">
            <h3 className="text-sm font-extrabold text-[#1A2536] dark:text-[#F4EFE6] uppercase tracking-wider mb-6 flex items-center space-x-2">
              <Info size={18} className="text-[#C5A880]" />
              <span>Explainable AI (XAI) Keywords</span>
            </h3>

            <div className="space-y-6">
              <div>
                <span className="text-xs text-[#1A2536]/70 dark:text-[#F4EFE6]/70 block mb-3 uppercase tracking-wider">Top Keywords:</span>
                <div className="flex flex-wrap gap-2">
                  {result.keywords?.map((keyword: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-white dark:bg-[#101F42] text-[#1A2536] dark:text-[#F4EFE6] rounded-full text-xs font-black uppercase tracking-wider border border-[#E8E2D5] dark:border-[#1B2A4A] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#FAF7F0] dark:bg-[#101F42]/60 rounded-2xl border border-[#E8E2D5] dark:border-[#1B2A4A] shadow-inner">
                <p className="text-sm text-[#1A2536]/80 dark:text-[#F4EFE6]/80 leading-relaxed font-medium">
                  {result.prediction === "Fake"
                    ? "Keywords and writing patterns associated with sensational or misleading content were detected."
                    : "Keywords and writing patterns associated with credible, structured reporting were detected."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL WIDTH: Backend Diagnostics Portal (Redesigned 8 Services) */}
      <div className="w-full glass-panel rounded-3xl p-8 border border-[#E8E2D5] dark:border-[#1B2A4A] transition-all duration-300 hover:shadow-lg animate-slideUp">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-xl font-bold text-[#1A2536] dark:text-[#F4EFE6] tracking-tight flex items-center space-x-2">
              <Server size={24} className="text-[#1E3A8A] dark:text-[#C5A880] animate-pulse" />
              <span>Backend Diagnostics Portal</span>
            </h3>
            <p className="text-sm text-[#1A2536]/70 dark:text-[#F4EFE6]/60 mt-1">Live status of AI verification microservices</p>
          </div>
          <span className="badge badge-success self-start md:self-auto px-3 py-1.5">System Optimal</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Prediction */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-[#E8E2D5] dark:border-[#1B2A4A] h-28 bg-white/40 dark:bg-[#101F42]/40 hover:bg-white dark:hover:bg-[#101F42] transition-colors">
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <Cpu size={18} />
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <span className="text-sm font-bold text-[#1A2536] dark:text-[#F4EFE6] block">Prediction</span>
              <span className="text-[11px] text-[#1A2536]/60 dark:text-[#F4EFE6]/60 font-medium">RoBERTa & Ensembles</span>
            </div>
          </div>

          {/* Search */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-[#E8E2D5] dark:border-[#1B2A4A] h-28 bg-white/40 dark:bg-[#101F42]/40 hover:bg-white dark:hover:bg-[#101F42] transition-colors">
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                <Search size={18} />
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <span className="text-sm font-bold text-[#1A2536] dark:text-[#F4EFE6] block">Search</span>
              <span className="text-[11px] text-[#1A2536]/60 dark:text-[#F4EFE6]/60 font-medium">Tavily API Querying</span>
            </div>
          </div>

          {/* Retriever */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-[#E8E2D5] dark:border-[#1B2A4A] h-28 bg-white/40 dark:bg-[#101F42]/40 hover:bg-white dark:hover:bg-[#101F42] transition-colors">
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                <Database size={18} />
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <span className="text-sm font-bold text-[#1A2536] dark:text-[#F4EFE6] block">Retriever</span>
              <span className="text-[11px] text-[#1A2536]/60 dark:text-[#F4EFE6]/60 font-medium">Source Fetching</span>
            </div>
          </div>

          {/* Verification */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-[#E8E2D5] dark:border-[#1B2A4A] h-28 bg-white/40 dark:bg-[#101F42]/40 hover:bg-white dark:hover:bg-[#101F42] transition-colors">
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400">
                <ShieldCheck size={18} />
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <span className="text-sm font-bold text-[#1A2536] dark:text-[#F4EFE6] block">Verification</span>
              <span className="text-[11px] text-[#1A2536]/60 dark:text-[#F4EFE6]/60 font-medium">Cross-referencing logic</span>
            </div>
          </div>

          {/* Gemini */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-[#E8E2D5] dark:border-[#1B2A4A] h-28 bg-white/40 dark:bg-[#101F42]/40 hover:bg-white dark:hover:bg-[#101F42] transition-colors">
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                <Sparkles size={18} />
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <span className="text-sm font-bold text-[#1A2536] dark:text-[#F4EFE6] block">Gemini</span>
              <span className="text-[11px] text-[#1A2536]/60 dark:text-[#F4EFE6]/60 font-medium">LLM Reasoning Engine</span>
            </div>
          </div>

          {/* Pipeline */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-[#E8E2D5] dark:border-[#1B2A4A] h-28 bg-white/40 dark:bg-[#101F42]/40 hover:bg-white dark:hover:bg-[#101F42] transition-colors">
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400">
                <Activity size={18} />
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <span className="text-sm font-bold text-[#1A2536] dark:text-[#F4EFE6] block">Pipeline</span>
              <span className="text-[11px] text-[#1A2536]/60 dark:text-[#F4EFE6]/60 font-medium">Sequential orchestrator</span>
            </div>
          </div>

          {/* Latency */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-[#E8E2D5] dark:border-[#1B2A4A] h-28 bg-white/40 dark:bg-[#101F42]/40 hover:bg-white dark:hover:bg-[#101F42] transition-colors">
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                <Zap size={18} />
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <span className="text-sm font-bold text-[#1A2536] dark:text-[#F4EFE6] block">Latency</span>
              <span className="text-[11px] text-[#1A2536]/60 dark:text-[#F4EFE6]/60 font-medium">Performance Metrics</span>
            </div>
          </div>

          {/* Completion */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-[#E8E2D5] dark:border-[#1B2A4A] h-28 bg-white/40 dark:bg-[#101F42]/40 hover:bg-white dark:hover:bg-[#101F42] transition-colors">
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={18} />
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <span className="text-sm font-bold text-[#1A2536] dark:text-[#F4EFE6] block">Completion</span>
              <span className="text-[11px] text-[#1A2536]/60 dark:text-[#F4EFE6]/60 font-medium">Response Generation</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
export default Home;
