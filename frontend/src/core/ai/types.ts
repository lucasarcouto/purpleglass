export type AIModelStatus = "idle" | "loading" | "ready" | "error" | "cached";

export type AIOperationStatus = "idle" | "processing" | "success" | "error";

export interface AIModel {
  id: string;
  name: string;
  description: string;
  size: string;
}

export interface AIModelProgress {
  progress: number;
  timeElapsed: number;
  text: string;
}

export interface SummarizeResult {
  summary: string;
  error?: string;
}

export type ToneType =
  | "professional"
  | "casual"
  | "formal"
  | "friendly"
  | "creative";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatContext {
  noteId?: string;
  noteTitle?: string;
  noteContent?: string;
}

export const AVAILABLE_LLM: AIModel[] = [
  {
    id: "Llama-3.2-3B-Instruct-q4f32_1-MLC",
    name: "Llama 3.2 3B",
    description: "Fast and efficient model, good balance of speed and quality",
    size: "~2GB",
  },
  {
    id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
    name: "Phi 3.5 Mini",
    description: "Microsoft's compact model, optimized for efficiency",
    size: "~2.2GB",
  },
  {
    id: "Qwen2.5-3B-Instruct-q4f16_1-MLC",
    name: "Qwen 2.5 3B",
    description: "Strong reasoning capabilities, higher quality summaries",
    size: "~2GB",
  },
  {
    id: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
    name: "Llama 3.2 1B",
    description: "Smallest and fastest model, lower quality but very quick",
    size: "~0.6GB",
  },
];

export const DEFAULT_MODEL_ID = "Llama-3.2-3B-Instruct-q4f32_1-MLC";
