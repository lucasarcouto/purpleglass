import { useContext } from "react";
import { AIContext } from "@/core/ai/ai-context";

export function useAI() {
  const context = useContext(AIContext);

  if (!context) {
    throw new Error("useAI must be used within an AIProvider");
  }

  return context;
}
