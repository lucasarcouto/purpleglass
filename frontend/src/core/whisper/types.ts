export type WhisperModelStatus = "idle" | "loading" | "ready" | "error" | "cached";

export type TranscriptionStatus = "idle" | "processing" | "success" | "error";

export interface WhisperModel {
  id: string;
  name: string;
  description: string;
  size: string;
}

export interface TranscriptionProgress {
  progress: number;
  timeElapsed: number;
  text: string;
}

export interface TranscriptionResult {
  text: string;
  duration?: number;
  error?: string;
}

export interface ModelLoadProgress {
  status: string;
  progress?: number;
  file?: string;
  loaded?: number;
  total?: number;
}

export const AVAILABLE_WHISPER_MODELS: WhisperModel[] = [
  {
    id: "Xenova/whisper-tiny",
    name: "Whisper Tiny",
    description: "Fastest model, good for quick transcriptions (~39MB)",
    size: "~39MB",
  },
  {
    id: "Xenova/whisper-base",
    name: "Whisper Base",
    description: "Balanced speed and accuracy (~74MB)",
    size: "~74MB",
  },
  {
    id: "Xenova/whisper-small",
    name: "Whisper Small",
    description: "Higher accuracy, slower processing (~244MB)",
    size: "~244MB",
  },
];

export const DEFAULT_WHISPER_MODEL_ID = "Xenova/whisper-tiny";
