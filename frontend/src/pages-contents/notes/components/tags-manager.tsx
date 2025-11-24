import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TagsManagerProps {
  tags: string[];
  isGenerating?: boolean;
  compact?: boolean;
  onTagsChange: (tags: string[]) => void;
  onGenerateTags?: () => void;
}

export function TagsManager({
  tags,
  isGenerating = false,
  compact = false,
  onTagsChange,
  onGenerateTags,
}: Readonly<TagsManagerProps>) {
  const [newTag, setNewTag] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  function handleAddTag() {
    const trimmedTag = newTag.trim();

    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag]);
      setNewTag("");
      setIsAdding(false);
    }
  }

  function handleRemoveTag(tagToRemove: string) {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleAddTag();
    } else if (e.key === "Escape") {
      setNewTag("");
      setIsAdding(false);
    }
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Tags</Label>
        {onGenerateTags && (
          <Button
            onClick={onGenerateTags}
            disabled={isGenerating}
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-1.5" />
                Generate Tags
              </>
            )}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="pl-2.5 pr-1.5 py-1 text-sm flex items-center gap-1.5"
          >
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {isAdding ? (
          <div className="flex items-center gap-1">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={() => {
                if (!newTag.trim()) {
                  setIsAdding(false);
                }
              }}
              placeholder="Tag name..."
              className="h-7 w-32 text-sm"
              autoFocus
            />
          </div>
        ) : (
          <Button
            onClick={() => setIsAdding(true)}
            variant="outline"
            size="sm"
            className="h-7 px-2"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Tag
          </Button>
        )}
      </div>

      {tags.length === 0 && !isAdding && (
        <p className="text-xs text-muted-foreground">
          No tags yet. Add tags manually or generate them with AI.
        </p>
      )}
    </div>
  );
}
