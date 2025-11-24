import { createContext } from "react";
import type {
  WhisperModelStatus,
  TranscriptionProgress,
  TranscriptionResult,
} from "@/core/whisper/types";

export interface WhisperContextState {
  modelStatus: WhisperModelStatus;
  transcriptionProgress: TranscriptionProgress | null;
  selectedModelId: string;
  setSelectedModelId: (modelId: string) => void;
  transcribe: (audioUrl: string) => Promise<TranscriptionResult>;
  downloadModel: () => Promise<void>;
}

export const WhisperContext = createContext<WhisperContextState | undefined>(
  undefined
);
