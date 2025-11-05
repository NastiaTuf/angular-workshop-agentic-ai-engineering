import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { Book } from './book';
import { BookApiClient } from './book-api-client.service';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-book-details',
  imports: [RouterModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- Loading State -->
      @if (loading()) {
        <div class="flex justify-center items-center py-20">
          <div class="animate-pulse flex flex-col items-center">
            <div
              class="h-16 w-16 rounded-full border-4 border-t-blue-700 border-r-blue-700 border-b-gray-200 border-l-gray-200 animate-spin"
            ></div>
            <p class="mt-4 text-gray-600">Loading book details...</p>
          </div>
        </div>
      }

      <!-- Error State -->
      @if (error() && !loading()) {
        <div class="flex flex-col items-center justify-center py-20 text-center">
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
          <p class="text-gray-600 mb-6">{{ error() }}</p>
          <button
            (click)="goBack()"
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-200"
          >
            Back to Book List
          </button>
        </div>
      }

      <!-- Book Details -->
      @if (book() && !loading() && !error()) {
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <!-- Header with Back and Edit buttons -->
          <div class="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
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

            @if (!isEditMode()) {
              <button
                (click)="enterEditMode()"
                class="flex items-center text-blue-600 hover:text-blue-700 font-medium transition duration-200"
              >
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </button>
            }
          </div>

          <!-- Book Content -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
            <!-- Book Cover -->
            <div class="flex justify-center md:justify-start">
              <div class="w-full max-w-sm">
                <div class="relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg bg-gray-100">
                  @if (book()?.cover) {
                    <img
                      [src]="book()!.cover"
                      [alt]="book()!.title"
                      class="w-full h-full object-contain"
                    />
                  }
                  @if (!book()?.cover) {
                    <div class="w-full h-full flex items-center justify-center">
                      <span class="text-gray-500 text-lg font-medium">No cover available</span>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Book Information -->
            <div class="flex flex-col">
              @if (isEditMode()) {
                <form [formGroup]="bookForm" (ngSubmit)="saveBook()" class="space-y-4">
                  <!-- Title -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Title <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      formControlName="title"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    @if (bookForm.get('title')?.invalid && bookForm.get('title')?.touched) {
                      <p class="text-red-500 text-sm mt-1">Title is required</p>
                    }
                  </div>

                  <!-- Subtitle -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      formControlName="subtitle"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <!-- Author -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Author <span class="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      formControlName="author"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    @if (bookForm.get('author')?.invalid && bookForm.get('author')?.touched) {
                      <p class="text-red-500 text-sm mt-1">Author is required</p>
                    }
                  </div>

                  <!-- Publisher and Pages -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Publisher <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        formControlName="publisher"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      @if (bookForm.get('publisher')?.invalid && bookForm.get('publisher')?.touched) {
                        <p class="text-red-500 text-sm mt-1">Publisher is required</p>
                      }
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Pages <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        formControlName="numPages"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      @if (bookForm.get('numPages')?.invalid && bookForm.get('numPages')?.touched) {
                        <p class="text-red-500 text-sm mt-1">Pages must be a positive number</p>
                      }
                    </div>
                  </div>

                  <!-- ISBN and Price -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        ISBN
                      </label>
                      <input
                        type="text"
                        [value]="book()?.isbn"
                        disabled
                        class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 font-mono cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Price <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        formControlName="price"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      @if (bookForm.get('price')?.invalid && bookForm.get('price')?.touched) {
                        <p class="text-red-500 text-sm mt-1">Price is required</p>
                      }
                    </div>
                  </div>

                  <!-- Cover URL -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Cover URL
                    </label>
                    <input
                      type="url"
                      formControlName="cover"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    @if (bookForm.get('cover')?.invalid && bookForm.get('cover')?.touched) {
                      <p class="text-red-500 text-sm mt-1">Please enter a valid URL</p>
                    }
                  </div>

                  <!-- Abstract -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Description
                    </label>
                    <textarea
                      formControlName="abstract"
                      rows="4"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex gap-4 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      [disabled]="bookForm.invalid || saving()"
                      class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-md transition duration-200"
                    >
                      @if (saving()) {
                        <span class="flex items-center justify-center">
                          <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      }
                      @if (!saving()) {
                        Save
                      }
                    </button>
                    <button
                      type="button"
                      (click)="cancelEdit()"
                      [disabled]="saving()"
                      class="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-medium py-2 px-6 rounded-md transition duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              }

              @if (!isEditMode()) {
                <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{{ book()!.title }}</h1>
                @if (book()!.subtitle) {
                  <p class="text-xl text-gray-600 mb-6">{{ book()!.subtitle }}</p>
                }

                <div class="space-y-4 mb-8">
                  <div>
                    <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Author</p>
                    <p class="text-lg text-blue-700 font-medium">{{ book()!.author }}</p>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Publisher</p>
                      <p class="text-base text-gray-800">{{ book()!.publisher }}</p>
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Pages</p>
                      <p class="text-base text-gray-800">{{ book()!.numPages }}</p>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">ISBN</p>
                      <p class="text-base text-gray-800 font-mono">{{ book()!.isbn }}</p>
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Price</p>
                      <p class="text-2xl font-bold text-blue-700">{{ book()!.price }}</p>
                    </div>
                  </div>
                </div>

                <div class="border-t border-gray-200 pt-6">
                  <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</p>
                  <p class="text-base text-gray-700 leading-relaxed">{{ book()!.abstract }}</p>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class BookDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookApiClient = inject(BookApiClient);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  book = signal<Book | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  saving = signal(false);

  bookForm: FormGroup<{
    title: FormControl<string | null>;
    subtitle: FormControl<string | null>;
    author: FormControl<string | null>;
    publisher: FormControl<string | null>;
    numPages: FormControl<number | null>;
    price: FormControl<string | null>;
    cover: FormControl<string | null>;
    abstract: FormControl<string | null>;
  }> = this.fb.group({
    title: ['', Validators.required],
    subtitle: [''],
    author: ['', Validators.required],
    publisher: ['', Validators.required],
    numPages: [0, [Validators.required, Validators.min(1)]],
    price: ['', Validators.required],
    cover: ['', Validators.pattern(/^https?:\/\/.+/i)],
    abstract: ['']
  });

  constructor() {
    // Use observable route params for better reactivity
    this.route.paramMap
      .pipe(
        map(params => params.get('isbn')),
        filter((isbn): isbn is string => isbn !== null),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: isbn => {
          this.loadBook(isbn);
        },
        error: () => {
          this.error.set('ISBN parameter is missing');
          this.loading.set(false);
        }
      });
  }

  private loadBook(isbn: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.bookApiClient.getBook(isbn)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: book => {
          this.book.set(book);
          this.loading.set(false);
        },
        error: error => {
          console.error('Error fetching book:', error);
          this.error.set(
            error.status === 404 ? 'This book could not be found.' : 'An error occurred while loading the book.'
          );
          this.loading.set(false);
        }
      });
  }

  enterEditMode(): void {
    const currentBook = this.book();
    if (currentBook) {
      this.bookForm.patchValue({
        title: currentBook.title,
        subtitle: currentBook.subtitle || '',
        author: currentBook.author,
        publisher: currentBook.publisher,
        numPages: currentBook.numPages,
        price: currentBook.price,
        cover: currentBook.cover || '',
        abstract: currentBook.abstract || ''
      });
      this.isEditMode.set(true);
    }
  }

  cancelEdit(): void {
    this.isEditMode.set(false);
    const currentBook = this.book();
    if (currentBook) {
      this.bookForm.patchValue({
        title: currentBook.title,
        subtitle: currentBook.subtitle || '',
        author: currentBook.author,
        publisher: currentBook.publisher,
        numPages: currentBook.numPages,
        price: currentBook.price,
        cover: currentBook.cover || '',
        abstract: currentBook.abstract || ''
      });
    }
  }

  saveBook(): void {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      return;
    }

    const currentBook = this.book();
    if (!currentBook) {
      return;
    }

    this.saving.set(true);
    const formValue = this.bookForm.value;

    // Convert form values to Book partial, handling null values
    const bookUpdate: Partial<Book> = {
      title: formValue.title ?? '',
      subtitle: formValue.subtitle ?? undefined,
      author: formValue.author ?? '',
      publisher: formValue.publisher ?? '',
      numPages: formValue.numPages ?? 0,
      price: formValue.price ?? '',
      cover: formValue.cover ?? '',
      abstract: formValue.abstract ?? ''
    };

    this.bookApiClient.updateBook(currentBook.isbn, bookUpdate)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updatedBook => {
          this.book.set(updatedBook);
          this.isEditMode.set(false);
          this.saving.set(false);
          this.toastService.show('Book updated successfully');
        },
        error: error => {
          console.error('Error updating book:', error);
          this.saving.set(false);
          this.toastService.show('Failed to update book. Please try again.');
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
