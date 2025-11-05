import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Book } from './book';
import { KanbanStorageService } from './kanban-storage.service';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-book-item',
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <a
        [routerLink]="['/books', book().isbn]"
        class="flex flex-col flex-grow cursor-pointer"
      >
        <div class="relative aspect-[3/4] overflow-hidden">
          @if (book().cover) {
            <img
              [src]="book().cover"
              [alt]="book().title"
              class="w-full h-full object-contain bg-gray-100"
            />
          }
          @if (!book().cover) {
            <div class="w-full h-full bg-gray-100 flex items-center justify-center">
              <span class="text-gray-500 text-sm font-medium">No cover available</span>
            </div>
          }
        </div>
        <div class="p-5 flex flex-col flex-grow">
          <h2 class="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">{{ book().title }}</h2>
          @if (book().subtitle) {
            <p class="text-sm text-gray-600 mb-2 line-clamp-2">{{ book().subtitle }}</p>
          }
          <div class="text-sm text-gray-700 mt-auto">
            <p>
              <span class="text-blue-700">{{ book().author }}</span>
            </p>
            @if (book().isbn) {
              <p class="text-xs text-gray-500 mt-2">ISBN: {{ book().isbn }}</p>
            }
          </div>
        </div>
      </a>
      <div class="px-5 pb-5">
        @if (isInKanban()) {
          <button
            (click)="removeFromKanban(); $event.stopPropagation()"
            class="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            In Kanban
          </button>
        } @else {
          <button
            (click)="addToKanban(); $event.stopPropagation()"
            class="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Add to Kanban
          </button>
        }
      </div>
    </div>
  `
})
export class BookItemComponent {
  book = input.required<Book>();
  private readonly kanbanStorage = inject(KanbanStorageService);
  private readonly toastService = inject(ToastService);

  isInKanban = signal(false);

  constructor() {
    // Check if book is in kanban whenever book changes
    effect(() => {
      const currentBook = this.book();
      if (currentBook) {
        this.isInKanban.set(this.kanbanStorage.isBookInKanban(currentBook.isbn));
      }
    });
  }

  addToKanban(): void {
    this.kanbanStorage.addBookToKanban(this.book().isbn, 'want-to-read');
    this.isInKanban.set(true);
    this.toastService.show(`"${this.book().title}" added to kanban`);
  }

  removeFromKanban(): void {
    this.kanbanStorage.removeBookFromKanban(this.book().isbn);
    this.isInKanban.set(false);
    this.toastService.show(`"${this.book().title}" removed from kanban`);
  }
}
