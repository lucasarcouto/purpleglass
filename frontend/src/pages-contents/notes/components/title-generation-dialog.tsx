import { useState, useEffect } from "react";
import type { Block } from "@blocknote/core";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Check, X } from "lucide-react";
import { useAI } from "@/hooks/use-ai";
import { useNotes } from "@/hooks/use-notes";
import { extractTextFromBlocks } from "@/utils/extract-text-from-blocks";
import { AICompatibilityNotice } from "@/components/ai-compatibility-notice";

interface TitleGenerationDialogProps {
  open: boolean;
  noteId?: string | null;
  noteContent: Block[];
  onOpenChange: (open: boolean) => void;
}

export function TitleGenerationDialog({
  open,
  noteId,
  noteContent,
  onOpenChange,
}: Readonly<TitleGenerationDialogProps>) {
  const { generateTitle, modelProgress } = useAI();

  const { updateNote } = useNotes();

  const [generatedTitle, setGeneratedTitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  async function handleGenerateTitle() {
    const text = extractTextFromBlocks(noteContent);

    if (!text.trim()) {
      setGeneratedTitle("Note is empty. Add some content first!");
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setGeneratedTitle(null);
    setIsError(false);

    try {
      const title = await generateTitle(text);
      setGeneratedTitle(title);
      setIsError(false);
    } catch (error) {
      console.error("Failed to generate title:", error);
      setGeneratedTitle("Failed to generate title. Please try again.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }

  function handleAccept() {
    if (!noteId) return;

    if (generatedTitle) {
      updateNote(noteId, { title: generatedTitle });
      onOpenChange(false);
    }
  }

  function handleReject() {
    onOpenChange(false);
  }

  useEffect(() => {
    if (open) {
      // Reset state when dialog opens
      setGeneratedTitle(null);
      setIsError(false);
      handleGenerateTitle();
    }

    // We don't need to re-generate the title if the note content changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Generated Title</DialogTitle>
          <DialogDescription>
            {isLoading
              ? "Generating a title for your note..."
              : "Would you like to use this generated title?"}
          </DialogDescription>
        </DialogHeader>

        <AICompatibilityNotice className="mt-4" />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            {modelProgress && (
              <>
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{modelProgress.text}</span>
                    <span>{Math.round(modelProgress.progress * 100)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{ width: `${modelProgress.progress * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(modelProgress.timeElapsed / 1000)}s elapsed
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="py-4">
            <div
              className={`p-4 rounded-lg ${
                isError
                  ? "bg-destructive/10 border border-destructive/20"
                  : "bg-muted"
              }`}
            >
              <p
                className={`text-lg font-medium ${
                  isError ? "text-destructive" : "text-foreground"
                }`}
              >
                {generatedTitle}
              </p>
            </div>
          </div>
        )}

        {!isLoading && generatedTitle && (
          <DialogFooter className="gap-2">
            <Button onClick={handleReject} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            {isError ? (
              <Button onClick={handleGenerateTitle}>
                <Loader2 className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            ) : (
              <Button onClick={handleAccept}>
                <Check className="h-4 w-4 mr-2" />
                Use This Title
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
