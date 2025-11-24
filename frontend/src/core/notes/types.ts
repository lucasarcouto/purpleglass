import type { Block } from "@blocknote/core";

export interface Note {
  id: string;
  title: string;
  content: Block[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteInput {
  title: string;
  content?: Block[];
  tags?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: Block[];
  tags?: string[];
}
