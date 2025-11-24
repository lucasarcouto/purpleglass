import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Loader2 } from "lucide-react";
import { useWhisper } from "@/hooks/use-whisper";
import type { Block } from "@blocknote/core";
import type { CustomEditor } from "@/pages-contents/notes/components/note-editor";

interface CustomAudioBlockProps {
  block: Block;
  editor: CustomEditor;
}

export function CustomAudioBlock({
  block,
  editor,
}: Readonly<CustomAudioBlockProps>) {
  const { transcribe } = useWhisper();
  const [isTranscribing, setIsTranscribing] = useState(false);

  const url = (block.props as { url?: string }).url;

  async function handleTranscribe() {
    if (!url) return;

    setIsTranscribing(true);

    try {
      const result = await transcribe(url);

      if (!result.error && result.text) {
        editor.focus();
        editor.insertBlocks(
          [{ type: "paragraph", content: result.text }],
          block.id,
          "after"
        );
      }
    } catch (error) {
      console.error("Transcription failed:", error);
    } finally {
      setIsTranscribing(false);
    }
  }

  if (!url) {
    return (
      <div className="flex items-center justify-center p-4 border rounded-lg bg-muted">
        <p className="text-sm text-muted-foreground">No audio file</p>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 p-2 border rounded-lg bg-card"
      contentEditable={false}
    >
      <audio src={url} controls className="flex-1" contentEditable={false}>
        <track kind="captions" />
      </audio>
      <Button
        onClick={handleTranscribe}
        variant="ghost"
        size="icon"
        disabled={isTranscribing}
        contentEditable={false}
        className="shrink-0"
        title="Transcribe audio"
      >
        {isTranscribing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
