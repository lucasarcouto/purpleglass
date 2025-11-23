import { useState, useCallback } from "react";
import { useBlockNoteEditor } from "@blocknote/react";
import type { FilePanelProps } from "@blocknote/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AudioRecorder } from "./audio-recorder";
import { cn } from "@/utils/utils";
import { UploadIcon, LinkIcon, MicIcon, Loader2Icon } from "lucide-react";

type Tab = "upload" | "embed" | "record";

export function CustomFilePanel(props: Readonly<FilePanelProps>) {
  const editor = useBlockNoteEditor();

  const [currentTab, setCurrentTab] = useState<Tab>("upload");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");

  const isAudioBlock = props.block.type === "audio";

  const acceptTypeMap: Record<string, string> = {
    image: "image/*",
    video: "video/*",
    audio: "audio/*",
  };

  const acceptType = acceptTypeMap[props.block.type] || "*/*";

  const tabs: {
    id: Tab;
    label: string;
    icon: React.ReactNode;
    show: boolean;
  }[] = [
    {
      id: "upload",
      label: "Upload",
      icon: <UploadIcon className="h-4 w-4" />,
      show: true,
    },
    {
      id: "embed",
      label: "Embed",
      icon: <LinkIcon className="h-4 w-4" />,
      show: true,
    },
    {
      id: "record",
      label: "Record",
      icon: <MicIcon className="h-4 w-4" />,
      show: isAudioBlock,
    },
  ];

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (!file) return;

      setUploadLoading(true);

      try {
        const uploaded = await editor.uploadFile?.(file);

        if (uploaded) {
          editor.updateBlock(props.block, {
            props: { url: uploaded },
          });
        }
      } finally {
        setUploadLoading(false);
      }
    },
    [editor, props.block]
  );

  const handleEmbed = useCallback(() => {
    if (embedUrl.trim()) {
      editor.updateBlock(props.block, {
        props: { url: embedUrl.trim() },
      });
    }
  }, [editor, props.block, embedUrl]);

  const handleRecordComplete = useCallback(
    (url: string) => {
      editor.updateBlock(props.block, {
        props: { url },
      });
    },
    [editor, props.block]
  );

  const handleUploadForRecorder = useCallback(
    async (file: File): Promise<string> => {
      const uploaded = await editor.uploadFile?.(file);

      if (typeof uploaded === "string") {
        return uploaded;
      }

      return "";
    },
    [editor]
  );

  return (
    <div className="w-80 bg-popover border rounded-lg shadow-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        {tabs
          .filter((tab) => tab.show)
          .map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
                currentTab === tab.id
                  ? "bg-accent text-accent-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {currentTab === "upload" && (
          <div className="space-y-3">
            <label
              className={cn(
                "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                uploadLoading
                  ? "bg-muted pointer-events-none"
                  : "hover:bg-accent/50 hover:border-primary"
              )}
            >
              {uploadLoading ? (
                <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <UploadIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </span>
                </>
              )}
              <input
                type="file"
                className="hidden"
                accept={acceptType}
                onChange={handleFileChange}
                disabled={uploadLoading}
              />
            </label>
          </div>
        )}

        {currentTab === "embed" && (
          <div className="space-y-3">
            <Input
              placeholder="Paste URL..."
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmbed()}
            />
            <Button
              onClick={handleEmbed}
              className="w-full"
              disabled={!embedUrl.trim()}
            >
              Embed
            </Button>
          </div>
        )}

        {currentTab === "record" && isAudioBlock && (
          <AudioRecorder
            onUpload={handleUploadForRecorder}
            onComplete={handleRecordComplete}
          />
        )}
      </div>
    </div>
  );
}
