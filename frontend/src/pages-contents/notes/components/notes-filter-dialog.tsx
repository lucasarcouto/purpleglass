import { FilterIcon, XIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";

interface NotesFilterDialogProps {
  open: boolean;
  availableTags: string[];
  selectedTags: string[];
  onSelectedTagsChange: (tags: string[]) => void;
  onOpenChange: (open: boolean) => void;
}

export function NotesFilterDialog({
  open,
  availableTags,
  selectedTags,
  onSelectedTagsChange,
  onOpenChange,
}: Readonly<NotesFilterDialogProps>) {
  function handleTagClick(tag: string) {
    if (selectedTags.includes(tag)) {
      onSelectedTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onSelectedTagsChange([...selectedTags, tag]);
    }
  }

  function handleClearAll() {
    onSelectedTagsChange([]);
  }

  function handleClose() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Filter Notes by Tags
          </DialogTitle>
          <DialogDescription>
            Select one or more tags to filter your notes. Click again to
            deselect.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[120px] max-h-[400px] overflow-y-auto py-4">
          {availableTags.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No tags available. Add tags to your notes first!
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={cn(
                      "px-3 py-2 text-sm rounded-md border transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80"
                    )}
                  >
                    {tag}
                    {isSelected && (
                      <XIcon className="inline-block h-3 w-3 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClearAll}
            disabled={selectedTags.length === 0}
          >
            Clear All
          </Button>
          <Button onClick={handleClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
