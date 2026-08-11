import axios from "axios";

export interface ModelPrediction {
  prediction: "Fake" | "Real";
  confidence: number;
}

export interface VerificationSource {
  name: string;
  url: string;
}

export interface VerificationResponse {
  verdict: string;
  confidence: number;
  summary: string;
  reasoning: string;
  sources: VerificationSource[];
}

export interface ProductionResponse {
  mode: "production";
  model: string;
  prediction: "Fake" | "Real";
  confidence: number;
  inference_time: string;
  keywords: string[];
  reason: string;
  verification: VerificationResponse;
  status: string;
}

export interface ResearchResponse {
  mode: "research";
  bert: ModelPrediction;
  distilbert: ModelPrediction;
  roberta: ModelPrediction;
  xgboost?: ModelPrediction;
  majority_voting: "Fake" | "Real";
  final_prediction: "Fake" | "Real";
  comparison: {
    bert_prediction: "Fake" | "Real";
    distilbert_prediction: "Fake" | "Real";
    roberta_prediction: "Fake" | "Real";
    xgboost_prediction: "Fake" | "Real";
    bert_confidence: number;
    distilbert_confidence: number;
    roberta_confidence: number;
    xgboost_confidence: number;
    majority_confidence: number;
    inference_time_ms: number;
  };
  verification: VerificationResponse;
  status: string;
}

export type PredictResponse = ProductionResponse | ResearchResponse;

export interface HistoryItem {
  id: string;
  date: string;
  time: string;
  input_text: string;
  text_snippet: string;
  prediction: "Fake" | "Real";
  confidence: number;
  mode: "production" | "research";
  model_used: string;
  inference_time: number;
}

export interface AnalyticsResponse {
  total_predictions: number;
  fake_percentage: number;
  real_percentage: number;
  average_confidence: number;
  average_inference_time: number;
  distribution_pie: { [key: string]: number };
  model_performance_bar: { [key: string]: number };
  timeline_line: {
    date: string;
    total: number;
    fake: number;
    real: number;
    avgConfidence: number;
  }[];
  current_mode: "production" | "research";
}

// The FastAPI backend base URL. VITE_API_URL supports deployed and Docker environments.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";
console.log("TruthLens API_BASE_URL:", API_BASE_URL);
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 0, // No timeout for complex agentic RAG and Gemini verification
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    // Only safely retry GET requests to prevent duplicate AI inference triggers
    const isGetRequest = config.method?.toLowerCase() === 'get';

    // Initialize retry count
    config.__retryCount = config.__retryCount || 0;

    // Retry up to 2 times for network timeouts or 5xx server errors on safe methods only
    if (isGetRequest && config.__retryCount < 2 && (error.code === 'ECONNABORTED' || !error.response || (error.response.status >= 500 && error.response.status < 600))) {
      config.__retryCount += 1;
      // Exponential backoff: 1s, then 2s
      const backoffDelay = config.__retryCount * 1000;
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
      return client(config);
    }

    // Mutate the error message to present meaningful frontend errors to the UI
    if (error.code === 'ECONNABORTED') {
      error.message = "The AI verification pipeline timed out. Please try a shorter article or try again later.";
      console.error("[Axios] Request timed out. " + error.message);
    } else if (!error.response) {
      error.message = "Network interruption. Failed to reach the TruthLens AI backend.";
      console.error("[Axios] Network error. " + error.message);
    }
    
    return Promise.reject(error);
  }
);

export const api = {
  predict: async (text: string, mode: "production" | "research" = "production"): Promise<PredictResponse> => {
    const response = await client.post<PredictResponse>("/predict", { text, mode });
    return response.data;
  },

  getAnalytics: async (): Promise<AnalyticsResponse> => {
    const response = await client.get<AnalyticsResponse>("/analytics", { timeout: 10000 });
    return response.data;
  },

  getHistory: async (): Promise<HistoryItem[]> => {
    const response = await client.get<HistoryItem[]>("/history", { timeout: 10000 });
    return response.data;
  },

  batchPredict: async (texts: string[], mode: "production" | "research" = "production"): Promise<PredictResponse[]> => {
    const response = await client.post<{ predictions: PredictResponse[] }>("/batchPredict", {
      texts,
      mode,
    });
    return response.data.predictions;
  },
};

export const truthLensApi = {
  predict: async (text: string, mode: "production" | "research"): Promise<PredictResponse> => {
    return await api.predict(text, mode);
  },

  getAnalytics: async (): Promise<AnalyticsResponse> => {
    return await api.getAnalytics();
  },

  getHistory: async (): Promise<HistoryItem[]> => {
    return await api.getHistory();
  },

  batchPredict: async (texts: string[], mode: "production" | "research"): Promise<PredictResponse[]> => {
    return await api.batchPredict(texts, mode);
  },
};
