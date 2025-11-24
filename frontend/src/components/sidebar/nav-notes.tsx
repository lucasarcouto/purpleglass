"use client";

import { useState, useMemo, useEffect } from "react";
import {
  NotebookPenIcon,
  PlusIcon,
  FilterIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SettingsIcon,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useRouter } from "@tanstack/react-router";
import { notesService } from "@/core/services/notes-service";
import type { Note } from "@/core/notes/types";
import { notesEvents } from "@/core/notes/notes-events";
import { NotesFilterDialog } from "@/pages-contents/notes/components/notes-filter-dialog";
import { cn } from "@/utils/utils";

export function NavNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const router = useRouter();

  // Get all unique tags from all notes
  const allTags = useMemo(
    () =>
      Array.from(new Set(notes.flatMap((note) => note.tags || []))).sort(
        (a, b) => a.localeCompare(b)
      ),
    [notes]
  );

  // Filter notes based on selected tags
  const filteredNotes = useMemo(
    () =>
      selectedTags.length > 0
        ? notes.filter((note) =>
            selectedTags.some((tag) => note.tags?.includes(tag))
          )
        : notes,
    [notes, selectedTags]
  );

  async function handleCreateNote() {
    try {
      const newNote = await notesService.createNote({ title: "Untitled" });
      notesEvents.emit("note-created");
      router.navigate({ to: "/notes/$noteId", params: { noteId: newNote.id } });
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  }

  function handleOpenFilter() {
    setFilterDialogOpen(true);
  }

  function isActive(noteId: string) {
    return router.latestLocation.pathname === `/notes/${noteId}`;
  }

  // Fetch notes on mount and subscribe to note events
  useEffect(() => {
    async function loadNotes() {
      try {
        const fetchedNotes = await notesService.fetchNotes();
        setNotes(fetchedNotes);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
      }
    }

    // Initial load
    loadNotes();

    // Subscribe to note events
    const unsubscribeCreated = notesEvents.subscribe("note-created", loadNotes);
    const unsubscribeDeleted = notesEvents.subscribe("note-deleted", loadNotes);
    const unsubscribeTitle = notesEvents.subscribe(
      "note-title-updated",
      loadNotes
    );
    const unsubscribeTags = notesEvents.subscribe(
      "note-tags-updated",
      loadNotes
    );

    return () => {
      unsubscribeCreated();
      unsubscribeDeleted();
      unsubscribeTitle();
      unsubscribeTags();
    };
  }, []);

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center w-full">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 flex-1 px-2 py-1.5 text-sm hover:bg-sidebar-accent rounded-md transition-colors"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4 shrink-0" />
                )}
                <NotebookPenIcon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">Notes</span>
                {selectedTags.length > 0 && (
                  <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                    {selectedTags.length}
                  </span>
                )}
              </button>

              <div className="flex gap-0.5 pr-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenFilter();
                  }}
                  title="Filter notes by tags"
                >
                  <FilterIcon
                    className={cn(
                      "h-3.5 w-3.5",
                      selectedTags.length > 0 && "text-primary"
                    )}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateNote();
                  }}
                  title="Create new note"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {isExpanded && (
              <SidebarMenuSub>
                {filteredNotes.length === 0 ? (
                  <div className="px-2 py-4 text-xs text-muted-foreground text-center">
                    {selectedTags.length > 0
                      ? "No notes with selected tags"
                      : "No notes yet"}
                  </div>
                ) : (
                  filteredNotes.map((note) => (
                    <SidebarMenuSubItem key={note.id}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isActive(note.id)}
                      >
                        <a href={`/notes/${note.id}`}>
                          <span className="truncate">
                            {note.title || "Untitled"}
                          </span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))
                )}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>

          {/* Settings item */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={router.latestLocation.pathname === "/settings"}
            >
              <a href="/settings">
                <SettingsIcon className="h-4 w-4" />
                <span>Settings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <NotesFilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        availableTags={allTags}
        selectedTags={selectedTags}
        onSelectedTagsChange={setSelectedTags}
      />
    </>
  );
}
