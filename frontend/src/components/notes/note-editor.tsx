import { useRef, useCallback } from "react";
import { useCreateBlockNote, FilePanelController } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import type { Block } from "@blocknote/core";
import { useTheme } from "@/hooks/use-theme";
import { apiClient } from "@/core/api/api-client";
import { ApiEndpoint } from "@/core/api/api-endpoint";
import { CustomFilePanel } from "./custom-file-panel";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

interface NoteEditorProps {
  initialContent?: Block[];
  editable?: boolean;
  onChange?: (content: Block[]) => void;
}

export function NoteEditor({
  initialContent,
  editable = true,
  onChange,
}: Readonly<NoteEditorProps>) {
  const { theme } = useTheme();

  const previousUrlsRef = useRef<Set<string>>(
    initialContent ? extractMediaUrls(initialContent) : new Set()
  );

  const editor = useCreateBlockNote({
    initialContent: initialContent?.length ? initialContent : undefined,
    uploadFile,
  });

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

  return (
    <BlockNoteView
      editor={editor}
      theme={theme}
      editable={editable}
      filePanel={false}
      onChange={handleChange}
    >
      <FilePanelController filePanel={CustomFilePanel} />
    </BlockNoteView>
  );
}

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
