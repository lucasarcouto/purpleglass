import { useCallback } from "react";
import {
  Plus,
  FileText,
  FileTextIcon,
  Trash2Icon,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { Block } from "@blocknote/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NoteEditor } from "@/components/notes/note-editor";
import { useNotes } from "@/hooks/use-notes";
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

  const selectedNote = getSelectedNote();

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
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No notes yet. Create one to get started!
            </div>
          ) : (
            <ul className="py-1">
              {notes.map((note) => (
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
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Input
                value={selectedNote.title}
                onChange={handleTitleChange}
                placeholder="Note title..."
                className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 px-0 h-auto flex-1"
              />
              {saveStatus !== "idle" && (
                <div className="flex items-center gap-2 text-sm shrink-0">
                  {saveStatus === "saving" && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground">Saving...</span>
                    </>
                  )}
                  {saveStatus === "saved" && (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Saved</span>
                    </>
                  )}
                  {saveStatus === "error" && (
                    <>
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-destructive">Failed to save</span>
                    </>
                  )}
                </div>
              )}
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
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a note or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
