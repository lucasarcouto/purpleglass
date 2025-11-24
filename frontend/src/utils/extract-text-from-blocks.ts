import type { Block } from "@blocknote/core";

/**
 * Extracts plain text from BlockNote blocks for AI processing
 */
export function extractTextFromBlocks(blocks: Block[]): string {
  const textParts: string[] = [];

  function extractTextFromContent(content: unknown): string {
    if (typeof content === "string") {
      return content;
    }

    if (Array.isArray(content)) {
      return content.map(extractTextFromContent).join("");
    }

    if (content && typeof content === "object") {
      // Direct text property
      if ("text" in content) {
        return content.text as string;
      }

      // Nested content (e.g., links have content arrays)
      if ("content" in content) {
        return extractTextFromContent(content.content);
      }
    }

    return "";
  }

  function processBlock(block: Block): void {
    // Extract text from inline content
    if (block.content) {
      const text = extractTextFromContent(block.content);

      if (text.trim()) {
        textParts.push(text.trim());
      }
    }

    // Process nested children blocks recursively
    if (block.children && Array.isArray(block.children)) {
      block.children.forEach(processBlock);
    }
  }

  blocks.forEach(processBlock);

  return textParts.join("\n\n");
}
