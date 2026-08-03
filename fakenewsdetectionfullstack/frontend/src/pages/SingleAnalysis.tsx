import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  Clipboard, 
  Trash2, 
  Play, 
  Server, 
  AlertTriangle,
  Upload,
  ShieldCheck,
  Search,
  Database,
  Cpu
} from "lucide-react";
import { truthLensApi } from "../services/api";
import type { PredictResponse } from "../services/api";
import Pipeline from "../components/Pipeline";
import VerificationPanel from "../components/VerificationPanel";
import ModelComparison from "../components/ModelComparison";

export const SingleAnalysis: React.FC = () => {
  const location = useLocation();
  const { autoAnalyzeText, mode: autoMode } = location.state || {};

  const [toast, setToast] = useState<"FAKE" | "REAL" | null>(null);

  const [predictionMode, setPredictionMode] = useState<"production" | "research">("production");
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0); 
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoAnalyzeText) {
      setText(autoAnalyzeText);
      const m = autoMode || "production";
      setPredictionMode(m);
      handleAutoPredict(autoAnalyzeText, m);
    }
  }, [autoAnalyzeText, autoMode]);

  const handleAutoPredict = async (autoText: string, pMode: "production" | "research") => {
    setIsLoading(true);
    setError("");
    setResult(null);
    setPipelineStep(0);
    try {
      if (pMode === "production") {
        setPipelineStep(4);
        const response = await truthLensApi.predict(autoText, "production");
        setResult(response);
        setPipelineStep(5);
        notifyPrediction(response.mode === 'production' ? response.prediction : response.final_prediction);
      } else {
        setPipelineStep(7);
        const response = await truthLensApi.predict(autoText, "research");
        setResult(response);
        setPipelineStep(8);
        notifyPrediction(response.mode === 'production' ? response.prediction : response.final_prediction);
      }
    } catch (err) {
      setError("API Prediction failed. Verify request structures and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileText = event.target?.result as string;
      setText(fileText);
      // Auto-resize textarea
      setTimeout(() => {
        const textarea = document.getElementById("article") as HTMLTextAreaElement;
        if (textarea) {
          textarea.style.height = "auto";
          textarea.style.height = `${textarea.scrollHeight}px`;
        }
      }, 0);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
      setTimeout(() => {
        const textarea = document.getElementById("article") as HTMLTextAreaElement;
        if (textarea) {
          textarea.style.height = "auto";
          textarea.style.height = `${textarea.scrollHeight}px`;
        }
      }, 0);
    } catch (err) {
      setError("Failed to paste from clipboard. Please paste manually using Ctrl+V.");
      setTimeout(() => setError(""), 4000);
    }
  };

  const handleClear = () => {
    setText("");
    setResult(null);
    setPipelineStep(0);
    setTimeout(() => {
      const textarea = document.getElementById("article") as HTMLTextAreaElement;
      if (textarea) {
        textarea.style.height = "auto";
      }
    }, 0);
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
        notifyPrediction(response.mode === 'production' ? response.prediction : response.final_prediction);
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
        notifyPrediction(response.mode === 'production' ? response.prediction : response.final_prediction);
      }
    } catch (err) {
      setError("API Prediction failed. Verify request structures and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const notifyPrediction = (prediction: "Fake" | "Real") => {
    // Play a subtle alert sound using AudioContext
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        if (prediction === "Fake") {
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(300, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        } else {
          osc.type = "sine";
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
        }
      }
    } catch (e) {
      // Ignore audio errors
    }

    if (prediction === "Fake") {
      const title = "⚠️ Fake News Alert";
      const options = { body: "High-priority: The analyzed article is classified as FAKE." };
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification(title, options);
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((p) => {
            if (p === "granted") new Notification(title, options);
            else showToast("FAKE");
          });
          return;
        } else {
          showToast("FAKE");
        }
      } else {
        showToast("FAKE");
      }
    } else {
      showToast("REAL");
    }
  };

  const showToast = (type: "FAKE" | "REAL") => {
    setToast(type);
    setTimeout(() => setToast(null), 5000);
  };

  return (
    <div className="space-y-8 animate-fadeIn relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-2xl border flex items-center gap-3 z-50 animate-fadeIn ${
          toast === 'FAKE' 
            ? 'bg-red-50 dark:bg-red-950/90 border-red-200 dark:border-red-900 text-red-900 dark:text-red-100' 
            : 'bg-green-50 dark:bg-green-950/90 border-green-200 dark:border-green-900 text-green-900 dark:text-green-100'
        }`}>
          {toast === 'FAKE' ? (
             <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full text-red-600 dark:text-red-400">
               <AlertTriangle size={24} />
             </div>
          ) : (
             <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full text-green-600 dark:text-green-400">
               <ShieldCheck size={24} />
             </div>
          )}
          <div>
            <h4 className="font-bold text-sm">
              {toast === 'FAKE' ? 'Fake News Alert' : 'Verification Complete'}
            </h4>
            <p className="text-xs opacity-90">
              {toast === 'FAKE' ? 'The article is classified as FAKE.' : 'The article is classified as REAL.'}
            </p>
          </div>
          <button onClick={() => setToast(null)} className="ml-4 opacity-50 hover:opacity-100">
            <Trash2 size={16} className="hidden" /> {/* Using Trash2 as a placeholder, maybe close icon better, but let's just use text or another icon we have imported */}
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>
      )}

      {/* Header Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          AI Investigation Desk
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-3xl">
          Submit raw text blocks to run transformer evaluation pipelines. The system calculates veracity probabilities and generates explainable evidence networks in real-time.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:gap-8 items-stretch w-full">
        
        {/* SECTION: Input */}
        <div className="space-y-6 w-full">
          <div className="premium-card p-6 flex flex-col h-auto max-h-[700px] overflow-y-auto">
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

            <div className="relative flex flex-col">
              <textarea
                id="article"
                value={text}
                onChange={handleTextChange}
                placeholder="Paste raw article text, social media post, or transcript here to begin verification..."
                className="input-premium min-h-[250px] max-h-[500px] overflow-y-auto resize-none transition-none"
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
                  className="btn-secondary px-3 py-2 text-red-500 hover:text-red-600 dark:hover:text-red-400"
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
                    <span>Analyzing... Wait. few minutes for deep analysis...</span>
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

        {/* SECTION: Results Summary */}
        <div className="space-y-6 flex flex-col w-full">
          {result && result.verification ? (
            <VerificationPanel verification={result.verification} />
          ) : (
            <div className="premium-card p-8 min-h-[300px] flex flex-col items-center justify-center text-center">
               <ShieldCheck size={40} className="text-zinc-300 dark:text-zinc-700 mb-4" />
               <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Awaiting Input</h3>
               <p className="text-sm mt-2 text-zinc-500 dark:text-zinc-400 max-w-sm">
                 Paste text and click 'Run AI Analysis' to see Agentic Verification, evidence, and confidence metrics here.
               </p>
            </div>
          )}
        </div>
      </div>

      {/* FULL WIDTH: AI Pipeline Component */}
      <div className="w-full">
         <Pipeline mode={predictionMode} currentStep={pipelineStep} isAnalyzing={isLoading} />
      </div>

      {/* FULL WIDTH: Traditional Models & XAI */}
      {result && <ModelComparison result={result} />}

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
        </div>
      </div>

    </div>
  );
};
export default SingleAnalysis;
