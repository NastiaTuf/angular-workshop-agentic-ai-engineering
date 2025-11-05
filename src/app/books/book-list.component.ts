import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Book } from './book';
import { BookApiClient } from './book-api-client.service';
import { BookItemComponent } from './book-item.component';

@Component({
  selector: 'app-book-list',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, BookItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto px-4 py-12 max-w-7xl">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-4 border-b border-gray-200 gap-4">
        <h1 class="text-3xl font-bold text-blue-700">Book Collection</h1>
        <a
          routerLink="/books/new"
          class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          <svg
            class="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Create New Book
        </a>
      </div>

      <div class="mb-6">
        <div class="flex items-center border-b-2 border-gray-300 py-2">
          <input
            type="text"
            [formControl]="searchControl"
            placeholder="Search for books..."
            class="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
          />
          @if (searchTerm()) {
            <button (click)="clearSearch()" class="flex-shrink-0 text-gray-500 hover:text-gray-700">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          }
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
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          @for (book of paginatedBooks(); track book.id) {
            <app-book-item [book]="book"></app-book-item>
          }

          @if (paginatedBooks().length === 0) {
            <div
              class="col-span-full flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-xl"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-16 w-16 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <p class="text-xl font-medium text-gray-600 mb-2">
                {{ searchTerm() ? 'No books match your search' : 'No books available' }}
              </p>
              <p class="text-gray-500">
                {{ searchTerm() ? 'Try different search terms or clear the search' : 'Check back later' }}
              </p>
              @if (searchTerm()) {
                <button
                  (click)="clearSearch()"
                  class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  Clear Search
                </button>
              }
            </div>
          }
        </div>

        @if (books().length > 0 && totalPages() > 1) {
          <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200">
            <!-- Page Size Selector -->
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">Items per page:</label>
              <select
                [formControl]="pageSizeControl"
                class="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option [value]="5">5</option>
                <option [value]="10">10</option>
                <option [value]="20">20</option>
                <option [value]="50">50</option>
              </select>
            </div>

            <!-- Page Navigation -->
            <div class="flex items-center gap-2">
              <button
                (click)="previousPage()"
                [disabled]="currentPage() === 1"
                [class]="
                  currentPage() === 1
                    ? 'px-3 py-1.5 text-sm text-gray-400 cursor-not-allowed'
                    : 'px-3 py-1.5 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition duration-200'
                "
              >
                Previous
              </button>

              @for (page of pageNumbers(); track page) {
                @if (page === 'ellipsis') {
                  <span class="px-2 text-gray-400">...</span>
                } @else {
                  <button
                    (click)="goToPage(page)"
                    [class]="
                      page === currentPage()
                        ? 'px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded'
                        : 'px-3 py-1.5 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition duration-200'
                    "
                  >
                    {{ page }}
                  </button>
                }
              }

              <button
                (click)="nextPage()"
                [disabled]="currentPage() === totalPages()"
                [class]="
                  currentPage() === totalPages()
                    ? 'px-3 py-1.5 text-sm text-gray-400 cursor-not-allowed'
                    : 'px-3 py-1.5 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition duration-200'
                "
              >
                Next
              </button>
            </div>
          </div>
        }
      }
    </div>
  `
})
export class BookListComponent {
  private readonly bookApiClient = inject(BookApiClient);
  private readonly destroyRef = inject(DestroyRef);

  // State signals
  books = signal<Book[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(5);

  // Form controls
  searchControl = new FormControl('');
  pageSizeControl = new FormControl(5);

  // Computed signals
  paginatedBooks = computed(() => {
    const allBooks = this.books();
    const page = this.currentPage();
    const size = this.pageSize();
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    return allBooks.slice(startIndex, endIndex);
  });

  totalPages = computed(() => {
    const total = this.books().length;
    const size = this.pageSize();
    return Math.max(1, Math.ceil(total / size));
  });

  pageNumbers = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const pages: (number | 'ellipsis')[] = [];

    if (total <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (current <= 3) {
        // Near the beginning
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(total);
      } else if (current >= total - 2) {
        // Near the end
        pages.push('ellipsis');
        for (let i = total - 3; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push('ellipsis');
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(total);
      }
    }

    return pages;
  });

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Clean up search timeout on component destroy
    this.destroyRef.onDestroy(() => {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = null;
      }
    });

    // Initialize search control subscription
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.searchTerm.set(value || '');
        this.onSearchChange();
      });

    // Initialize page size control subscription
    this.pageSizeControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        if (value) {
          this.pageSize.set(value);
          // Adjust current page if it would be out of bounds
          const maxPage = this.totalPages();
          if (this.currentPage() > maxPage) {
            this.currentPage.set(maxPage);
          }
        }
      });

    // Effect to adjust current page when books change (e.g., after search)
    effect(() => {
      const books = this.books();
      const current = this.currentPage();
      const maxPage = this.totalPages();
      if (books.length > 0 && current > maxPage) {
        this.currentPage.set(maxPage);
      }
    });

    // Load books on initialization
    this.loadBooks();
  }

  private loadBooks(search?: string): void {
    this.loading.set(true);
    this.bookApiClient
      .getBooks(search)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: books => {
          this.books.set(books);
          this.loading.set(false);
        },
        error: error => {
          console.error('Error fetching books:', error);
          this.loading.set(false);
        }
      });
  }

  private onSearchChange(): void {
    // Debounce search to avoid too many API calls while typing
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.loadBooks(this.searchTerm());
      // Keep current page when searching (don't reset to page 1)
    }, 300);
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.searchTerm.set('');
    this.loadBooks();
  }

  goToPage(page: number): void {
    const total = this.totalPages();
    if (page >= 1 && page <= total) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    const current = this.currentPage();
    const total = this.totalPages();
    if (current < total) {
      this.currentPage.set(current + 1);
    }
  }

  previousPage(): void {
    const current = this.currentPage();
    if (current > 1) {
      this.currentPage.set(current - 1);
    }
  }
}
