import {
  Brain,
  Sparkles,
  Download,
  Check,
  Mic,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAI } from "@/hooks/use-ai";
import { useWhisper } from "@/hooks/use-whisper";
import { AVAILABLE_LLM } from "@/core/ai/types";
import { AVAILABLE_WHISPER_MODELS } from "@/core/whisper/types";
import { AICompatibilityNotice } from "@/components/ai-compatibility-notice";
import { useState } from "react";
import { apiClient } from "@/core/api/api-client";
import { ApiEndpoint } from "@/core/api/api-endpoint";
import { useAuth } from "@/hooks/use-auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import JSZip from "jszip";

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

  const { logout } = useAuth();

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const selectedLLM = AVAILABLE_LLM.find((m) => m.id === selectedModelId);
  const selectedWhisperModel = AVAILABLE_WHISPER_MODELS.find(
    (m) => m.id === selectedWhisperModelId
  );

  async function handleExportData() {
    try {
      setIsExporting(true);
      setExportError(null);

      interface ExportData {
        user: {
          id: number;
          email: string;
          name: string;
          createdAt: string;
          updatedAt: string;
        };
        notes: Array<{
          id: string;
          title: string;
          content: unknown;
          tags: string[];
          createdAt: string;
          updatedAt: string;
        }>;
        files: Array<{
          id: string;
          filename: string;
          url: string;
          size: number;
          createdAt: string;
        }>;
        statistics: {
          totalNotes: number;
          totalFiles: number;
          totalStorageBytes: number;
          accountAge: string;
        };
      }

      const exportData = await apiClient.get<ExportData>(
        ApiEndpoint.EXPORT_USER_DATA
      );

      // Create ZIP file
      const zip = new JSZip();

      const jsonString = JSON.stringify(exportData, null, 2);
      zip.file("data.json", jsonString);

      const fileFolder = zip.folder("files");

      for (const file of exportData.files) {
        try {
          const response = await fetch(file.url);
          if (!response.ok) {
            console.error(`Failed to download ${file.filename}`);
            continue;
          }
          const blob = await response.blob();
          fileFolder?.file(file.filename, blob);
        } catch (error) {
          console.error(`Error downloading ${file.filename}:`, error);
          // Continue with other files even if one fails
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Download ZIP file
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `purpleglass-data-export-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Delay URL revocation to ensure download completes
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Export error:", error);
      setExportError(
        error instanceof Error ? error.message : "Failed to export data"
      );
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDeleteAccount() {
    try {
      setIsDeleting(true);
      setDeleteError(null);

      await apiClient.delete(ApiEndpoint.DELETE_ACCOUNT, {
        password: deletePassword,
      });

      // Logout and redirect
      logout();
    } catch (error) {
      console.error("Delete account error:", error);
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete account"
      );
      setIsDeleting(false);
    }
  }

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
          {/* Compatibility Notice */}
          <AICompatibilityNotice />

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

          {/* Account & Privacy Section (GDPR Compliance) */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Account & Privacy</h2>
            </div>

            <div className="space-y-6">
              {/* Export Data */}
              <div>
                <h3 className="font-medium mb-2">Export Your Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Download all your data including notes, files, and account
                  information in JSON format.
                </p>
                {exportError && (
                  <p className="text-sm text-destructive mb-3">{exportError}</p>
                )}
                <Button
                  onClick={handleExportData}
                  disabled={isExporting}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? "Exporting..." : "Export My Data"}
                </Button>
              </div>

              {/* Delete Account */}
              <div className="pt-6 border-t">
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <h3 className="font-medium text-destructive">
                    Delete Account
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="destructive"
                >
                  Delete My Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers, including:
            </AlertDialogDescription>
          </AlertDialogHeader>

          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 my-4">
            <li>Your profile and account information</li>
            <li>All your notes and tags</li>
            <li>All uploaded files and media</li>
          </ul>

          <div className="space-y-2">
            <Label htmlFor="delete-password">
              Enter your password to confirm
            </Label>
            <Input
              id="delete-password"
              type="password"
              placeholder="Password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              disabled={isDeleting}
            />
            {deleteError && (
              <p className="text-sm text-destructive">{deleteError}</p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              onClick={() => {
                setDeletePassword("");
                setDeleteError(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAccount();
              }}
              disabled={isDeleting || !deletePassword}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
