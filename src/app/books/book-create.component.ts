import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Book } from './book';
import { BookApiClient } from './book-api-client.service';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-book-create',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div class="container mx-auto px-4 max-w-4xl">
        <!-- Header with Back button -->
        <div class="mb-8">
          <button
            (click)="goBack()"
            class="flex items-center text-blue-600 hover:text-blue-700 font-medium transition duration-200 mb-4"
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
          <h1 class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Create New Book
          </h1>
          <p class="text-gray-600 mt-2">Fill in the details below to add a new book to your collection</p>
        </div>

        <!-- Error State -->
        @if (error()) {
          <div class="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p class="text-red-700 font-medium">{{ error() }}</p>
            </div>
          </div>
        }

        <!-- Form Card -->
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 class="text-xl font-semibold text-white">Book Information</h2>
          </div>

          <form [formGroup]="bookForm" (ngSubmit)="saveBook()" class="p-6 md:p-10 space-y-6">
            <!-- Title -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Title <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                formControlName="title"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter book title"
              />
              @if (bookForm.get('title')?.invalid && bookForm.get('title')?.touched) {
                <p class="text-red-500 text-sm mt-1">Title is required</p>
              }
            </div>

            <!-- Subtitle -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Subtitle
              </label>
              <input
                type="text"
                formControlName="subtitle"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter book subtitle (optional)"
              />
            </div>

            <!-- Author -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Author <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                formControlName="author"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter author name"
              />
              @if (bookForm.get('author')?.invalid && bookForm.get('author')?.touched) {
                <p class="text-red-500 text-sm mt-1">Author is required</p>
              }
            </div>

            <!-- Publisher and Pages -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  Publisher <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  formControlName="publisher"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter publisher"
                />
                @if (bookForm.get('publisher')?.invalid && bookForm.get('publisher')?.touched) {
                  <p class="text-red-500 text-sm mt-1">Publisher is required</p>
                }
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  Pages <span class="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  formControlName="numPages"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Number of pages"
                />
                @if (bookForm.get('numPages')?.invalid && bookForm.get('numPages')?.touched) {
                  <p class="text-red-500 text-sm mt-1">Pages must be a positive number</p>
                }
              </div>
            </div>

            <!-- Price and Cover URL -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  Price <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  formControlName="price"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="e.g., $19.99"
                />
                @if (bookForm.get('price')?.invalid && bookForm.get('price')?.touched) {
                  <p class="text-red-500 text-sm mt-1">Price is required</p>
                }
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  Cover URL
                </label>
                <input
                  type="url"
                  formControlName="cover"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="https://example.com/cover.jpg"
                />
                @if (bookForm.get('cover')?.invalid && bookForm.get('cover')?.touched) {
                  <p class="text-red-500 text-sm mt-1">Please enter a valid URL</p>
                }
              </div>
            </div>

            <!-- Abstract -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Description
              </label>
              <textarea
                formControlName="abstract"
                rows="5"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none"
                placeholder="Enter book description (optional)"
              ></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                [disabled]="bookForm.invalid || saving()"
                class="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                @if (saving()) {
                  <span class="flex items-center justify-center">
                    <svg
                      class="animate-spin h-5 w-5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </span>
                }
                @if (!saving()) {
                  <span class="flex items-center justify-center">
                    <svg
                      class="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                      ></path>
                    </svg>
                    Create Book
                  </span>
                }
              </button>
              <button
                type="button"
                (click)="goBack()"
                [disabled]="saving()"
                class="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class BookCreateComponent {
  private readonly router = inject(Router);
  private readonly bookApiClient = inject(BookApiClient);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  saving = signal(false);
  error = signal<string | null>(null);

  bookForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    subtitle: [''],
    author: ['', Validators.required],
    publisher: ['', Validators.required],
    numPages: [0, [Validators.required, Validators.min(1)]],
    price: ['', Validators.required],
    cover: ['', Validators.pattern(/^https?:\/\/.+/i)],
    abstract: ['']
  });

  saveBook(): void {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const formValue = this.bookForm.value;
    const bookData: Omit<Book, 'id' | 'isbn' | 'userId'> = {
      title: formValue.title,
      subtitle: formValue.subtitle || undefined,
      author: formValue.author,
      publisher: formValue.publisher,
      numPages: formValue.numPages,
      price: formValue.price,
      cover: formValue.cover || '',
      abstract: formValue.abstract || ''
    };

    this.bookApiClient
      .createBook(bookData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: createdBook => {
          this.saving.set(false);
          this.toastService.show('Book created successfully!');
          this.router.navigate(['/books', createdBook.isbn]);
        },
        error: error => {
          console.error('Error creating book:', error);
          this.saving.set(false);
          this.error.set(
            error.status === 400
              ? 'Invalid book data. Please check your input.'
              : 'Failed to create book. Please try again.'
          );
          this.toastService.show('Failed to create book. Please try again.');
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

