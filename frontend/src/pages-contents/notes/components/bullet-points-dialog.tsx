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
import { useState, useEffect } from "react";
import type { Block } from "@blocknote/core";
import { useAI } from "@/hooks/use-ai";
import { extractTextFromBlocks } from "@/utils/extract-text-from-blocks";

interface BulletPointsDialogProps {
  open: boolean;
  noteContent: Block[];
  onOpenChange: (open: boolean) => void;
}

export function BulletPointsDialog({
  open,
  noteContent,
  onOpenChange,
}: Readonly<BulletPointsDialogProps>) {
  const { generateBulletPoints, modelProgress } = useAI();

  const [copied, setCopied] = useState(false);
  const [bulletPoints, setBulletPoints] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleGenerateBulletPoints() {
    const text = extractTextFromBlocks(noteContent);

    if (!text.trim()) {
      setBulletPoints(["Note is empty. Add some content first!"]);
      return;
    }

    setIsLoading(true);
    setBulletPoints(null);

    try {
      const points = await generateBulletPoints(text);
      setBulletPoints(points);
    } catch (error) {
      console.error("Failed to generate bullet points:", error);
      setBulletPoints(["Failed to generate bullet points. Please try again."]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy() {
    if (bulletPoints) {
      const text = bulletPoints.map((point) => `• ${point}`).join("\n");

      await navigator.clipboard.writeText(text);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  useEffect(() => {
    if (open && !bulletPoints) {
      handleGenerateBulletPoints();
    }

    // We only want to generate when the dialog opens, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generated Bullet Points</DialogTitle>
          <DialogDescription>
            {isLoading
              ? "Generating bullet points from your note..."
              : "Copy these bullet points to add them to your note."}
          </DialogDescription>
        </DialogHeader>

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
          <>
            <div className="py-4 max-h-[400px] overflow-y-auto">
              <ul className="space-y-2">
                {bulletPoints?.map((point, index) => (
                  <li key={`${point}-${index}`} className="flex gap-2">
                    <span className="text-muted-foreground select-none">•</span>
                    <span className="text-foreground leading-relaxed">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {bulletPoints && bulletPoints.length > 0 && (
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
                      Copy Bullet Points
                    </>
                  )}
                </Button>
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
