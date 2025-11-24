import { useState, useCallback, useMemo, useRef, type ReactNode } from "react";
import * as webllm from "@mlc-ai/web-llm";
import { AIContext } from "@/core/ai/ai-context";
import type { AIModelStatus, AIModelProgress } from "@/core/ai/types";
import { DEFAULT_MODEL_ID } from "@/core/ai/types";

const STORAGE_KEY_MODEL_ID = "ai-selected-model-id";
const STORAGE_KEY_DOWNLOADED_MODELS = "ai-downloaded-models";

interface AIProviderProps {
  children: ReactNode;
}

export function AIProvider({ children }: Readonly<AIProviderProps>) {
  const [selectedModelId, setSelectedModelIdState] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY_MODEL_ID) || DEFAULT_MODEL_ID
  );

  const [modelStatus, setModelStatus] = useState<AIModelStatus>(() => {
    // Check if the selected model was previously downloaded
    const downloadedModels = getDownloadedModels();
    return downloadedModels.has(selectedModelId) ? "cached" : "idle";
  });

  const [modelProgress, setModelProgress] = useState<AIModelProgress | null>(
    null
  );

  const engineRef = useRef<webllm.MLCEngine | null>(null);
  const currentModelIdRef = useRef<string | null>(null);

  const setSelectedModelId = useCallback((modelId: string) => {
    setSelectedModelIdState(modelId);
    localStorage.setItem(STORAGE_KEY_MODEL_ID, modelId);

    // If we change models, reset the engine so it reloads on next use
    if (
      currentModelIdRef.current !== null &&
      currentModelIdRef.current !== modelId
    ) {
      engineRef.current = null;
      currentModelIdRef.current = null;

      // Check if the new model was previously downloaded
      const downloadedModels = getDownloadedModels();
      setModelStatus(downloadedModels.has(modelId) ? "cached" : "idle");
      setModelProgress(null);
    }
  }, []);

  const initializeEngine = useCallback(async () => {
    if (engineRef.current && currentModelIdRef.current === selectedModelId) {
      return engineRef.current;
    }

    setModelStatus("loading");
    setModelProgress({ progress: 0, timeElapsed: 0, text: "Initializing..." });

    try {
      const engine = await webllm.CreateMLCEngine(selectedModelId, {
        initProgressCallback: (progress) => {
          setModelProgress({
            progress: progress.progress,
            timeElapsed: progress.timeElapsed,
            text: progress.text,
          });
        },
        appConfig: {
          ...webllm.prebuiltAppConfig,
          useIndexedDBCache: true, // Use IndexedDB instead of Cache API to avoid COEP credentialless issues
        },
      });

      engineRef.current = engine;
      currentModelIdRef.current = selectedModelId;
      setModelStatus("ready");
      setModelProgress(null);

      // Save this model as downloaded for future sessions
      saveDownloadedModel(selectedModelId);

      return engine;
    } catch (error) {
      console.error("Failed to initialize AI engine:", error);
      setModelStatus("error");
      setModelProgress(null);
      throw error;
    }
  }, [selectedModelId]);

  const summarizeText = useCallback(
    async (text: string): Promise<string> => {
      const engine = await initializeEngine();

      const prompt = `You are a helpful assistant that creates concise summaries of text. Please summarize the following text in 2-3 sentences, capturing the main points:\n\n${text}`;

      const response = await engine.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 150,
      });

      const summary = response.choices[0]?.message?.content || "";

      return summary.trim();
    },
    [initializeEngine]
  );

  const generateTitle = useCallback(
    async (text: string): Promise<string> => {
      const engine = await initializeEngine();

      const prompt = `Generate a concise, descriptive title (max 8 words) for the following text. Only return the title, nothing else:\n\n${text}`;

      const response = await engine.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 20,
      });

      const title = response.choices[0]?.message?.content || "";

      return title.trim();
    },
    [initializeEngine]
  );

  const generateTags = useCallback(
    async (text: string): Promise<string[]> => {
      const engine = await initializeEngine();

      const prompt = `Generate 3-5 relevant tags for the following text. Return only the tags as a comma-separated list:\n\n${text}`;

      const response = await engine.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 50,
      });

      const tagsText = response.choices[0]?.message?.content || "";
      const tags = tagsText
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      return tags;
    },
    [initializeEngine]
  );

  const generateBulletPoints = useCallback(
    async (text: string): Promise<string[]> => {
      const engine = await initializeEngine();

      const prompt = `Generate 3-5 bullet points summarizing the key points from the following text. Return only the bullet points, one per line, without bullet symbols:\n\n${text}`;

      const response = await engine.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 200,
      });

      const bulletsText = response.choices[0]?.message?.content || "";
      const bullets = bulletsText
        .split("\n")
        .map((bullet) => bullet.trim())
        .filter((bullet) => bullet.length > 0);

      return bullets;
    },
    [initializeEngine]
  );

  const rewriteTone = useCallback(
    async (
      text: string,
      tone: "professional" | "casual" | "formal" | "friendly" | "creative"
    ): Promise<string> => {
      const engine = await initializeEngine();

      const toneDescriptions = {
        professional: "professional and business-appropriate",
        casual: "casual and conversational",
        formal: "formal and academic",
        friendly: "friendly and warm",
        creative: "creative and expressive",
      };

      const prompt = `Rewrite the following text in a ${toneDescriptions[tone]} tone. Keep the same meaning but adjust the style:\n\n${text}`;

      const response = await engine.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });

      const rewritten = response.choices[0]?.message?.content || "";

      return rewritten.trim();
    },
    [initializeEngine]
  );

  const chat = useCallback(
    async (
      message: string,
      context: {
        noteId?: string;
        noteTitle?: string;
        noteContent?: string;
      },
      history: Array<{ role: "user" | "assistant"; content: string }>
    ): Promise<string> => {
      const engine = await initializeEngine();

      let systemPrompt =
        "You are a helpful assistant that answers questions about notes.";

      if (context.noteContent) {
        systemPrompt += `\n\nCurrent note title: ${context.noteTitle}\nCurrent note content:\n${context.noteContent}`;
      }

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...history,
        { role: "user" as const, content: message },
      ];

      const response = await engine.chat.completions.create({
        messages,
        temperature: 0.7,
        max_tokens: 300,
      });

      const reply = response.choices[0]?.message?.content || "";

      return reply.trim();
    },
    [initializeEngine]
  );

  const downloadModel = useCallback(async () => {
    await initializeEngine();
  }, [initializeEngine]);

  const value = useMemo(
    () => ({
      modelStatus,
      modelProgress,
      selectedModelId,
      setSelectedModelId,
      summarizeText,
      downloadModel,
      generateTitle,
      generateTags,
      generateBulletPoints,
      rewriteTone,
      chat,
    }),
    [
      modelStatus,
      modelProgress,
      selectedModelId,
      setSelectedModelId,
      summarizeText,
      downloadModel,
      generateTitle,
      generateTags,
      generateBulletPoints,
      rewriteTone,
      chat,
    ]
  );

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

function getDownloadedModels(): Set<string> {
  const stored = localStorage.getItem(STORAGE_KEY_DOWNLOADED_MODELS);
  return stored ? new Set(JSON.parse(stored)) : new Set();
}

function saveDownloadedModel(modelId: string) {
  const downloaded = getDownloadedModels();
  downloaded.add(modelId);
  localStorage.setItem(
    STORAGE_KEY_DOWNLOADED_MODELS,
    JSON.stringify([...downloaded])
  );
}
