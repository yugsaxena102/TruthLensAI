import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Database, 
  Cpu, 
  FileText, 
  Layers, 
  HelpCircle,
  Sparkles,
  Link2,
  MessageSquare,
  Network,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { truthLensApi } from "../services/api";
import type { HistoryItem } from "../services/api";

export const About: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    truthLensApi.getHistory().then((data) => {
      setHistory(Array.isArray(data) ? data : []);
    }).catch(console.error);
  }, []);

  const handleContinue = (item: HistoryItem) => {
    navigate('/single-analysis', { state: { autoAnalyzeText: item.input_text, mode: item.mode } });
  };

  const mlModels = [
    { name: "XGBoost", description: "eXtreme Gradient Boosting model optimizing tree ensembles with regularized gradient learning for structural tabular classification." },
    { name: "Random Forest", description: "Ensemble classification algorithm evaluating bagging decision trees for vocabulary tree splits." },
    { name: "Linear SVM", description: "Support Vector Machines optimizing margins to isolate linear hyperplane divisions between fake and authentic vocabularies." },
  ];

  const transformerModels = [
    { name: "BERT", description: "Bidirectional Encoder Representations from Transformers. Captures bidirectional contextual meanings of tokens in natural text sequences.", tag: "Primary Classifier" },
    { name: "DistilBERT", description: "A distilled, lightweight variant of BERT that is 40% smaller and 60% faster, while retaining 97% of BERT's original language capability.", tag: "Fast Inference" },
    { name: "RoBERTa", description: "A robustly optimized BERT approach. Trained longer with larger batch sizes and dynamic token masking configuration.", tag: "Highest Accuracy" },
  ];

  const futureScopes = [
    { title: "FastAPI Database Engine", description: "Integrate relational databases (SQLite/PostgreSQL) with SQLAlchemy ORM to save prediction histories permanently.", icon: Database },
    { title: "Explainable AI (SHAP/LIME)", description: "Implement local visual heatmaps marking specific tokens with high gradients contributing directly to the prediction output.", icon: Network },
    { title: "URL Verification Agent", description: "Add scrapers utilizing BeautifulSoup/Scrapy to extract news text directly from user-submitted website links.", icon: Link2 },
    { title: "PDF Document verification", description: "Allow users to upload PDFs, scan raw text blocks, and evaluate documents in batches.", icon: FileText },
    { title: "Retrieval-Augmented Generation (RAG)", description: "Validate articles against real-time fact databases like Wikipedia, Snopes, or Google Fact Check API using vector databases.", icon: Sparkles },
    { title: "AI Fact-Checking Chatbot", description: "Interactive chatbot interface enabling users to query specific claims and receive references for news statements.", icon: MessageSquare },
  ];

  return (
    <div className="space-y-12 animate-fadeIn">
      
      {/* Project Banner Header */}
      <div className="bg-zinc-950 text-zinc-50 rounded-2xl p-10 lg:p-12 border border-zinc-800 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-800/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="space-y-4 max-w-3xl relative z-10">
          <span className="badge bg-zinc-800 text-zinc-300 border border-zinc-700">
            Enterprise Verification System
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">TruthLens AI</h1>
          <p className="text-base text-zinc-400 leading-relaxed max-w-2xl">
            An advanced software system implementing ensemble machine learning models and deep bidirectionally-trained language transformers (BERT) to classify news credibility. The frontend and backend architectures are decoupled to facilitate smooth deployment configurations.
          </p>
        </div>
        
        <div className="relative z-10 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-2xl flex flex-col items-center justify-center w-48 h-48 shrink-0 transform rotate-3 hover:rotate-0 transition-transform duration-500">
          <span className="text-4xl font-bold text-zinc-100">WEL</span>
          <span className="text-xs font-semibold tracking-widest uppercase mt-2 text-zinc-400">Fake</span>
          <div className="mt-4 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="text-xs text-zinc-300 font-mono">72,134 Articles</span>
          </div>
        </div>
      </div>

      {/* Quick History Access */}
      {history.length > 0 && (
        <div className="space-y-4 animate-slideUp">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Clock size={20} className="text-zinc-500" /> Recent Activity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div onClick={() => handleContinue(history[0])} className="premium-card p-6 cursor-pointer group flex flex-col justify-between border-blue-200 dark:border-blue-900/30 hover:border-blue-500 dark:hover:border-blue-500">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={16} className="text-blue-500" />
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Continue From Last Analysis</span>
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">{history[0].text_snippet}</p>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                <span>{history[0].date} {history[0].time}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {history.filter(h => h.prediction === 'Fake').slice(0, 1).map(item => (
              <div key={item.id} onClick={() => handleContinue(item)} className="premium-card p-6 cursor-pointer group flex flex-col justify-between hover:border-red-500 dark:hover:border-red-500">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={16} className="text-red-500" />
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">Recent Fake News</span>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">{item.text_snippet}</p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                  <span>{item.date} {item.time}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}

            {history.filter(h => h.prediction === 'Real').slice(0, 1).map(item => (
              <div key={item.id} onClick={() => handleContinue(item)} className="premium-card p-6 cursor-pointer group flex flex-col justify-between hover:border-green-500 dark:hover:border-green-500">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">Recent Verifications</span>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">{item.text_snippet}</p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                  <span>{item.date} {item.time}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dataset & Models Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Dataset Details */}
        <div className="premium-card p-8 flex flex-col h-full animate-slideUp">
          <div className="flex items-center space-x-3 text-zinc-900 dark:text-zinc-50 mb-6">
            <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-zinc-500 shadow-sm border border-zinc-200 dark:border-zinc-800">
              <Database size={24} />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Dataset Details (WELFake)</h2>
          </div>
          
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
            TruthLens AI models are evaluated against the benchmark <strong className="text-zinc-900 dark:text-zinc-100 font-medium">WELFake Dataset</strong> compiled for academic studies. It contains <strong className="text-zinc-900 dark:text-zinc-100 font-medium">72,134 news entries</strong>:
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl text-center space-y-1">
              <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Fake News Class</span>
              <span className="text-3xl font-bold text-red-700 dark:text-red-500 block">37,102</span>
              <span className="text-[10px] font-medium text-red-500 dark:text-red-400">Labeled Misinformation</span>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-xl text-center space-y-1">
              <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Real News Class</span>
              <span className="text-3xl font-bold text-green-700 dark:text-green-500 block">35,032</span>
              <span className="text-[10px] font-medium text-green-500 dark:text-green-400">Labeled Authentic Reports</span>
            </div>
          </div>
          
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mt-auto">
            By training models on balanced news corpuses containing both political opinion columns, standard media dispatches, and online blogs, the classifier reaches robust accuracy rates, avoiding overfitting.
          </p>
        </div>

        {/* Right Column: Traditional Machine Learning Models */}
        <div className="premium-card p-8 flex flex-col h-full animate-slideUp">
          <div className="flex items-center space-x-3 text-zinc-900 dark:text-zinc-50 mb-6">
            <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-zinc-500 shadow-sm border border-zinc-200 dark:border-zinc-800">
              <Layers size={24} />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Traditional ML Models</h2>
          </div>
          
          <div className="space-y-3">
            {mlModels.map((model) => (
              <div key={model.name} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 group">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">{model.name}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{model.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Transformer Models Section */}
      <div className="premium-card p-8 animate-slideUp">
        <div className="flex items-center space-x-3 text-zinc-900 dark:text-zinc-50 mb-6">
          <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-zinc-500 shadow-sm border border-zinc-200 dark:border-zinc-800">
            <Cpu size={24} />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">Deep Transformer Architecture</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
            <span className="badge bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50">
              Production Deployment
            </span>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">RoBERTa Classifier</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              For live production audits, the system bypasses secondary classifiers to optimize execution speed. It runs exclusively on the robustly optimized <strong className="text-zinc-900 dark:text-zinc-100 font-medium">RoBERTa</strong> language transformer, our best-performing model with <strong className="text-zinc-900 dark:text-zinc-100 font-medium">97.9% accuracy</strong>.
            </p>
          </div>
          <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
            <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
              Research Mode
            </span>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">Consensus & Majority Voting</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Designed for academic and comparison studies. Enables parallel evaluations across <strong className="text-zinc-900 dark:text-zinc-100 font-medium">BERT, DistilBERT, and RoBERTa</strong> transformers. Computes a consensus prediction dynamically using an ensemble <strong className="text-zinc-900 dark:text-zinc-100 font-medium">Majority Voting</strong> protocol.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {transformerModels.map((model) => (
            <div key={model.name} className="flex flex-col p-6 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all relative">
              <div className="space-y-2">
                <span className="badge bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 absolute top-4 right-4">
                  {model.tag}
                </span>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight pt-2">{model.name}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{model.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Future Scope Section */}
      <div className="space-y-6 pb-6 animate-slideUp">
        <div className="flex items-center space-x-3 text-zinc-900 dark:text-zinc-50">
          <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-zinc-500 shadow-sm border border-zinc-200 dark:border-zinc-800">
            <HelpCircle size={24} />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">Future Scope & Enhancements</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {futureScopes.map((scope) => {
            const Icon = scope.icon;
            return (
              <div key={scope.title} className="premium-card p-6 flex flex-col space-y-4 transition-all hover:shadow-md">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500 self-start border border-zinc-200 dark:border-zinc-700">
                  <Icon size={20} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">{scope.title}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{scope.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t border-zinc-200 dark:border-zinc-800 mt-8">
        <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
          TruthLens AI — Professional Grade Misinformation Detection Platform.
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 uppercase tracking-wider">
          Enabling real-time journalistic credibility checks and data verification.
        </p>
      </div>

    </div>
  );
};
export default About;
