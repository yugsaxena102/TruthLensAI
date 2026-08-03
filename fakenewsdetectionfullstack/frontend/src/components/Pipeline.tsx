import React from "react";
import { 
  FileText, 
  Settings2, 
  Binary, 
  GitMerge, 
  Eye, 
  CheckCircle,
  Search,
  Database,
  ShieldCheck
} from "lucide-react";

interface PipelineProps {
  currentStep: number;
  isAnalyzing: boolean;
  mode?: "production" | "research";
}

export const Pipeline: React.FC<PipelineProps> = ({ currentStep, isAnalyzing, mode = "production" }) => {
  const productionSteps = [
    { id: 1, title: "Input", subtitle: "Raw Article", icon: FileText, phase: 0 },
    { id: 2, title: "Preprocessing", subtitle: "Tokenization", icon: Settings2, phase: 1 },
    { id: 3, title: "RoBERTa", subtitle: "Primary Model", icon: Binary, phase: 2 },
    { id: 4, title: "Explainable AI", subtitle: "XAI Keywords", icon: Eye, phase: 3 },
    { id: 5, title: "Tavily Search", subtitle: "Query Gen", icon: Search, phase: 3 },
    { id: 6, title: "Evidence", subtitle: "Retrieval", icon: Database, phase: 3 },
    { id: 7, title: "Verification", subtitle: "Gemini AI", icon: ShieldCheck, phase: 3 },
    { id: 8, title: "Final Verdict", subtitle: "Classification", icon: CheckCircle, phase: 4 },
  ];

  const researchSteps = [
    { id: 1, title: "Input", subtitle: "Raw Article", icon: FileText, phase: 0 },
    { id: 2, title: "Preprocessing", subtitle: "Tokenization", icon: Settings2, phase: 1 },
    { id: 3, title: "BERT", subtitle: "Transformer 1", icon: Binary, phase: 2 },
    { id: 4, title: "DistilBERT", subtitle: "Transformer 2", icon: Binary, phase: 3 },
    { id: 5, title: "RoBERTa", subtitle: "Transformer 3", icon: Binary, phase: 4 },
    { id: 6, title: "Voting", subtitle: "Ensemble Logic", icon: GitMerge, phase: 5 },
    { id: 7, title: "Explainable AI", subtitle: "XAI Keywords", icon: Eye, phase: 6 },
    { id: 8, title: "Tavily Search", subtitle: "Query Gen", icon: Search, phase: 6 },
    { id: 9, title: "Evidence", subtitle: "Retrieval", icon: Database, phase: 6 },
    { id: 10, title: "Verification", subtitle: "Gemini AI", icon: ShieldCheck, phase: 6 },
    { id: 11, title: "Verdict", subtitle: "Classification", icon: CheckCircle, phase: 7 },
  ];

  const steps = mode === "production" ? productionSteps : researchSteps;
  const completedTarget = mode === "production" ? 4 : 7;

  return (
    <div className="premium-card p-6 lg:p-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">AI Processing Pipeline</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time execution sequence and agentic reasoning
          </p>
        </div>
        {isAnalyzing && (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
            Running Models...
          </span>
        )}
      </div>

      {/* Pipeline Grid Workflow */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 w-full">
        {steps.map((step) => {
          const Icon = step.icon;
          
          let isCompleted = currentStep > step.phase;
          let isActive = isAnalyzing && currentStep === step.phase;

          if (!isAnalyzing && currentStep === completedTarget + 1) {
            isCompleted = true;
          }

          return (
            <div 
              key={step.id}
              className={`relative flex flex-col p-4 rounded-xl transition-all duration-300 border ${
                isActive
                  ? "bg-white dark:bg-zinc-800 border-blue-500 shadow-lg transform scale-[1.02] z-10"
                  : isCompleted
                  ? "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-300 dark:border-zinc-700"
                  : "bg-transparent border-dashed border-zinc-200 dark:border-zinc-800 opacity-60"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div 
                  className={`p-2 rounded-lg transition-colors duration-300 ${
                    isActive
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                      : isCompleted
                      ? "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
                      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  <Icon size={18} className={isActive ? "animate-pulse" : ""} />
                </div>
                <span className={`text-xs font-bold ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 dark:text-zinc-600'}`}>
                  0{step.id}
                </span>
              </div>
              
              <h4 className={`text-sm font-bold leading-tight ${isActive ? 'text-zinc-900 dark:text-zinc-50' : isCompleted ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-500 dark:text-zinc-500'}`}>
                {step.title}
              </h4>
              <p className={`text-xs mt-1 font-medium ${isActive ? 'text-zinc-600 dark:text-zinc-400' : isCompleted ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-600'}`}>
                {step.subtitle}
              </p>
              
              {isCompleted && !isActive && (
                <div className="absolute top-4 right-4 text-green-500 dark:text-green-400">
                  <CheckCircle size={14} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SYSTEM TERMINAL (macOS Style) */}
      <div className="mt-8 rounded-xl overflow-hidden border border-[#2d2d2d] dark:border-[#1e1e1e] bg-[#1e1e1e] shadow-2xl relative font-mono text-[13px] leading-relaxed tracking-wide">
        
        {/* macOS Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-b from-[#3a3a3a] to-[#2d2d2d] border-b border-[#111]">
          {/* Traffic Lights */}
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] shadow-sm"></div>
          </div>
          {/* Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center pointer-events-none">
            <span className="text-[12px] font-semibold text-[#aaa] tracking-wide">truthlens-ai — bash — 80×24</span>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="p-5 h-48 overflow-y-auto space-y-2.5 text-[#cccccc] selection:bg-[#4d4d4d]">
          <p className="text-[#a6e22e] font-bold mb-3 flex items-center">
            <span className="mr-2 text-[#66d9ef]">user@truthlens ~$</span> ./run_pipeline.sh
          </p>
          
          <p className="text-zinc-100 font-bold mb-3 flex items-center text-[11px] uppercase tracking-wider text-opacity-80">
            <span className="mr-2 text-[#66d9ef]">❯</span> Starting Analysis Pipeline
          </p>

          {!isAnalyzing && currentStep === 0 && (
            <p className="text-[#75715e]">System idle. Ready to analyze news article text...</p>
          )}

          {isAnalyzing && currentStep === 1 && (
            <p className="text-[#66d9ef] flex items-center">
              <span className="animate-spin mr-2">◒</span> <span className="text-[#e6db74] mr-2">[PREPROCESSING]</span> Cleaning text corpus, loading tokenizer...
            </p>
          )}

          {mode === "production" ? (
            <>
              {isAnalyzing && currentStep === 2 && (
                <p className="text-[#66d9ef] flex items-center">
                  <span className="animate-spin mr-2">◒</span> <span className="text-[#e6db74] mr-2">[MODEL]</span> Forwarding RoBERTa embedding matrix weights...
                </p>
              )}
              {isAnalyzing && currentStep === 3 && (
                <>
                  <p className="text-[#66d9ef]"><span className="text-[#fd971f] mr-2">[XAI]</span> Running attribution algorithm...</p>
                  <p className="text-[#f8f8f2]"><span className="text-[#ae81ff] mr-2">[TAVILY]</span> Generating search queries for verification...</p>
                  <p className="text-[#f8f8f2]"><span className="text-[#a6e22e] mr-2">[EVIDENCE]</span> Retrieving trusted sources...</p>
                  <p className="text-[#f92672] flex items-center font-bold">
                    <span className="animate-pulse mr-2">●</span> <span className="mr-2">[GEMINI]</span> Analyzing evidence for final verdict...
                  </p>
                </>
              )}
            </>
          ) : (
            <>
              {isAnalyzing && currentStep === 2 && (
                <p className="text-[#66d9ef] flex items-center"><span className="animate-spin mr-2">◒</span> <span className="text-[#e6db74] mr-2">[MODEL 1]</span> Evaluating BERT transformer model on sequence...</p>
              )}
              {isAnalyzing && currentStep === 3 && (
                <p className="text-[#66d9ef] flex items-center"><span className="animate-spin mr-2">◒</span> <span className="text-[#e6db74] mr-2">[MODEL 2]</span> Running DistilBERT token evaluations...</p>
              )}
              {isAnalyzing && currentStep === 4 && (
                <p className="text-[#66d9ef] flex items-center"><span className="animate-spin mr-2">◒</span> <span className="text-[#e6db74] mr-2">[MODEL 3]</span> Forwarding RoBERTa embedding matrix weights...</p>
              )}
              {isAnalyzing && currentStep === 5 && (
                <p className="text-[#ae81ff] font-bold flex items-center">
                  <span className="animate-pulse mr-2">●</span> <span className="mr-2">[VOTING]</span> Aggregating results. Evaluating consensus...
                </p>
              )}
              {isAnalyzing && currentStep === 6 && (
                <>
                  <p className="text-[#66d9ef]"><span className="text-[#fd971f] mr-2">[XAI]</span> Running SHAP/LIME feature attributions...</p>
                  <p className="text-[#f8f8f2]"><span className="text-[#ae81ff] mr-2">[TAVILY]</span> Generating search queries...</p>
                  <p className="text-[#f8f8f2]"><span className="text-[#a6e22e] mr-2">[EVIDENCE]</span> Retrieving trusted sources...</p>
                  <p className="text-[#f92672] flex items-center font-bold">
                    <span className="animate-pulse mr-2">●</span> <span className="mr-2">[GEMINI]</span> Analyzing evidence for final verdict...
                  </p>
                </>
              )}
            </>
          )}
          {!isAnalyzing && currentStep === completedTarget + 1 && (
            <p className="text-[#a6e22e] font-bold mt-2 flex items-center">
              <CheckCircle size={14} className="mr-2 text-[#a6e22e]" /> <span className="mr-2">[SUCCESS]</span> Analysis completed. Final result loaded and verified.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
export default Pipeline;
