import { useCallback, useState } from "react";
import {
  CheckIcon,
  Loader2Icon,
  AlertCircleIcon,
  SparklesIcon,
  MessageSquareIcon,
  FileTextIcon,
  Trash2Icon,
  MoreVerticalIcon,
} from "lucide-react";
import type { Block } from "@blocknote/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

export function NotesPage() {
  const {
    selectedNoteId,
    isLoading,
    saveStatus,
    updateNote,
    deleteNote,
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);

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

  function handleTagsChange(tags: string[]) {
    if (selectedNoteId) {
      updateNote(selectedNoteId, { tags });
    }
  }

  async function handleGenerateTags() {
    if (!selectedNote) return;

    const text = extractTextFromBlocks(selectedNote.content);

    if (!text.trim()) {
      setErrorMessage("Note is empty. Add some content first!");
      setErrorDialogOpen(true);
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
      setErrorMessage("Failed to generate tags. Please try again.");
      setErrorDialogOpen(true);
    } finally {
      setIsGeneratingTags(false);
    }
  }

  function handleDeleteNote() {
    setDeleteDialogOpen(true);
  }

  function confirmDeleteNote() {
    if (selectedNoteId) {
      deleteNote(selectedNoteId);
      setDeleteDialogOpen(false);
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
    <>
      <div
        className={`flex h-full flex-col min-w-0 transition-[padding] duration-300 ease-in-out ${
          chatOpen ? "md:pr-96" : ""
        }`}
      >
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
                  variant="outline"
                  size="sm"
                  onClick={() => setChatOpen(!chatOpen)}
                  className="shrink-0"
                >
                  <MessageSquareIcon className="h-4 w-4 mr-1.5" />
                  Chat
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="shrink-0">
                      <MoreVerticalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTitleDialogOpen(true)}>
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      Generate Title
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleGenerateTags}
                      disabled={isGeneratingTags}
                    >
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      {isGeneratingTags
                        ? "Generating Tags..."
                        : "Generate Tags"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setSummaryDialogOpen(true)}
                    >
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      Summarize
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setBulletPointsDialogOpen(true)}
                    >
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      Bullet Points
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setRewriteToneDialogOpen(true)}
                    >
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      Rewrite Tone
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleDeleteNote}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2Icon className="h-4 w-4 mr-2" />
                      Delete Note
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
              />
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteNote}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
