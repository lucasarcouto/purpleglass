import { useCallback, useState, useMemo } from "react";
import {
  PlusIcon,
  FileTextIcon,
  Trash2Icon,
  CheckIcon,
  Loader2Icon,
  AlertCircleIcon,
  SparklesIcon,
  MessageSquareIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "lucide-react";
import type { Block } from "@blocknote/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NoteEditor } from "@/pages-contents/notes/components/note-editor";
import { SummaryDialog } from "@/pages-contents/notes/components/summary-dialog";
import { TitleGenerationDialog } from "@/pages-contents/notes/components/title-generation-dialog";
import { TagsManager } from "@/pages-contents/notes/components/tags-manager";
import { BulletPointsDialog } from "@/pages-contents/notes/components/bullet-points-dialog";
import { RewriteToneDialog } from "@/pages-contents/notes/components/rewrite-tone-dialog";
import { ChatSidebar } from "@/pages-contents/notes/components/chat-sidebar";
import { useNotes } from "@/hooks/use-notes";
import { useAI } from "@/hooks/use-ai";
import { extractTextFromBlocks } from "@/utils/extract-text-from-blocks";
import { cn } from "@/utils/utils";

export function NotesPage() {
  const {
    notes,
    selectedNoteId,
    isLoading,
    saveStatus,
    createNote,
    updateNote,
    deleteNote,
    selectNote,
    getSelectedNote,
  } = useNotes();

  const { generateTags } = useAI();

  const selectedNote = getSelectedNote();

  // Dialog open states
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [titleDialogOpen, setTitleDialogOpen] = useState(false);
  const [bulletPointsDialogOpen, setBulletPointsDialogOpen] = useState(false);
  const [rewriteToneDialogOpen, setRewriteToneDialogOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Tags generation state (still needed for loading indicator)
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);

  // Filter state
  const [selectedFilterTag, setSelectedFilterTag] = useState<string | null>(
    null
  );
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);

  // Get all unique tags from all notes
  const allTags = useMemo(
    () =>
      Array.from(new Set(notes.flatMap((note) => note.tags || []))).sort(
        (a, b) => a.localeCompare(b)
      ),
    [notes]
  );

  // Filter notes based on selected tag
  const filteredNotes = useMemo(
    () =>
      selectedFilterTag
        ? notes.filter((note) => note.tags?.includes(selectedFilterTag))
        : notes,
    [notes, selectedFilterTag]
  );

  function handleCreateNote() {
    createNote({ title: "Untitled" });
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (selectedNoteId) {
      updateNote(selectedNoteId, { title: e.target.value });
    }
  }

  const handleContentChange = useCallback(
    (content: Block[]) => {
      if (selectedNoteId) {
        updateNote(selectedNoteId, { content });
      }
    },
    [selectedNoteId, updateNote]
  );

  function handleDeleteNote(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    deleteNote(id);
  }

  function handleTagsChange(tags: string[]) {
    if (selectedNoteId) {
      updateNote(selectedNoteId, { tags });
    }
  }

  async function handleGenerateTags() {
    if (!selectedNote) return;

    const text = extractTextFromBlocks(selectedNote.content);

    if (!text.trim()) {
      alert("Note is empty. Add some content first!");
      return;
    }

    setIsGeneratingTags(true);

    try {
      const tags = await generateTags(text);

      if (selectedNoteId) {
        updateNote(selectedNoteId, { tags });
      }
    } catch (error) {
      console.error("Failed to generate tags:", error);
      alert("Failed to generate tags. Please try again.");
    } finally {
      setIsGeneratingTags(false);
    }
  }

  function handleTagClick(tag: string) {
    if (selectedFilterTag === tag) {
      setSelectedFilterTag(null); // Clear filter if same tag clicked
    } else {
      setSelectedFilterTag(tag);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading notes...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Notes List Sidebar */}
      <div className="w-64 border-r border-border flex flex-col bg-card/50">
        <div className="p-3 border-b border-border">
          <Button onClick={handleCreateNote} className="w-full" size="sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="border-b border-border">
            <button
              onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
              className="w-full p-3 flex items-center justify-between hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {isFilterCollapsed ? (
                  <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-xs font-medium text-muted-foreground">
                  FILTER BY TAG
                </span>
                <span className="text-xs text-muted-foreground">
                  ({allTags.length})
                </span>
              </div>
              {selectedFilterTag && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFilterTag(null);
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-5 px-2 text-xs"
                >
                  Clear
                </Button>
              )}
            </button>

            {!isFilterCollapsed && (
              <div className="px-3 pb-3">
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={cn(
                        "px-2 py-1 text-xs rounded-md border transition-colors",
                        selectedFilterTag === tag
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {filteredNotes.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              {selectedFilterTag
                ? `No notes with tag "${selectedFilterTag}"`
                : "No notes yet. Create one to get started!"}
            </div>
          ) : (
            <ul className="py-1">
              {filteredNotes.map((note) => (
                <li key={note.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => selectNote(note.id)}
                    onKeyDown={(e) => e.key === "Enter" && selectNote(note.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 flex items-start gap-2 hover:bg-accent/50 transition-colors group cursor-pointer",
                      selectedNoteId === note.id && "bg-accent"
                    )}
                  >
                    <FileTextIcon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {note.title || "Untitled"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {note.updatedAt.toLocaleDateString()}
                      </p>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {note.tags.slice(0, 3).map((tag) => (
                            <button
                              key={tag}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTagClick(tag);
                              }}
                              className={cn(
                                "px-1.5 py-0.5 text-xs rounded border transition-colors",
                                selectedFilterTag === tag
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80"
                              )}
                            >
                              {tag}
                            </button>
                          ))}
                          {note.tags.length > 3 && (
                            <span className="px-1.5 py-0.5 text-xs text-muted-foreground">
                              +{note.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                      onClick={(e) => handleDeleteNote(e, note.id)}
                    >
                      <Trash2Icon className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedNote ? (
          <>
            <div className="p-4 border-b border-border space-y-4">
              <div className="flex items-center gap-3">
                <Input
                  value={selectedNote.title}
                  onChange={handleTitleChange}
                  placeholder="Note title..."
                  className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 px-0 h-auto flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTitleDialogOpen(true)}
                  className="shrink-0"
                >
                  <SparklesIcon className="h-4 w-4 mr-1.5" />
                  Generate Title
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChatOpen(true)}
                  className="shrink-0"
                >
                  <MessageSquareIcon className="h-4 w-4 mr-1.5" />
                  Chat
                </Button>
                {saveStatus !== "idle" && (
                  <div className="flex items-center gap-2 text-sm shrink-0">
                    {saveStatus === "saving" && (
                      <>
                        <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-muted-foreground">Saving...</span>
                      </>
                    )}
                    {saveStatus === "saved" && (
                      <>
                        <CheckIcon className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Saved</span>
                      </>
                    )}
                    {saveStatus === "error" && (
                      <>
                        <AlertCircleIcon className="h-4 w-4 text-destructive" />
                        <span className="text-destructive">Failed to save</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <TagsManager
                tags={selectedNote.tags || []}
                onTagsChange={handleTagsChange}
                onGenerateTags={handleGenerateTags}
                isGenerating={isGeneratingTags}
              />

              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => setSummaryDialogOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  <SparklesIcon className="h-4 w-4 mr-1.5" />
                  Summarize
                </Button>
                <Button
                  onClick={() => setBulletPointsDialogOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  <SparklesIcon className="h-4 w-4 mr-1.5" />
                  Bullet Points
                </Button>
                <Button
                  onClick={() => setRewriteToneDialogOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  <SparklesIcon className="h-4 w-4 mr-1.5" />
                  Rewrite Tone
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NoteEditor
                key={selectedNote.id}
                initialContent={selectedNote.content}
                onChange={handleContentChange}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <FileTextIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a note or create a new one</p>
            </div>
          </div>
        )}
      </div>

      <SummaryDialog
        open={summaryDialogOpen}
        onOpenChange={setSummaryDialogOpen}
        noteContent={selectedNote?.content || []}
      />

      <TitleGenerationDialog
        open={titleDialogOpen}
        onOpenChange={setTitleDialogOpen}
        noteId={selectedNoteId}
        noteContent={selectedNote?.content || []}
      />

      <BulletPointsDialog
        open={bulletPointsDialogOpen}
        onOpenChange={setBulletPointsDialogOpen}
        noteContent={selectedNote?.content || []}
      />

      <RewriteToneDialog
        open={rewriteToneDialogOpen}
        onOpenChange={setRewriteToneDialogOpen}
        noteContent={selectedNote?.content || []}
      />

      <ChatSidebar
        isOpen={chatOpen}
        noteId={selectedNoteId}
        noteTitle={selectedNote?.title}
        noteContent={selectedNote?.content}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}
