import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Book } from './book';

@Injectable({ providedIn: 'root' })
export class BookApiClient {
  private readonly apiUrl = 'http://localhost:4730/books';
  private readonly http = inject(HttpClient);

  getBooks(searchTerm?: string): Observable<Book[]> {
    let params = new HttpParams();

    if (searchTerm) {
      // Search in title and author fields
      params = params.set('q', searchTerm);
    }

    return this.http.get<Book[]>(this.apiUrl, { params });
  }

  getBook(isbn: string): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${isbn}`);
  }

  updateBook(id: string, book: Partial<Book>): Observable<Book> {
    return this.http.patch<Book>(`${this.apiUrl}/${id}`, book);
  }

  createBook(book: Omit<Book, 'id' | 'isbn' | 'userId'>): Observable<Book> {
    return this.http.post<Book>(this.apiUrl, book);
  }
}
