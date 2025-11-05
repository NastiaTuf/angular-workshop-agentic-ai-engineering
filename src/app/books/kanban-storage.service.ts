import { inject, Injectable } from '@angular/core';
import { KanbanState, ReadingStatus } from './kanban-book';

@Injectable({ providedIn: 'root' })
export class KanbanStorageService {
  private readonly storageKey = 'book-kanban-state';

  private getDefaultState(): KanbanState {
    return {
      'want-to-read': [],
      'currently-reading': [],
      completed: [],
      ratings: {}
    };
  }

  getKanbanState(): KanbanState {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return this.getDefaultState();
      }
      const parsed = JSON.parse(stored) as KanbanState;
      return {
        'want-to-read': parsed['want-to-read'] || [],
        'currently-reading': parsed['currently-reading'] || [],
        completed: parsed.completed || [],
        ratings: parsed.ratings || {}
      };
    } catch (error) {
      console.error('Error reading kanban state from localStorage:', error);
      return this.getDefaultState();
    }
  }

  saveKanbanState(state: KanbanState): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving kanban state to localStorage:', error);
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please remove some books.');
      }
    }
  }

  addBookToKanban(isbn: string, status: ReadingStatus = 'want-to-read'): void {
    const state = this.getKanbanState();
    this.removeBookFromAllColumns(state, isbn);

    if (!state[status].includes(isbn)) {
      state[status].push(isbn);
    }

    this.saveKanbanState(state);
  }

  removeBookFromKanban(isbn: string): void {
    const state = this.getKanbanState();
    this.removeBookFromAllColumns(state, isbn);
    
    if (state.ratings && state.ratings[isbn]) {
      delete state.ratings[isbn];
    }

    this.saveKanbanState(state);
  }

  updateBookStatus(isbn: string, newStatus: ReadingStatus): void {
    const state = this.getKanbanState();
    this.removeBookFromAllColumns(state, isbn);

    if (!state[newStatus].includes(isbn)) {
      state[newStatus].push(isbn);
    }

    this.saveKanbanState(state);
  }

  private removeBookFromAllColumns(state: KanbanState, isbn: string): void {
    state['want-to-read'] = state['want-to-read'].filter(s => s !== isbn);
    state['currently-reading'] = state['currently-reading'].filter(s => s !== isbn);
    state.completed = state.completed.filter(s => s !== isbn);
  }

  updateBookRating(isbn: string, rating: number): void {
    const state = this.getKanbanState();
    
    if (!state.ratings) {
      state.ratings = {};
    }
    
    state.ratings[isbn] = rating;
    this.saveKanbanState(state);
  }

  getBookStatus(isbn: string): ReadingStatus | null {
    const state = this.getKanbanState();
    
    if (state['want-to-read'].includes(isbn)) {
      return 'want-to-read';
    }
    if (state['currently-reading'].includes(isbn)) {
      return 'currently-reading';
    }
    if (state.completed.includes(isbn)) {
      return 'completed';
    }
    
    return null;
  }

  getBookRating(isbn: string): number | undefined {
    const state = this.getKanbanState();
    return state.ratings?.[isbn];
  }

  isBookInKanban(isbn: string): boolean {
    return this.getBookStatus(isbn) !== null;
  }
}

