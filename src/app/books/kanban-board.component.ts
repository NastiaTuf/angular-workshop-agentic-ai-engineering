import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Book } from './book';
import { BookApiClient } from './book-api-client.service';
import { KanbanStorageService } from './kanban-storage.service';
import { ReadingStatus } from './kanban-book';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-kanban-board',
  imports: [CommonModule, DragDropModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div class="container mx-auto px-4 max-w-7xl">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Reading Tracker
              </h1>
              <p class="text-gray-600 mt-2">Track your reading progress by dragging books between columns</p>
            </div>
            <a
              routerLink="/"
              class="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition duration-200"
            >
              <svg
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back to Books
            </a>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-white rounded-lg p-4 shadow-md">
              <div class="text-sm text-gray-600 uppercase tracking-wide">Want to Read</div>
              <div class="text-2xl font-bold text-blue-600 mt-1">{{ wantToReadBooks().length }}</div>
            </div>
            <div class="bg-white rounded-lg p-4 shadow-md">
              <div class="text-sm text-gray-600 uppercase tracking-wide">Currently Reading</div>
              <div class="text-2xl font-bold text-blue-600 mt-1">{{ currentlyReadingBooks().length }}</div>
            </div>
            <div class="bg-white rounded-lg p-4 shadow-md">
              <div class="text-sm text-gray-600 uppercase tracking-wide">Completed</div>
              <div class="text-2xl font-bold text-blue-600 mt-1">{{ completedBooks().length }}</div>
            </div>
          </div>
        </div>

        @if (loading()) {
          <div class="flex justify-center items-center py-20">
            <div class="animate-pulse flex flex-col items-center">
              <div
                class="h-16 w-16 rounded-full border-4 border-t-blue-700 border-r-blue-700 border-b-gray-200 border-l-gray-200 animate-spin"
              ></div>
              <p class="mt-4 text-gray-600">Loading books...</p>
            </div>
          </div>
        }

        @if (!loading()) {
          <!-- Kanban Board -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            @for (column of columns; track column.status) {
              <div
                class="bg-white rounded-xl shadow-lg p-4 min-h-[400px]"
                cdkDropList
                [id]="column.id"
                [cdkDropListData]="
                  column.status === 'want-to-read'
                    ? wantToReadBooks()
                    : column.status === 'currently-reading'
                      ? currentlyReadingBooks()
                      : completedBooks()
                "
                [cdkDropListConnectedTo]="getColumnIds()"
                (cdkDropListDropped)="onBookDrop($event)"
              >
                <!-- Column Header -->
                <div class="mb-4 pb-3 border-b border-gray-200">
                  <h2 class="text-lg font-semibold text-gray-800">{{ column.title }}</h2>
                  <p class="text-sm text-gray-500 mt-1">
                    {{ (column.status === 'want-to-read' ? wantToReadBooks() : column.status === 'currently-reading' ? currentlyReadingBooks() : completedBooks()).length }} books
                  </p>
                </div>

                <!-- Book Cards -->
                <div class="space-y-3 min-h-[300px]">
                  @for (book of (column.status === 'want-to-read' ? wantToReadBooks() : column.status === 'currently-reading' ? currentlyReadingBooks() : completedBooks()); track book.isbn) {
                    <div
                      cdkDrag
                      class="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-md p-4 cursor-move hover:shadow-lg transition-shadow duration-200 border border-gray-100"
                    >
                      <div class="flex items-start gap-3">
                        <!-- Book Cover -->
                        <div class="flex-shrink-0 w-16 h-24 bg-gray-100 rounded overflow-hidden">
                          @if (book.cover) {
                            <img [src]="book.cover" [alt]="book.title" class="w-full h-full object-cover" />
                          } @else {
                            <div class="w-full h-full flex items-center justify-center">
                              <span class="text-gray-400 text-xs text-center px-1">No cover</span>
                            </div>
                          }
                        </div>

                        <!-- Book Info -->
                        <div class="flex-1 min-w-0">
                          <h3 class="font-semibold text-gray-800 text-sm line-clamp-2 mb-1">{{ book.title }}</h3>
                          <p class="text-xs text-gray-600 mb-2">{{ book.author }}</p>

                          <!-- Rating -->
                          <div class="flex items-center gap-1 mb-2">
                            @for (star of [1, 2, 3, 4, 5]; track star) {
                              <button
                                type="button"
                                (click)="setRating(book.isbn, star); $event.stopPropagation()"
                                [class]="
                                  (getRating(book.isbn) ?? 0) >= star
                                    ? 'text-yellow-400 hover:text-yellow-500 transition-colors duration-150'
                                    : 'text-gray-300 hover:text-yellow-400 transition-colors duration-150'
                                "
                              >
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                  />
                                </svg>
                              </button>
                            }
                            @if (getRating(book.isbn)) {
                              <span class="text-xs text-gray-500 ml-1">
                                {{ getRatingLabel(getRating(book.isbn)!) }}
                              </span>
                            }
                          </div>

                          <!-- Remove Button -->
                          <button
                            type="button"
                            (click)="removeBook(book.isbn); $event.stopPropagation()"
                            class="text-red-500 hover:text-red-700 text-xs font-medium transition-colors duration-150"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  }

                  <!-- Empty State -->
                  @if ((column.status === 'want-to-read' ? wantToReadBooks() : column.status === 'currently-reading' ? currentlyReadingBooks() : completedBooks()).length === 0) {
                    <div class="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                      <svg
                        class="w-12 h-12 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      <p class="text-sm">No books here</p>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Empty Kanban State -->
          @if (kanbanBooks().size === 0) {
            <div class="bg-white rounded-xl shadow-lg p-12 text-center">
              <svg
                class="w-20 h-20 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h2 class="text-2xl font-semibold text-gray-800 mb-2">Your kanban board is empty</h2>
              <p class="text-gray-600 mb-6">Add books from the book list to start tracking your reading progress</p>
              <a
                routerLink="/"
                class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Browse Books
              </a>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class KanbanBoardComponent {
  private readonly kanbanStorage = inject(KanbanStorageService);
  private readonly bookApiClient = inject(BookApiClient);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  kanbanBooks = signal<Map<string, Book>>(new Map());
  kanbanState = signal(this.kanbanStorage.getKanbanState());
  loading = signal(true);

  readonly columns = [
    { id: 'want-to-read', title: 'Want to Read', status: 'want-to-read' as ReadingStatus },
    { id: 'currently-reading', title: 'Currently Reading', status: 'currently-reading' as ReadingStatus },
    { id: 'completed', title: 'Completed', status: 'completed' as ReadingStatus }
  ] as const;

  wantToReadBooks = computed(() => this.getBooksByStatus('want-to-read'));
  currentlyReadingBooks = computed(() => this.getBooksByStatus('currently-reading'));
  completedBooks = computed(() => this.getBooksByStatus('completed'));

  constructor() {
    this.loadBooks();
  }

  private loadBooks(): void {
    this.loading.set(true);
    const state = this.kanbanStorage.getKanbanState();
    const allIsbns = [
      ...state['want-to-read'],
      ...state['currently-reading'],
      ...state.completed
    ];

    if (allIsbns.length === 0) {
      this.loading.set(false);
      return;
    }

          // Fetch all books in parallel
    const bookRequests = allIsbns.map(isbn =>
      this.bookApiClient.getBook(isbn).pipe(
        catchError(error => {
          console.error(`Error fetching book ${isbn}:`, error);
          return of(null);
        })
      )
    );

    forkJoin(bookRequests)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: books => {
          const booksMap = new Map<string, Book>();
          books.forEach((book, index) => {
            if (book) {
              booksMap.set(allIsbns[index], book);
            }
          });
          this.kanbanBooks.set(booksMap);
          this.kanbanState.set(this.kanbanStorage.getKanbanState());
          this.loading.set(false);
        },
        error: error => {
          console.error('Error loading books:', error);
          this.loading.set(false);
          this.toastService.show('Error loading books from kanban');
        }
      });
  }

  getBooksByStatus(status: ReadingStatus): Book[] {
    const state = this.kanbanState();
    const isbns = state[status];
    const booksMap = this.kanbanBooks();
    return isbns.map(isbn => booksMap.get(isbn)).filter((book): book is Book => book !== undefined);
  }

  getColumnIds(): string[] {
    return this.columns.map(col => col.id);
  }

  onBookDrop(event: CdkDragDrop<Book[]>): void {
    if (event.previousContainer === event.container) {
      // Reordering within same column - no need to update storage
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Moving between columns
      const book = event.previousContainer.data[event.previousIndex];
      const previousStatus = this.getStatusForColumnId(event.previousContainer.id);
      const newStatus = this.getStatusForColumnId(event.container.id);

      if (previousStatus && newStatus && book) {
        transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
        this.kanbanStorage.updateBookStatus(book.isbn, newStatus);
        this.kanbanState.set(this.kanbanStorage.getKanbanState());
        this.toastService.show(`Moved "${book.title}" to ${this.getColumnTitle(newStatus)}`);
      }
    }
  }

  private getStatusForColumnId(columnId: string): ReadingStatus | null {
    const column = this.columns.find(col => col.id === columnId);
    return column ? column.status : null;
  }

  private getColumnTitle(status: ReadingStatus): string {
    const column = this.columns.find(col => col.status === status);
    return column ? column.title : status;
  }

  setRating(isbn: string, rating: number): void {
    this.kanbanStorage.updateBookRating(isbn, rating);
    const book = this.kanbanBooks().get(isbn);
    if (book) {
      const label = this.getRatingLabel(rating);
      this.toastService.show(`Rated "${book.title}" as ${label}`);
    }
  }

  getRating(isbn: string): number | undefined {
    return this.kanbanStorage.getBookRating(isbn) ?? 0;
  }

  getRatingLabel(rating: number): string {
    if (rating === 5) return 'Great';
    if (rating === 1) return 'Shit';
    if (rating >= 4) return 'Good';
    if (rating >= 2) return 'Okay';
    return 'Poor';
  }

  removeBook(isbn: string): void {
    const book = this.kanbanBooks().get(isbn);
    if (book) {
      this.kanbanStorage.removeBookFromKanban(isbn);
      const newMap = new Map(this.kanbanBooks());
      newMap.delete(isbn);
      this.kanbanBooks.set(newMap);
      this.kanbanState.set(this.kanbanStorage.getKanbanState());
      this.toastService.show(`Removed "${book.title}" from kanban`);
    }
  }
}

