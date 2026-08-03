import React from "react";
import { BrainCircuit, Cpu, Network, Sparkles, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { PredictResponse } from "../services/api";

interface ModelComparisonProps {
  result: PredictResponse;
}

const getPredictionStyle = (prediction: "Fake" | "Real") => {
  if (prediction === "Fake") {
    return {
      text: "text-red-600 dark:text-red-400",
      badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50",
      icon: <XCircle size={14} className="mr-1" />
    };
  }
  return {
    text: "text-green-600 dark:text-green-400",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50",
    icon: <CheckCircle2 size={14} className="mr-1" />
  };
};

const ModelCard = ({ 
  name, 
  category, 
  prediction, 
  confidence, 
  inferenceTime, 
  icon: Icon,
  isPrimary = false
}: { 
  name: string; 
  category: string; 
  prediction: "Fake" | "Real"; 
  confidence: number; 
  inferenceTime?: string; 
  icon: React.ElementType;
  isPrimary?: boolean;
}) => {
  const styles = getPredictionStyle(prediction);
  
  return (
    <div className={`flex flex-col p-4 rounded-xl border transition-all duration-300 h-full ${
      isPrimary 
        ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 shadow-md ring-1 ring-blue-500/20" 
        : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700"
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isPrimary ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
            <Icon size={16} />
          </div>
          <div>
            <h4 className={`font-semibold text-sm ${isPrimary ? 'text-blue-900 dark:text-blue-100' : 'text-zinc-900 dark:text-zinc-100'}`}>{name}</h4>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">{category}</span>
          </div>
        </div>
        {isPrimary && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            PRIMARY
          </span>
        )}
      </div>

      <div className="flex-grow flex flex-col justify-end space-y-3 mt-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Prediction</span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-md flex items-center shadow-sm ${styles.badge}`}>
            {styles.icon}
            {prediction.toUpperCase()}
          </span>
        </div>
        
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">Confidence</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{confidence.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${prediction === 'Fake' ? 'bg-red-500' : 'bg-green-500'}`} 
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>

        {inferenceTime && (
          <div className="flex justify-between items-center text-[10px] pt-2 border-t border-zinc-100 dark:border-zinc-800/50 text-zinc-500">
            <span className="flex items-center"><Clock size={10} className="mr-1" /> Time</span>
            <span className="font-mono">{inferenceTime}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const ModelComparison: React.FC<ModelComparisonProps> = ({ result }) => {
  return (
    <div className="premium-card p-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 flex items-center space-x-2">
          <BrainCircuit size={18} className="text-zinc-500" />
          <span>Model Comparison Dashboard</span>
        </h3>
        <p className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700/50">
          Agentic AI Verification remains the primary result
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Traditional ML */}
        {result.mode === "research" && result.xgboost && (
          <ModelCard
            name="XGBoost"
            category="Machine Learning"
            prediction={result.xgboost.prediction}
            confidence={result.xgboost.confidence}
            icon={Cpu}
          />
        )}
        
        {result.mode === "production" && result.model === "xgboost" && (
          <ModelCard
            name="XGBoost"
            category="Machine Learning"
            prediction={result.prediction}
            confidence={result.confidence}
            inferenceTime={result.inference_time}
            icon={Cpu}
          />
        )}

        {/* Transformer Models */}
        {result.mode === "research" && (
          <>
            <ModelCard
              name="BERT"
              category="Transformer"
              prediction={result.bert.prediction}
              confidence={result.bert.confidence}
              icon={Network}
            />
            <ModelCard
              name="DistilBERT"
              category="Transformer"
              prediction={result.distilbert.prediction}
              confidence={result.distilbert.confidence}
              icon={Network}
            />
            <ModelCard
              name="RoBERTa"
              category="Transformer (Selected)"
              prediction={result.roberta.prediction}
              confidence={result.roberta.confidence}
              icon={Sparkles}
              isPrimary={true}
            />
          </>
        )}
        
        {result.mode === "production" && result.model !== "xgboost" && (
          <ModelCard
            name={result.model}
            category="Transformer (Selected)"
            prediction={result.prediction}
            confidence={result.confidence}
            inferenceTime={result.inference_time}
            icon={Sparkles}
            isPrimary={true}
          />
        )}
      </div>

      {result.mode === "research" && (
        <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-900/30 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 flex justify-between items-center">
          <span>
            <strong>Majority Voting Result:</strong>{' '}
            <span className={result.majority_voting === "Fake" ? "text-red-600 dark:text-red-400 font-bold" : "text-green-600 dark:text-green-400 font-bold"}>
              {result.majority_voting}
            </span>
          </span>
          <span>
            Final Prediction:{' '}
            <strong>{result.final_prediction}</strong>
          </span>
        </div>
      )}
      
      {result.mode === "production" && 'keywords' in result && result.keywords && result.keywords.length > 0 && (
         <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-900/30 rounded-lg border border-zinc-200 dark:border-zinc-800">
           <span className="text-[10px] text-zinc-500 block mb-1.5 uppercase tracking-wider font-semibold">Top Attributed Features</span>
           <div className="flex flex-wrap gap-1.5">
             {result.keywords.map((keyword: string, index: number) => (
               <span
                 key={index}
                 className="px-2 py-0.5 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-[10px] font-medium border border-zinc-200 dark:border-zinc-700 shadow-sm"
               >
                 {keyword}
               </span>
             ))}
           </div>
         </div>
      )}
    </div>
  );
};

export default ModelComparison;
