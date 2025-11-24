import { useState, useCallback, useMemo, useRef, type ReactNode } from "react";
import {
  pipeline,
  AutomaticSpeechRecognitionPipeline,
} from "@huggingface/transformers";
import { WhisperContext } from "@/core/whisper/whisper-context";
import type {
  WhisperModelStatus,
  TranscriptionProgress,
  TranscriptionResult,
  ModelLoadProgress,
} from "@/core/whisper/types";
import { DEFAULT_WHISPER_MODEL_ID } from "@/core/whisper/types";

const STORAGE_KEY_MODEL_ID = "whisper-selected-model-id";
const STORAGE_KEY_DOWNLOADED_MODELS = "whisper-downloaded-models";

interface WhisperProviderProps {
  children: ReactNode;
}

export function WhisperProvider({ children }: Readonly<WhisperProviderProps>) {
  const [selectedModelId, setSelectedModelIdState] = useState<string>(() => {
    return (
      localStorage.getItem(STORAGE_KEY_MODEL_ID) || DEFAULT_WHISPER_MODEL_ID
    );
  });

  const [modelStatus, setModelStatus] = useState<WhisperModelStatus>(() => {
    // Check if the selected model was previously downloaded
    const downloadedModels = getDownloadedModels();
    return downloadedModels.has(
      localStorage.getItem(STORAGE_KEY_MODEL_ID) || DEFAULT_WHISPER_MODEL_ID
    )
      ? "cached"
      : "idle";
  });

  const [transcriptionProgress, setTranscriptionProgress] =
    useState<TranscriptionProgress | null>(null);

  const pipelineRef = useRef<AutomaticSpeechRecognitionPipeline | null>(null);
  const currentModelIdRef = useRef<string | null>(null);

  const setSelectedModelId = useCallback((modelId: string) => {
    setSelectedModelIdState(modelId);
    localStorage.setItem(STORAGE_KEY_MODEL_ID, modelId);

    // If we change models, reset the pipeline so it reloads on next use
    if (
      currentModelIdRef.current !== null &&
      currentModelIdRef.current !== modelId
    ) {
      pipelineRef.current = null;
      currentModelIdRef.current = null;

      // Check if the new model was previously downloaded
      const downloadedModels = getDownloadedModels();
      setModelStatus(downloadedModels.has(modelId) ? "cached" : "idle");
      setTranscriptionProgress(null);
    }
  }, []);

  const initializePipeline = useCallback(async () => {
    if (pipelineRef.current && currentModelIdRef.current === selectedModelId) {
      return pipelineRef.current;
    }

    setModelStatus("loading");
    setTranscriptionProgress({
      progress: 0,
      timeElapsed: 0,
      text: "Initializing Whisper model...",
    });

    try {
      const startTime = Date.now();

      const transcriber = await pipeline(
        "automatic-speech-recognition",
        selectedModelId,
        {
          progress_callback: (progress: ModelLoadProgress) => {
            const elapsed = Date.now() - startTime;
            setTranscriptionProgress({
              progress: progress.progress || 0,
              timeElapsed: elapsed,
              text: progress.status || "Loading model...",
            });
          },
        }
      );

      pipelineRef.current = transcriber;
      currentModelIdRef.current = selectedModelId;
      setModelStatus("ready");
      setTranscriptionProgress(null);

      // Save this model as downloaded for future sessions
      saveDownloadedModel(selectedModelId);

      return transcriber;
    } catch (error) {
      console.error("Failed to initialize Whisper pipeline:", error);
      setModelStatus("error");
      setTranscriptionProgress(null);
      throw error;
    }
  }, [selectedModelId]);

  const transcribe = useCallback(
    async (audioUrl: string): Promise<TranscriptionResult> => {
      try {
        const transcriber = await initializePipeline();

        setTranscriptionProgress({
          progress: 0,
          timeElapsed: 0,
          text: "Transcribing audio...",
        });

        const startTime = Date.now();

        const result = await transcriber(audioUrl, {
          chunk_length_s: 30,
          stride_length_s: 5,
          return_timestamps: false,
        });

        const duration = Date.now() - startTime;

        setTranscriptionProgress(null);

        // Handle both single result and array of results
        const text = Array.isArray(result)
          ? result[0]?.text || ""
          : result.text;

        return {
          text,
          duration,
        };
      } catch (error) {
        console.error("Transcription failed:", error);
        setTranscriptionProgress(null);

        return {
          text: "",
          error:
            error instanceof Error ? error.message : "Transcription failed",
        };
      }
    },
    [initializePipeline]
  );

  const downloadModel = useCallback(async () => {
    await initializePipeline();
  }, [initializePipeline]);

  const value = useMemo(
    () => ({
      modelStatus,
      transcriptionProgress,
      selectedModelId,
      setSelectedModelId,
      transcribe,
      downloadModel,
    }),
    [
      modelStatus,
      transcriptionProgress,
      selectedModelId,
      setSelectedModelId,
      transcribe,
      downloadModel,
    ]
  );

  return (
    <WhisperContext.Provider value={value}>{children}</WhisperContext.Provider>
  );
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
