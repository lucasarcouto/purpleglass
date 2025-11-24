import { Brain, Sparkles, Download, Check, Mic } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAI } from "@/hooks/use-ai";
import { useWhisper } from "@/hooks/use-whisper";
import { AVAILABLE_LLM } from "@/core/ai/types";
import { AVAILABLE_WHISPER_MODELS } from "@/core/whisper/types";

export function SettingsPage() {
  const {
    selectedModelId,
    setSelectedModelId,
    modelStatus,
    modelProgress,
    downloadModel,
  } = useAI();

  const {
    selectedModelId: selectedWhisperModelId,
    setSelectedModelId: setSelectedWhisperModelId,
    modelStatus: whisperModelStatus,
    transcriptionProgress: whisperProgress,
    downloadModel: downloadWhisperModel,
  } = useWhisper();

  const selectedLLM = AVAILABLE_LLM.find((m) => m.id === selectedModelId);
  const selectedWhisperModel = AVAILABLE_WHISPER_MODELS.find(
    (m) => m.id === selectedWhisperModelId
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application preferences and AI model configuration
          </p>
        </div>

        <div className="space-y-6">
          {/* AI Settings Section */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5" />
              <h2 className="text-xl font-semibold">AI Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="model-select" className="text-base">
                  LLM Model
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose which AI model to use for note summarization and other
                  AI features. The model will be downloaded and run locally in
                  your browser.
                </p>

                <div className="space-y-3">
                  {AVAILABLE_LLM.map((model) => (
                    <Label
                      key={model.id}
                      className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="ai-model"
                        value={model.id}
                        checked={selectedModelId === model.id}
                        onChange={(e) => setSelectedModelId(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                            {model.size}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {model.description}
                        </p>
                      </div>
                    </Label>
                  ))}
                </div>
              </div>

              {selectedLLM && (
                <div className="bg-muted/50 border rounded-lg p-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1 text-sm">
                        <p className="font-medium mb-1">
                          Selected: {selectedLLM.name}
                        </p>
                        <p className="text-muted-foreground">
                          {modelStatus === "idle" && (
                            <>
                              Model not downloaded yet ({selectedLLM.size}).
                              Download it now to use AI features.
                            </>
                          )}
                          {modelStatus === "cached" && (
                            <>
                              Model previously downloaded and cached in browser
                              ({selectedLLM.size}). Ready to load on first use.
                            </>
                          )}
                          {modelStatus === "loading" && (
                            <>
                              Model is currently being downloaded and loaded...
                            </>
                          )}
                          {modelStatus === "ready" && (
                            <>Model is loaded and ready to use.</>
                          )}
                          {modelStatus === "error" && (
                            <span className="text-destructive">
                              Failed to load model. Please try again.
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {modelStatus === "loading" && modelProgress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{modelProgress.text}</span>
                          <span>
                            {Math.round(modelProgress.progress * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-300"
                            style={{
                              width: `${modelProgress.progress * 100}%`,
                            }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round(modelProgress.timeElapsed / 1000)}s
                          elapsed
                        </div>
                      </div>
                    )}

                    {modelStatus !== "loading" && (
                      <Button
                        onClick={downloadModel}
                        disabled={false}
                        variant={
                          modelStatus === "ready" ? "outline" : "default"
                        }
                        size="sm"
                        className="w-full"
                      >
                        {modelStatus === "ready" ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Model Downloaded
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download Model ({selectedLLM.size})
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Whisper Settings Section */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mic className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Audio Transcription</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="whisper-model-select" className="text-base">
                  Whisper Model
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose which Whisper model to use for audio transcription.
                  Smaller models are faster but less accurate. The model will be
                  downloaded and run locally in your browser.
                </p>

                <div className="space-y-3">
                  {AVAILABLE_WHISPER_MODELS.map((model) => (
                    <Label
                      key={model.id}
                      className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="whisper-model"
                        value={model.id}
                        checked={selectedWhisperModelId === model.id}
                        onChange={(e) =>
                          setSelectedWhisperModelId(e.target.value)
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                            {model.size}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {model.description}
                        </p>
                      </div>
                    </Label>
                  ))}
                </div>
              </div>

              {selectedWhisperModel && (
                <div className="bg-muted/50 border rounded-lg p-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1 text-sm">
                        <p className="font-medium mb-1">
                          Selected: {selectedWhisperModel.name}
                        </p>
                        <p className="text-muted-foreground">
                          {whisperModelStatus === "idle" && (
                            <>
                              Model not downloaded yet (
                              {selectedWhisperModel.size}). Download it now to
                              use transcription features.
                            </>
                          )}
                          {whisperModelStatus === "cached" && (
                            <>
                              Model previously downloaded and cached in browser
                              ({selectedWhisperModel.size}). Ready to load on
                              first use.
                            </>
                          )}
                          {whisperModelStatus === "loading" && (
                            <>
                              Model is currently being downloaded and loaded...
                            </>
                          )}
                          {whisperModelStatus === "ready" && (
                            <>Model is loaded and ready to use.</>
                          )}
                          {whisperModelStatus === "error" && (
                            <span className="text-destructive">
                              Failed to load model. Please try again.
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {whisperModelStatus === "loading" && whisperProgress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{whisperProgress.text}</span>
                          <span>
                            {Math.round(whisperProgress.progress * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-300"
                            style={{
                              width: `${whisperProgress.progress * 100}%`,
                            }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round(whisperProgress.timeElapsed / 1000)}s
                          elapsed
                        </div>
                      </div>
                    )}

                    {whisperModelStatus !== "loading" && (
                      <Button
                        onClick={downloadWhisperModel}
                        disabled={false}
                        variant={
                          whisperModelStatus === "ready" ? "outline" : "default"
                        }
                        size="sm"
                        className="w-full"
                      >
                        {whisperModelStatus === "ready" ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Model Downloaded
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download Model ({selectedWhisperModel.size})
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
