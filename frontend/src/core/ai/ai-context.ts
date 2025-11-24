import { createContext } from "react";
import type {
  AIModelStatus,
  AIModelProgress,
  ToneType,
  ChatMessage,
  ChatContext,
} from "@/core/ai/types";

export interface AIContextState {
  modelStatus: AIModelStatus;
  modelProgress: AIModelProgress | null;
  selectedModelId: string;
  setSelectedModelId: (modelId: string) => void;
  downloadModel: () => Promise<void>;
  summarizeText: (text: string) => Promise<string>;
  generateTitle: (text: string) => Promise<string>;
  generateTags: (text: string) => Promise<string[]>;
  generateBulletPoints: (text: string) => Promise<string[]>;
  rewriteTone: (text: string, tone: ToneType) => Promise<string>;
  chat: (
    message: string,
    context: ChatContext,
    history: ChatMessage[]
  ) => Promise<string>;
}

export const AIContext = createContext<AIContextState | undefined>(undefined);
