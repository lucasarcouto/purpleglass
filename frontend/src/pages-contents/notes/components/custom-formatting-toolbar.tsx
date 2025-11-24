import {
  useComponentsContext,
  useBlockNoteEditor,
  useSelectedBlocks,
  getFormattingToolbarItems,
} from "@blocknote/react";
import { Mic, Loader2 } from "lucide-react";

interface CustomFormattingToolbarProps {
  isTranscribing: boolean;
  onTranscribe: (audioUrl: string) => void;
}

export function CustomFormattingToolbar({
  isTranscribing,
  onTranscribe,
}: Readonly<CustomFormattingToolbarProps>) {
  const Components = useComponentsContext()!;
  const editor = useBlockNoteEditor();
  const selectedBlocks = useSelectedBlocks(editor);

  // Check if any selected block is an audio block
  const audioBlock = selectedBlocks.find((block) => block.type === "audio");
  const audioUrl = audioBlock
    ? ((audioBlock.props as Record<string, unknown>)?.url as string)
    : null;

  return (
    <Components.FormattingToolbar.Root>
      {/* Include all default toolbar items */}
      {getFormattingToolbarItems()}

      {/* Add custom transcribe button when audio block is selected */}
      {audioUrl && (
        <Components.FormattingToolbar.Button
          key="transcribeButton"
          mainTooltip="Transcribe audio"
          onClick={() => onTranscribe(audioUrl)}
          isDisabled={isTranscribing}
        >
          {isTranscribing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Components.FormattingToolbar.Button>
      )}
    </Components.FormattingToolbar.Root>
  );
}
