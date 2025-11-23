import { useReactMediaRecorder } from "react-media-recorder";
import { Button } from "@/components/ui/button";
import { Mic, Square, Upload, Loader2, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { detectSupportedAudioFormat } from "@/utils/audio-format-detection";

interface AudioRecorderProps {
  onUpload: (file: File) => Promise<string>;
  onComplete: (url: string) => void;
}

export function AudioRecorder({
  onUpload,
  onComplete,
}: Readonly<AudioRecorderProps>) {
  const [isUploading, setIsUploading] = useState(false);

  // Detect the best supported audio format for this browser
  const audioFormat = useMemo(() => detectSupportedAudioFormat(), []);

  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } =
    useReactMediaRecorder({
      audio: true,
      blobPropertyBag: { type: audioFormat.mimeType },
    });

  const isRecording = status === "recording";
  const hasRecording = !!mediaBlobUrl;

  async function handleUpload() {
    if (!mediaBlobUrl) return;

    setIsUploading(true);

    try {
      const response = await fetch(mediaBlobUrl);
      const blob = await response.blob();
      const file = new File(
        [blob],
        `recording-${Date.now()}.${audioFormat.extension}`,
        {
          type: audioFormat.mimeType,
        }
      );

      const url = await onUpload(file);

      onComplete(url);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Status indicator */}
      <div className="flex items-center justify-center gap-2 py-2">
        {isRecording && (
          <>
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Recording...</span>
          </>
        )}
        {!isRecording && !hasRecording && (
          <span className="text-sm text-muted-foreground">
            Click to start recording
          </span>
        )}
        {hasRecording && !isRecording && (
          <span className="text-sm font-medium text-green-600">
            Recording ready
          </span>
        )}
      </div>

      {/* Audio preview */}
      {hasRecording && (
        <audio
          src={mediaBlobUrl}
          controls
          className="w-full h-10"
          aria-label="Audio recording preview"
        >
          <track kind="captions" />
        </audio>
      )}

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        {!isRecording && !hasRecording && (
          <Button onClick={startRecording} className="flex-1">
            <Mic className="w-4 h-4 mr-2" />
            Start
          </Button>
        )}

        {isRecording && (
          <Button
            onClick={stopRecording}
            variant="destructive"
            className="flex-1"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        )}

        {hasRecording && (
          <>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {isUploading ? "Uploading..." : "Use"}
            </Button>
            <Button
              onClick={clearBlobUrl}
              variant="outline"
              size="icon"
              disabled={isUploading}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
