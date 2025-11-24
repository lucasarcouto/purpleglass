import {
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useState,
  useEffect,
} from "react";
import {
  useCreateBlockNote,
  FilePanelController,
  FormattingToolbarController,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import type { Block } from "@blocknote/core";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { useTheme } from "@/hooks/use-theme";
import { apiClient } from "@/core/api/api-client";
import { ApiEndpoint } from "@/core/api/api-endpoint";
import { CustomFilePanel } from "@/pages-contents/notes/components/custom-file-panel";
import { CustomReactAudioBlock } from "@/pages-contents/notes/components/custom-audio-block-spec";
import { CustomFormattingToolbar } from "@/pages-contents/notes/components/custom-formatting-toolbar";
import { useWhisper } from "@/hooks/use-whisper";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

// Create schema outside component to get proper type
// Remove default audio block and replace with our custom one
const { audio: _, ...remainingBlockSpecs } = defaultBlockSpecs;

const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...remainingBlockSpecs,
    audio: CustomReactAudioBlock(),
  },
});

interface NoteEditorProps {
  initialContent?: Block[];
  editable?: boolean;
  onChange?: (content: Block[]) => void;
}

// Export the schema type for use in custom blocks
export type CustomSchema = typeof schema;

// Export the editor type for use in custom blocks
export type CustomEditor = ReturnType<typeof useCreateBlockNote>;

export interface NoteEditorRef {
  getEditor: () => CustomEditor;
  insertBlock: (content: string) => void;
  getAudioBlocks: () => Array<{ block: Block; url: string }>;
}

export const NoteEditor = forwardRef<NoteEditorRef, NoteEditorProps>(
  function NoteEditor(
    { initialContent, editable = true, onChange }: Readonly<NoteEditorProps>,
    ref
  ) {
    const { theme } = useTheme();

    const [isContentLoaded, setIsContentLoaded] = useState(false);

    const initialContentRef = useRef(initialContent);

    const previousUrlsRef = useRef<Set<string>>(
      initialContent ? extractMediaUrls(initialContent) : new Set()
    );

    const editor = useCreateBlockNote({
      schema,
      uploadFile,
    });

    const { transcribe } = useWhisper();
    const [isTranscribing, setIsTranscribing] = useState(false);

    const handleTranscribe = useCallback(
      async (audioUrl: string) => {
        setIsTranscribing(true);

        try {
          const result = await transcribe(audioUrl);

          if (!result.error && result.text) {
            // Find the audio block with this URL
            const blocks = editor.document;
            const audioBlock = blocks.find((block) => {
              if (block.type === "audio") {
                const props = block.props as Record<string, unknown>;
                return props?.url === audioUrl;
              }

              return false;
            });

            if (audioBlock) {
              editor.focus();
              editor.insertBlocks(
                [{ type: "paragraph", content: result.text }],
                audioBlock.id,
                "after"
              );
            }
          }
        } catch (error) {
          console.error("Transcription failed:", error);
        } finally {
          setIsTranscribing(false);
        }
      },
      [editor, transcribe]
    );

    const handleChange = useCallback(() => {
      const currentUrls = extractMediaUrls(editor.document);

      const removedUrls: string[] = [];

      previousUrlsRef.current.forEach((url) => {
        if (!currentUrls.has(url)) {
          removedUrls.push(url);
        }
      });

      if (removedUrls.length > 0) {
        deleteRemovedBlobs(removedUrls);
      }

      previousUrlsRef.current = currentUrls;

      onChange?.(editor.document);
    }, [editor, onChange]);

    const formattingToolbar = useCallback(
      () => (
        <CustomFormattingToolbar
          onTranscribe={handleTranscribe}
          isTranscribing={isTranscribing}
        />
      ),
      [handleTranscribe, isTranscribing]
    );

    useImperativeHandle(
      ref,
      () => ({
        getEditor: () => editor,
        insertBlock: (content: string) => {
          const currentBlock = editor.getTextCursorPosition().block;

          editor.insertBlocks(
            [
              {
                type: "paragraph",
                content: content,
              },
            ],
            currentBlock,
            "after"
          );
        },
        getAudioBlocks: () => {
          const audioBlocks: Array<{ block: Block; url: string }> = [];

          function traverse(block: Block) {
            if (block.type === "audio") {
              const props = block.props as Record<string, unknown>;

              if (props?.url && typeof props.url === "string") {
                audioBlocks.push({ block, url: props.url });
              }
            }

            if (block.children) {
              block.children.forEach(traverse);
            }
          }

          editor.document.forEach(traverse);

          return audioBlocks;
        },
      }),
      [editor]
    );

    // Load initial content after editor is ready to avoid position errors
    useEffect(() => {
      if (initialContentRef.current && initialContentRef.current.length > 0) {
        // Use setTimeout to ensure the editor is fully initialized
        setTimeout(() => {
          editor.replaceBlocks(editor.document, initialContentRef.current!);
          setIsContentLoaded(true);
        }, 0);
      } else {
        setIsContentLoaded(true);
      }
    }, [editor]);

    if (!isContentLoaded) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      );
    }

    return (
      <BlockNoteView
        editor={editor}
        theme={theme}
        editable={editable}
        filePanel={false}
        formattingToolbar={false}
        onChange={handleChange}
      >
        <FilePanelController filePanel={CustomFilePanel} />
        <FormattingToolbarController formattingToolbar={formattingToolbar} />
      </BlockNoteView>
    );
  }
);

async function uploadFile(file: File): Promise<string> {
  const response = await apiClient.upload<{ url: string }>(
    ApiEndpoint.UPLOAD,
    file
  );
  return response.url;
}

// Extract all media URLs from blocks (images, audio, video, files)
function extractMediaUrls(blocks: Block[]): Set<string> {
  const urls = new Set<string>();

  function traverse(block: Block) {
    const props = block.props as Record<string, unknown>;

    if (props?.url && typeof props.url === "string") {
      urls.add(props.url);
    }

    if (block.children) {
      block.children.forEach(traverse);
    }
  }

  blocks.forEach(traverse);

  return urls;
}

// Delete blobs that are no longer in the document
async function deleteRemovedBlobs(removedUrls: string[]) {
  const blobUrls = removedUrls.filter((url) =>
    url.includes("blob.vercel-storage.com")
  );

  if (blobUrls.length > 0) {
    try {
      await apiClient.delete(ApiEndpoint.UPLOAD, { urls: blobUrls });
    } catch (error) {
      console.error("Failed to delete blobs:", error);
    }
  }
}
