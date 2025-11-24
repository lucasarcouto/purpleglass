import { useContext } from "react";
import { WhisperContext } from "@/core/whisper/whisper-context";

export function useWhisper() {
  const context = useContext(WhisperContext);

  if (!context) {
    throw new Error("useWhisper must be used within a WhisperProvider");
  }

  return context;
}
