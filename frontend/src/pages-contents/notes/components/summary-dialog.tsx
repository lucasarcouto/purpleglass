import { useState, useEffect } from "react";
import { Copy, Check, Loader2, Sparkles } from "lucide-react";
import type { Block } from "@blocknote/core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAI } from "@/hooks/use-ai";
import { extractTextFromBlocks } from "@/utils/extract-text-from-blocks";
import { AICompatibilityNotice } from "@/components/ai-compatibility-notice";

interface SummaryDialogProps {
  open: boolean;
  noteContent: Block[];
  onOpenChange: (open: boolean) => void;
}

export function SummaryDialog({
  open,
  noteContent,
  onOpenChange,
}: Readonly<SummaryDialogProps>) {
  const { summarizeText, modelProgress } = useAI();
  const [copied, setCopied] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCopy() {
    if (summary) {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function generateSummary() {
    const text = extractTextFromBlocks(noteContent);

    if (!text.trim()) {
      setSummary("Note is empty. Add some content first!");
      return;
    }

    setIsLoading(true);
    setSummary(null);

    try {
      const result = await summarizeText(text);
      setSummary(result);
    } catch (error) {
      console.error("Failed to summarize:", error);
      setSummary("Failed to generate summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function renderLoadingState() {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        {modelProgress && (
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">
              {modelProgress.text}
            </div>
            {modelProgress.progress > 0 && (
              <div className="w-64 bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${modelProgress.progress * 100}%` }}
                />
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              {Math.round(modelProgress.timeElapsed / 1000)}s elapsed
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderSummary() {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
          {summary}
        </p>
      </div>
    );
  }

  function renderEmptyState() {
    return (
      <div className="text-center text-muted-foreground py-8">
        No summary available
      </div>
    );
  }

  function renderContent() {
    if (isLoading) {
      return renderLoadingState();
    }

    if (summary) {
      return renderSummary();
    }

    return renderEmptyState();
  }

  useEffect(() => {
    if (open && !summary) {
      generateSummary();
    }

    // We only want to generate when the dialog opens, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Note Summary
          </DialogTitle>
          <DialogDescription>
            {isLoading
              ? "AI is generating your summary..."
              : "Here is the AI-generated summary of your note"}
          </DialogDescription>
        </DialogHeader>

        <AICompatibilityNotice className="mt-4" />

        <div className="min-h-[120px] max-h-[400px] overflow-y-auto">
          {renderContent()}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCopy}
            disabled={!summary || isLoading}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
          <Button onClick={() => onOpenChange(false)} disabled={isLoading}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
