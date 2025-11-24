import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, FileText, Loader2 } from "lucide-react";
import { useState } from "react";

interface TranscriptionDialogProps {
  isOpen: boolean;
  transcriptionText: string;
  isProcessing: boolean;
  onInsert?: (text: string) => void;
  onClose: () => void;
}

export function TranscriptionDialog({
  isOpen,
  transcriptionText,
  isProcessing,
  onInsert,
  onClose,
}: Readonly<TranscriptionDialogProps>) {
  const [copySuccess, setCopySuccess] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(transcriptionText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  }

  function handleInsert() {
    if (onInsert) {
      onInsert(transcriptionText);
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Audio Transcription</DialogTitle>
          <DialogDescription>
            {isProcessing
              ? "Transcribing your audio..."
              : "Your audio has been transcribed. You can copy or insert it into your note."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Processing audio, please wait...</p>
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {transcriptionText || "No transcription available."}
              </p>
            </div>
          )}
        </div>

        {!isProcessing && transcriptionText && (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button onClick={handleCopy} variant="outline" className="gap-2">
              <Copy className="h-4 w-4" />
              {copySuccess ? "Copied!" : "Copy"}
            </Button>
            {onInsert && (
              <Button onClick={handleInsert} className="gap-2">
                <FileText className="h-4 w-4" />
                Insert into Note
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
