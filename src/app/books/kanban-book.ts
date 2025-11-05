export type ReadingStatus = 'want-to-read' | 'currently-reading' | 'completed';

export interface KanbanState {
  'want-to-read': string[];
  'currently-reading': string[];
  completed: string[];
  ratings?: Record<string, number>;
}

