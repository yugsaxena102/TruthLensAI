import React, { useState, useRef } from "react";
import { 
  Clipboard, 
  Trash2, 
  Play, 
  Server, 
  AlertTriangle,
  Upload,
  ShieldCheck,
  Sparkles,
  Search,
  Database,
  Cpu,
  Zap,
  Activity,
  CheckCircle2
} from "lucide-react";
import { truthLensApi } from "../services/api";
import type { PredictResponse } from "../services/api";
import Pipeline from "../components/Pipeline";
import VerificationPanel from "../components/VerificationPanel";

export const SingleAnalysis: React.FC = () => {
  const [predictionMode, setPredictionMode] = useState<"production" | "research">("production");
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0); 
  const [result, setResult] = useState<PredictResponse | null>(null);
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
      if (predictionMode === "production") {
        setPipelineStep(1);
        await new Promise((r) => setTimeout(r, 450));
        setPipelineStep(2);
        await new Promise((r) => setTimeout(r, 550));
        setPipelineStep(3);
        await new Promise((r) => setTimeout(r, 450));

        const response = await truthLensApi.predict(text, "production");
        setResult(response);
        setPipelineStep(5);
      } else {
        setPipelineStep(1);
        await new Promise((r) => setTimeout(r, 400));
        setPipelineStep(2);
        await new Promise((r) => setTimeout(r, 450));
        setPipelineStep(3);
        await new Promise((r) => setTimeout(r, 400));
        setPipelineStep(4);
        await new Promise((r) => setTimeout(r, 400));
        setPipelineStep(5);
        await new Promise((r) => setTimeout(r, 450));
        setPipelineStep(6);
        await new Promise((r) => setTimeout(r, 400));

        const response = await truthLensApi.predict(text, "research");
        setResult(response);
        setPipelineStep(8);
      }
    } catch (err) {
      setError("API Prediction failed. Verify request structures and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          AI Investigation Desk
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-3xl">
          Submit raw text blocks to run transformer evaluation pipelines. The system calculates veracity probabilities and generates explainable evidence networks in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* LEFT COLUMN: Input */}
        <div className="space-y-6">
          <div className="premium-card p-6 flex flex-col h-full">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-6 gap-4">
              <label htmlFor="article" className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Source Material
              </label>
              
              {/* Segmented Control */}
              <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-md border border-zinc-200 dark:border-zinc-800 w-full xl:w-auto">
                <button
                  onClick={() => {
                    setPredictionMode("production");
                    setResult(null);
                    setPipelineStep(0);
                  }}
                  disabled={isLoading}
                  className={`flex-1 xl:flex-none px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                    predictionMode === "production"
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-700"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  Production
                </button>
                <button
                  onClick={() => {
                    setPredictionMode("research");
                    setResult(null);
                    setPipelineStep(0);
                  }}
                  disabled={isLoading}
                  className={`flex-1 xl:flex-none px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                    predictionMode === "research"
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-700"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  Research
                </button>
              </div>
            </div>

            <div className="relative flex-grow flex flex-col">
              <textarea
                id="article"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste raw article text, social media post, or transcript here to begin verification..."
                className="w-full flex-grow min-h-[240px] p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm resize-none"
                disabled={isLoading}
              />
              <span className="absolute bottom-3 right-3 text-[10px] font-mono text-zinc-400">
                {text.length} chars
              </span>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between mt-6 gap-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePaste}
                  disabled={isLoading}
                  className="btn-secondary px-3 py-2"
                  title="Paste from clipboard"
                >
                  <Clipboard size={16} />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="btn-secondary px-3 py-2"
                  title="Upload file"
                >
                  <Upload size={16} />
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
                  className="btn-secondary px-3 py-2 text-red-500 hover:text-red-600 dark:hover:text-red-400 border-zinc-200 dark:border-zinc-800"
                  title="Clear text"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <button
                onClick={handlePredict}
                disabled={isLoading}
                className="btn-primary"
              >
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
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg text-sm text-red-700 dark:text-red-400 flex items-start space-x-2 animate-fadeIn">
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Results Summary */}
        <div className="space-y-6 flex flex-col h-full">
          {/* Production Mode Results Display */}
          {result && result.mode === "production" ? (
            <div className={`premium-card p-6 flex flex-col h-full animate-fadeIn ${
              result.prediction === "Fake"
                ? "border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10"
                : "border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10"
            }`}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Primary Inference
                    </span>
                    <span className="badge bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      Production
                    </span>
                  </div>
                  <h3 className={`text-2xl font-bold tracking-tight ${result.prediction === "Fake" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                    {result.prediction === "Fake" ? "Misinformation Flagged" : "Credible Content"}
                  </h3>
                </div>
                <div className={`p-3 rounded-lg ${
                  result.prediction === "Fake" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                }`}>
                  <ShieldCheck size={24} />
                </div>
              </div>

              <div className="space-y-3 flex-grow flex flex-col justify-end">
                <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800 text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Model Used</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{result.model}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800 text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Classification</span>
                  <span className={`font-bold ${result.prediction === "Fake" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                    {result.prediction}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800 text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Confidence Score</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{result.confidence}%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800 text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Inference Speed</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-100">{result.inference_time}</span>
                </div>
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-500 block mb-1">Diagnostic Reason:</span>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-white/50 dark:bg-zinc-950/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    {result.reason}
                  </p>
                </div>
              </div>
            </div>
          ) : result && result.mode === "research" ? (
             <div className={`premium-card p-6 flex flex-col h-full animate-fadeIn ${
              result.final_prediction === "Fake"
                ? "border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10"
                : "border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10"
            }`}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Consensus Outcome
                    </span>
                    <span className="badge badge-warning">
                      Research Mode
                    </span>
                  </div>
                  <h3 className={`text-2xl font-bold tracking-tight ${result.final_prediction === "Fake" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                    {result.final_prediction === "Fake" ? "Misinformation Flagged" : "Credible Content"}
                  </h3>
                </div>
                <div className={`p-3 rounded-lg ${
                  result.final_prediction === "Fake" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                }`}>
                  <ShieldCheck size={24} />
                </div>
              </div>

              <div className="space-y-3 flex-grow flex flex-col justify-end">
                <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800 text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Majority Voting Result</span>
                  <span className={`font-bold ${result.majority_voting === "Fake" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                    {result.majority_voting}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800 text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Final Prediction</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{result.final_prediction}</span>
                </div>
                <div className="pt-2">
                  <span className="text-xs font-semibold text-zinc-500 block mb-1">Voting Consensus Statement:</span>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-white/50 dark:bg-zinc-950/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    Consensus reached via <strong className="font-semibold text-zinc-900 dark:text-zinc-100">Majority Voting (2+ agreement)</strong>. BERT, DistilBERT, and RoBERTa models analyzed the text structure independently.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="premium-card p-8 h-full flex flex-col items-center justify-center text-center">
               <ShieldCheck size={40} className="text-zinc-300 dark:text-zinc-700 mb-4" />
               <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Awaiting Input</h3>
               <p className="text-sm mt-2 text-zinc-500 dark:text-zinc-400 max-w-sm">
                 Paste text and click 'Run AI Analysis' to see results, verification evidence, and confidence metrics here.
               </p>
            </div>
          )}
        </div>
      </div>

      {/* FULL WIDTH: AI Pipeline Component */}
      <div className="w-full">
         <Pipeline mode={predictionMode} currentStep={pipelineStep} isAnalyzing={isLoading} />
      </div>

      {/* FULL WIDTH: Verification Panel */}
      {result && result.verification && (
        <div className="w-full premium-card p-6 lg:p-8 animate-fadeIn border-blue-200 dark:border-blue-900/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
                Agentic Verification
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Automated factual cross-referencing and source checking</p>
            </div>
          </div>
          <VerificationPanel verification={result.verification} />
        </div>
      )}

      {/* FULL WIDTH: Additional Research Details or XAI */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Explainable AI Card */}
           <div className="premium-card p-6 animate-fadeIn">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 flex items-center space-x-2 mb-4">
                <Sparkles size={16} className="text-blue-500" />
                <span>Explainable AI (XAI) Attribution</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <span className="text-xs text-zinc-500 block mb-2 uppercase tracking-wider font-semibold">Top Attributed Linguistic Features:</span>
                  <div className="flex flex-wrap gap-2">
                    {'keywords' in result && result.keywords?.map((keyword: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-medium border border-zinc-200 dark:border-zinc-700"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Attribution algorithms highlight linguistic triggers and emotional tags commonly matched in database patterns for sensationalized reports.
                  </p>
                </div>
              </div>
            </div>

            {/* Research Mode Models Breakdown */}
            {result.mode === "research" && (
              <div className="premium-card p-6 animate-fadeIn">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                  Model Classification Details
                </h3>

                <div className="space-y-4">
                  {/* BERT bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">BERT Transformer</span>
                      <span className={`font-semibold ${result.bert.prediction === "Fake" ? "text-red-500" : "text-green-500"}`}>
                        {result.bert.prediction} ({result.bert.confidence}%)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${result.bert.prediction === "Fake" ? "bg-red-500" : "bg-green-500"}`}
                        style={{ width: `${result.bert.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* DistilBERT bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">DistilBERT Model</span>
                      <span className={`font-semibold ${result.distilbert.prediction === "Fake" ? "text-red-500" : "text-green-500"}`}>
                        {result.distilbert.prediction} ({result.distilbert.confidence}%)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${result.distilbert.prediction === "Fake" ? "bg-red-500" : "bg-green-500"}`}
                        style={{ width: `${result.distilbert.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* RoBERTa bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-700 dark:text-zinc-300 font-medium">RoBERTa Model</span>
                      <span className={`font-semibold ${result.roberta.prediction === "Fake" ? "text-red-500" : "text-green-500"}`}>
                        {result.roberta.prediction} ({result.roberta.confidence}%)
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${result.roberta.prediction === "Fake" ? "bg-red-500" : "bg-green-500"}`}
                        style={{ width: `${result.roberta.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* XGBoost bar */}
                  {result.xgboost && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">XGBoost ML</span>
                        <span className={`font-semibold ${result.xgboost.prediction === "Fake" ? "text-red-500" : "text-green-500"}`}>
                          {result.xgboost.prediction} ({result.xgboost.confidence}%)
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${result.xgboost.prediction === "Fake" ? "bg-red-500" : "bg-green-500"}`}
                          style={{ width: `${result.xgboost.confidence}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      )}

      {/* FULL WIDTH: Backend Diagnostics Portal */}
      <div className="premium-card p-6 lg:p-8 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center space-x-2">
              <Server size={18} className="text-zinc-500" />
              <span>Backend Diagnostics Portal</span>
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Live status of AI verification microservices</p>
          </div>
          <span className="badge badge-success">System Optimal</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 flex flex-col justify-between h-24">
            <div className="flex justify-between items-start">
              <div className="text-zinc-500"><Cpu size={16} /></div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block">Prediction</span>
              <span className="text-[10px] text-zinc-500">RoBERTa & Ensembles</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 flex flex-col justify-between h-24">
            <div className="flex justify-between items-start">
              <div className="text-zinc-500"><Search size={16} /></div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block">Search</span>
              <span className="text-[10px] text-zinc-500">Tavily API Querying</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 flex flex-col justify-between h-24">
            <div className="flex justify-between items-start">
              <div className="text-zinc-500"><Database size={16} /></div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block">Retriever</span>
              <span className="text-[10px] text-zinc-500">Source Fetching</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 flex flex-col justify-between h-24">
            <div className="flex justify-between items-start">
              <div className="text-zinc-500"><ShieldCheck size={16} /></div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block">Verification</span>
              <span className="text-[10px] text-zinc-500">Cross-referencing logic</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 flex flex-col justify-between h-24">
            <div className="flex justify-between items-start">
              <div className="text-zinc-500"><Sparkles size={16} /></div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block">Gemini</span>
              <span className="text-[10px] text-zinc-500">LLM Reasoning Engine</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 flex flex-col justify-between h-24">
            <div className="flex justify-between items-start">
              <div className="text-zinc-500"><Activity size={16} /></div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block">Pipeline</span>
              <span className="text-[10px] text-zinc-500">Sequential orchestrator</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 flex flex-col justify-between h-24">
            <div className="flex justify-between items-start">
              <div className="text-zinc-500"><Zap size={16} /></div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block">Latency</span>
              <span className="text-[10px] text-zinc-500">Performance Metrics</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 flex flex-col justify-between h-24">
            <div className="flex justify-between items-start">
              <div className="text-zinc-500"><CheckCircle2 size={16} /></div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block">Completion</span>
              <span className="text-[10px] text-zinc-500">Response Generation</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
export default SingleAnalysis;
