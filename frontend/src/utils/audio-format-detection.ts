/**
 * Detects the best supported audio format for the current browser's MediaRecorder API
 * @returns An object containing the MIME type and file extension
 */
export function detectSupportedAudioFormat(): {
  mimeType: string;
  extension: string;
} {
  // Check if MediaRecorder is available
  if (typeof MediaRecorder === "undefined") {
    // Fallback for environments without MediaRecorder
    return { mimeType: "audio/webm", extension: "webm" };
  }

  // Priority order of formats to check
  const formats = [
    { mimeType: "audio/webm;codecs=opus", extension: "webm" },
    { mimeType: "audio/webm", extension: "webm" },
    { mimeType: "audio/mp4", extension: "mp4" },
    { mimeType: "audio/ogg;codecs=opus", extension: "ogg" },
    { mimeType: "audio/ogg", extension: "ogg" },
  ];

  // Find the first supported format
  for (const format of formats) {
    if (MediaRecorder.isTypeSupported(format.mimeType)) {
      return format;
    }
  }

  // Ultimate fallback (should rarely happen)
  console.warn("No supported audio format detected, using webm as fallback");
  return { mimeType: "audio/webm", extension: "webm" };
}
