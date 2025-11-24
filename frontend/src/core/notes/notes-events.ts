type NoteEventType =
  | "note-created"
  | "note-deleted"
  | "note-title-updated"
  | "note-tags-updated"
  | "note-content-updated";
type NoteEventListener = () => void;

/**
 * Simple event system for note mutations
 * Allows components to subscribe to note changes
 */
class NotesEventEmitter {
  private readonly listeners: Map<NoteEventType, Set<NoteEventListener>> =
    new Map();

  subscribe(event: NoteEventType, listener: NoteEventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  emit(event: NoteEventType) {
    this.listeners.get(event)?.forEach((listener) => listener());
  }
}

export const notesEvents = new NotesEventEmitter();
