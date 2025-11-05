import { Routes } from '@angular/router';
import { BookListComponent } from './books/book-list.component';
import { BookDetailsComponent } from './books/book-details.component';
import { BookCreateComponent } from './books/book-create.component';
import { KanbanBoardComponent } from './books/kanban-board.component';

export const routes: Routes = [
  { path: '', component: BookListComponent },
  { path: 'kanban', component: KanbanBoardComponent },
  { path: 'books/new', component: BookCreateComponent },
  { path: 'books/:isbn', component: BookDetailsComponent },
  { path: '**', redirectTo: '' }
];
