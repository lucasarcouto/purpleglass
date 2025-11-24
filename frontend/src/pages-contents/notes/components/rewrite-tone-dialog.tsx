import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Copy, Check } from "lucide-react";
import type { Block } from "@blocknote/core";
import type { ToneType } from "@/core/ai/types";
import { useAI } from "@/hooks/use-ai";
import { extractTextFromBlocks } from "@/utils/extract-text-from-blocks";
import { AICompatibilityNotice } from "@/components/ai-compatibility-notice";

const TONES: { value: ToneType; label: string; description: string }[] = [
  {
    value: "professional",
    label: "Professional",
    description: "Business-appropriate and formal",
  },
  {
    value: "casual",
    label: "Casual",
    description: "Relaxed and conversational",
  },
  {
    value: "formal",
    label: "Formal",
    description: "Academic and structured",
  },
  {
    value: "friendly",
    label: "Friendly",
    description: "Warm and approachable",
  },
  {
    value: "creative",
    label: "Creative",
    description: "Expressive and imaginative",
  },
];

interface RewriteToneDialogProps {
  open: boolean;
  noteContent: Block[];
  onOpenChange: (open: boolean) => void;
}

export function RewriteToneDialog({
  open,
  noteContent,
  onOpenChange,
}: Readonly<RewriteToneDialogProps>) {
  const { rewriteTone, modelProgress } = useAI();
  const [copied, setCopied] = useState(false);
  const [selectedTone, setSelectedTone] = useState<ToneType | null>(null);
  const [rewrittenText, setRewrittenText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleToneSelect(tone: ToneType) {
    setSelectedTone(tone);
    const text = extractTextFromBlocks(noteContent);

    if (!text.trim()) {
      setRewrittenText('Note is empty. Add some content first!');
      return;
    }

    setIsLoading(true);
    setRewrittenText(null);

    try {
      const result = await rewriteTone(text, tone);
      setRewrittenText(result);
    } catch (error) {
      console.error('Failed to rewrite tone:', error);
      setRewrittenText('Failed to rewrite text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy() {
    if (rewrittenText) {
      await navigator.clipboard.writeText(rewrittenText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function getDescriptionText(): string {
    if (!selectedTone) {
      return "Select a tone to rewrite your text";
    }

    if (isLoading) {
      return `Rewriting in ${selectedTone} tone...`;
    }

    return "Copy the rewritten text to replace your original.";
  }

  function renderToneSelection() {
    return (
      <div className="grid grid-cols-2 gap-3 py-4">
        {TONES.map((tone) => (
          <button
            key={tone.value}
            onClick={() => handleToneSelect(tone.value)}
            className="p-4 border rounded-lg text-left hover:bg-accent transition-colors"
          >
            <h3 className="font-medium mb-1">{tone.label}</h3>
            <p className="text-sm text-muted-foreground">{tone.description}</p>
          </button>
        ))}
      </div>
    );
  }

  function renderLoadingState() {
    return (
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
    );
  }

  function renderResult() {
    return (
      <>
        <div className="py-4 max-h-[500px] overflow-y-auto">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {rewrittenText}
            </p>
          </div>
        </div>

        {rewrittenText && (
          <DialogFooter>
            <Button onClick={handleCopy} disabled={copied}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Text
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </>
    );
  }

  function renderContent() {
    if (!selectedTone) {
      return renderToneSelection();
    }

    if (isLoading) {
      return renderLoadingState();
    }

    return renderResult();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Rewrite with Different Tone</DialogTitle>
          <DialogDescription>{getDescriptionText()}</DialogDescription>
        </DialogHeader>

        <AICompatibilityNotice className="mt-4" />

        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
