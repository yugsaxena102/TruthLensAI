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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
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
                  ? "bg-white dark:bg-zinc-800 border-blue-500 shadow-md transform scale-[1.02] z-10"
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

      {/* Under-pipeline detail logs */}
      <div className="mt-8 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 shadow-inner group">
        <div className="flex items-center px-4 py-2 border-b border-zinc-800 bg-black/40">
          <div className="flex space-x-1.5 mr-4">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
          </div>
          <p className="text-[10px] font-mono text-zinc-500 tracking-wider">SYSTEM_TERMINAL</p>
        </div>
        <div className="p-5 text-xs font-mono text-zinc-300 h-40 overflow-y-auto space-y-2">
          <p className="text-zinc-100 font-bold mb-3 flex items-center">
            <span className="mr-2 text-blue-500">❯</span> STARTING ANALYSIS PIPELINE
          </p>
          {!isAnalyzing && currentStep === 0 && (
            <p className="text-zinc-500">System idle. Ready to analyze news article text...</p>
          )}
          {isAnalyzing && currentStep === 1 && (
            <p className="text-blue-400 flex items-center">
              <span className="animate-spin mr-2">◒</span> [PREPROCESSING] Cleaning text corpus, loading tokenizer...
            </p>
          )}
          {mode === "production" ? (
            <>
              {isAnalyzing && currentStep === 2 && (
                <p className="text-blue-400 flex items-center">
                  <span className="animate-spin mr-2">◒</span> [MODEL] Forwarding RoBERTa embedding matrix weights...
                </p>
              )}
              {isAnalyzing && currentStep === 3 && (
                <>
                  <p className="text-blue-400">[XAI] Running attribution algorithm...</p>
                  <p className="text-zinc-300">[TAVILY] Generating search queries for verification...</p>
                  <p className="text-zinc-300">[EVIDENCE] Retrieving trusted sources...</p>
                  <p className="text-indigo-400 flex items-center">
                    <span className="animate-pulse mr-2">●</span> [GEMINI] Analyzing evidence for final verdict...
                  </p>
                </>
              )}
            </>
          ) : (
            <>
              {isAnalyzing && currentStep === 2 && (
                <p className="text-blue-400 flex items-center"><span className="animate-spin mr-2">◒</span> [MODEL 1] Evaluating BERT transformer model on sequence...</p>
              )}
              {isAnalyzing && currentStep === 3 && (
                <p className="text-blue-400 flex items-center"><span className="animate-spin mr-2">◒</span> [MODEL 2] Running DistilBERT token evaluations...</p>
              )}
              {isAnalyzing && currentStep === 4 && (
                <p className="text-blue-400 flex items-center"><span className="animate-spin mr-2">◒</span> [MODEL 3] Forwarding RoBERTa embedding matrix weights...</p>
              )}
              {isAnalyzing && currentStep === 5 && (
                <p className="text-indigo-400 font-bold flex items-center">
                  <span className="animate-pulse mr-2">●</span> [VOTING] Aggregating results. Evaluating consensus...
                </p>
              )}
              {isAnalyzing && currentStep === 6 && (
                <>
                  <p className="text-blue-400">[XAI] Running SHAP/LIME feature attributions...</p>
                  <p className="text-zinc-300">[TAVILY] Generating search queries...</p>
                  <p className="text-zinc-300">[EVIDENCE] Retrieving trusted sources...</p>
                  <p className="text-indigo-400 flex items-center">
                    <span className="animate-pulse mr-2">●</span> [GEMINI] Analyzing evidence for final verdict...
                  </p>
                </>
              )}
            </>
          )}
          {!isAnalyzing && currentStep === completedTarget + 1 && (
            <p className="text-green-400 font-bold mt-2 flex items-center">
              <CheckCircle size={14} className="mr-2" /> [SUCCESS] Analysis completed. Final result loaded and verified.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
export default Pipeline;
