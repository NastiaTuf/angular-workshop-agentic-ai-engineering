import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Book } from './book';
import { BookApiClient } from './book-api-client.service';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center items-center py-20">
        <div class="animate-pulse flex flex-col items-center">
          <div
            class="h-16 w-16 rounded-full border-4 border-t-blue-700 border-r-blue-700 border-b-gray-200 border-l-gray-200 animate-spin"
          ></div>
          <p class="mt-4 text-gray-600">Loading book details...</p>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="flex flex-col items-center justify-center py-20 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-16 w-16 text-red-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">Book Not Found</h2>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <button
          (click)="goBack()"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-200"
        >
          Back to Book List
        </button>
      </div>

      <!-- Book Details -->
      <div *ngIf="book && !loading && !error" class="bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Back Button -->
        <div class="border-b border-gray-200 px-6 py-4">
          <button
            (click)="goBack()"
            class="flex items-center text-blue-600 hover:text-blue-700 font-medium transition duration-200"
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
            Back to Book List
          </button>
        </div>

        <!-- Book Content -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
          <!-- Book Cover -->
          <div class="flex justify-center md:justify-start">
            <div class="w-full max-w-sm">
              <div class="relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg bg-gray-100">
                <img
                  *ngIf="book.cover"
                  [src]="book.cover"
                  [alt]="book.title"
                  class="w-full h-full object-contain"
                />
                <div *ngIf="!book.cover" class="w-full h-full flex items-center justify-center">
                  <span class="text-gray-500 text-lg font-medium">No cover available</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Book Information -->
          <div class="flex flex-col">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{{ book.title }}</h1>
            <p *ngIf="book.subtitle" class="text-xl text-gray-600 mb-6">{{ book.subtitle }}</p>

            <div class="space-y-4 mb-8">
              <div>
                <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Author</p>
                <p class="text-lg text-blue-700 font-medium">{{ book.author }}</p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Publisher</p>
                  <p class="text-base text-gray-800">{{ book.publisher }}</p>
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Pages</p>
                  <p class="text-base text-gray-800">{{ book.numPages }}</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">ISBN</p>
                  <p class="text-base text-gray-800 font-mono">{{ book.isbn }}</p>
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Price</p>
                  <p class="text-2xl font-bold text-blue-700">{{ book.price }}</p>
                </div>
              </div>
            </div>

            <div class="border-t border-gray-200 pt-6">
              <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</p>
              <p class="text-base text-gray-700 leading-relaxed">{{ book.abstract }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BookDetailsComponent implements OnInit {
  book: Book | null = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookApiClient: BookApiClient
  ) {}

  ngOnInit(): void {
    const isbn = this.route.snapshot.paramMap.get('isbn');
    if (isbn) {
      this.loadBook(isbn);
    } else {
      this.error = 'ISBN parameter is missing';
      this.loading = false;
    }
  }

  private loadBook(isbn: string): void {
    this.loading = true;
    this.error = null;

    this.bookApiClient.getBook(isbn).subscribe({
      next: book => {
        this.book = book;
        this.loading = false;
      },
      error: error => {
        console.error('Error fetching book:', error);
        this.error = error.status === 404 ? 'This book could not be found.' : 'An error occurred while loading the book.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

