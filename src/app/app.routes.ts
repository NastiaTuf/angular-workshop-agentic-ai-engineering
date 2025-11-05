import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./books/book-list.component').then(m => m.BookListComponent)
  },
  {
    path: 'kanban',
    loadComponent: () => import('./books/kanban-board.component').then(m => m.KanbanBoardComponent)
  },
  {
    path: 'books/new',
    loadComponent: () => import('./books/book-create.component').then(m => m.BookCreateComponent)
  },
  {
    path: 'books/:isbn',
    loadComponent: () => import('./books/book-details.component').then(m => m.BookDetailsComponent)
  },
  { path: '**', redirectTo: '' }
];
