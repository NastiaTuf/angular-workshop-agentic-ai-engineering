# Technical Summary

## Tech Stack

### Core Framework
- **Angular 20.2.1** - Modern Angular framework using standalone components
- **TypeScript 5.9.2** - Primary programming language
- **Zone.js 0.15.0** - Change detection mechanism with event coalescing enabled

### Build Tools & CLI
- **Angular CLI 20.2.0** - Development tooling and build system
- **Angular Build 20.2.0** - Modern build system (replacing Angular CLI builder)
- **PostCSS 8.5.6** - CSS processing
- **Tailwind CSS 4.1.12** - Utility-first CSS framework
- **Prettier 3.6.2** - Code formatter

### UI & Styling
- **Tailwind CSS 4.1.12** - Primary CSS framework (utility classes)
- **Angular Material 20.2.0** - Material Design component library
- **Angular CDK 20.2.0** - Component development kit
- **Angular Animations 20.2.1** - Animation support

### State Management & Data Fetching
- **RxJS 7.8.0** - Reactive programming (currently used for HTTP observables)
- **@ngrx/signals 20.0.1** - NgRx Signals for state management (installed but not yet implemented)
- **@angular-architects/ngrx-toolkit 20.1.0** - NgRx toolkit utilities (installed but not yet implemented)
- **@tanstack/angular-query-experimental 5.85.5** - Angular Query for server state management (installed but not yet implemented)

### Routing & Navigation
- **Angular Router 20.2.1** - Client-side routing

### Server-Side Rendering
- **Angular SSR 20.2.1** - Server-side rendering support
- **Angular Platform Server 20.2.1** - Server platform
- **Express 5.1.0** - Node.js server framework (for SSR)

### Testing
- **Playwright 1.55.0** - End-to-end testing framework
- **Karma** - Unit testing (via Angular CLI)

---

## Dependencies

### Production Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `@angular/animations` | 20.2.1 | Animation support |
| `@angular/cdk` | 20.2.0 | Component development kit |
| `@angular/common` | 20.2.1 | Common Angular utilities |
| `@angular/compiler` | 20.2.1 | Angular compiler |
| `@angular/core` | 20.2.1 | Core Angular framework |
| `@angular/forms` | 20.2.1 | Forms module (used for ngModel) |
| `@angular/material` | ^20.2.0 | Material Design components |
| `@angular/platform-browser` | 20.2.1 | Browser platform |
| `@angular/platform-server` | 20.2.1 | Server platform (SSR) |
| `@angular/router` | 20.2.1 | Routing |
| `@angular/ssr` | 20.2.1 | SSR support |
| `@angular-architects/ngrx-toolkit` | ^20.1.0 | NgRx toolkit (available but not used) |
| `@ngrx/signals` | 20.0.1 | NgRx Signals (available but not used) |
| `@tanstack/angular-query-experimental` | ^5.85.5 | Angular Query (available but not used) |
| `express` | 5.1.0 | Server framework (SSR) |
| `rxjs` | 7.8.0 | Reactive programming |
| `tslib` | 2.3.0 | TypeScript runtime library |
| `zone.js` | 0.15.0 | Change detection |

### Development Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `@angular/build` | 20.2.0 | Build system |
| `@angular/cli` | 20.2.0 | Angular CLI |
| `@angular/compiler-cli` | 20.2.1 | Compiler CLI |
| `@playwright/test` | ^1.55.0 | E2E testing |
| `@tailwindcss/postcss` | 4.1.12 | Tailwind PostCSS plugin |
| `@types/express` | ^5.0.1 | Express type definitions |
| `@types/node` | ^20.17.19 | Node.js type definitions |
| `postcss` | 8.5.6 | CSS processor |
| `prettier` | 3.6.2 | Code formatter |
| `tailwindcss` | 4.1.12 | CSS framework |
| `typescript` | 5.9.2 | TypeScript compiler |

---

## Architecture

### Project Structure
```
src/
├── app/
│   ├── app.ts                    # Root component (standalone)
│   ├── app.config.ts             # Application configuration & providers
│   ├── app.routes.ts             # Route definitions
│   ├── app.html                  # Root component template
│   ├── app.css                   # Root component styles
│   ├── books/                    # Books feature module
│   │   ├── book.ts               # Book interface/model
│   │   ├── book-api-client.service.ts  # HTTP service for books API
│   │   ├── book-list.component.ts      # Book list container component
│   │   └── book-item.component.ts      # Book card display component
│   └── shared/                   # Shared utilities
│       └── toast.service.ts      # Toast notification service (Material)
├── index.html                    # HTML entry point
├── main.ts                       # Application bootstrap
├── styles.css                    # Global styles
└── material-theme.scss           # Material Design theme
```

### Component Architecture

#### Standalone Components
The application uses **standalone components** exclusively (modern Angular pattern):
- No NgModules - each component is self-contained
- Components declare their own imports
- Provides better tree-shaking and lazy loading

#### Component Hierarchy
```
App (Root Component)
└── Router Outlet
    └── BookListComponent (Route: '/')
        └── BookItemComponent (repeated for each book)
```

### Component Details

#### App Component (`app.ts`)
- **Selector**: `app-root`
- **Purpose**: Root component with header, router outlet, and footer
- **Imports**: `RouterOutlet`
- **Template**: Uses Tailwind CSS for layout

#### BookListComponent (`books/book-list.component.ts`)
- **Selector**: `app-book-list`
- **Purpose**: Container component for displaying and searching books
- **Imports**: `CommonModule`, `FormsModule`, `BookItemComponent`
- **Features**:
  - Search functionality with 300ms debounce
  - Loading state with spinner
  - Empty state handling
  - Responsive grid layout (1-5 columns based on screen size)
- **State Management**: Uses RxJS Observables via `BookApiClient` service
- **Lifecycle**: Implements `OnInit` for initial data loading

#### BookItemComponent (`books/book-item.component.ts`)
- **Selector**: `app-book-item`
- **Purpose**: Presentational component for displaying a single book
- **Input**: `book: Book`
- **Imports**: `CommonModule`, `RouterModule`
- **Features**: Displays book cover, title, subtitle, author, and ISBN

### Services

#### BookApiClient (`books/book-api-client.service.ts`)
- **Type**: Injectable service (provided in root)
- **Purpose**: HTTP client for book data
- **API Endpoint**: `http://localhost:4730/books`
- **Methods**:
  - `getBooks(pageSize: number, searchTerm?: string): Observable<Book[]>`
- **Features**:
  - Query parameter support (`_limit`, `q` for search)
  - Returns RxJS Observables

#### ToastService (`shared/toast.service.ts`)
- **Type**: Injectable service (provided in root)
- **Purpose**: Display toast notifications
- **Implementation**: Uses Angular Material's `MatSnackBar`
- **Methods**: `show(message: string, duration?: number)`
- **Status**: Currently defined but not actively used in components

### Data Flow

1. **Initial Load**:
   - `BookListComponent.ngOnInit()` → `loadBooks()`
   - `BookApiClient.getBooks()` → HTTP GET request
   - Observable subscription → Updates `books` array
   - Template renders `BookItemComponent` for each book

2. **Search Flow**:
   - User types in search input
   - `onSearchChange()` debounces (300ms)
   - Calls `loadBooks(searchTerm)`
   - API request with `q` parameter
   - Updates book list

3. **Error Handling**:
   - HTTP errors are caught in subscription
   - Console error logging (no user-facing error UI currently)

### Routing

#### Route Configuration (`app.routes.ts`)
- **Default Route** (`''`): `BookListComponent`
- **Wildcard Route** (`'**'`): Redirects to default route
- **Routing Strategy**: Client-side routing with Angular Router

### Configuration

#### Application Config (`app.config.ts`)
- **Providers**:
  - `provideBrowserGlobalErrorListeners()` - Global error handling
  - `provideZoneChangeDetection({ eventCoalescing: true })` - Optimized change detection
  - `provideRouter(routes)` - Router configuration
  - `provideHttpClient()` - HTTP client
  - `provideAnimations()` - Animation support

#### TypeScript Configuration
- **Target**: ES2022
- **Module**: `preserve`
- **Strict Mode**: Enabled with additional strict flags:
  - `noImplicitOverride`
  - `noPropertyAccessFromIndexSignature`
  - `noImplicitReturns`
  - `noFallthroughCasesInSwitch`
- **Angular Compiler Options**:
  - `strictInjectionParameters`
  - `strictInputAccessModifiers`
  - `strictTemplates`
  - `typeCheckHostBindings`

#### Build Configuration (`angular.json`)
- **Build System**: `@angular/build:application`
- **Output**: Optimized for production with budgets:
  - Initial bundle: 500kB warning / 1MB error
  - Component styles: 4kB warning / 8kB error
- **Development**: Source maps enabled, no optimization
- **Assets**: `public/` directory
- **Styles**: `styles.css` + `material-theme.scss`

### Testing Setup

#### Playwright Configuration (`playwright.config.ts`)
- **Test Directory**: `./tests`
- **Browsers**: Chromium, Firefox, WebKit
- **Parallel Execution**: Enabled
- **Retries**: 2 on CI, 0 locally
- **Web Server**: Starts Angular dev server on `http://localhost:4200`

#### Test Files
- `tests/example.spec.ts` - Example E2E tests
- `tests-examples/demo-todo-app.spec.ts` - Demo tests

### External API Integration

#### Bookmonkey API
- **URL**: `http://localhost:4730`
- **Usage**: Run via `npx bookmonkey-api`
- **Endpoints Used**:
  - `GET /books` - Retrieve books list
  - Query parameters: `_limit` (pagination), `q` (search)

---

## Key Architectural Patterns

### 1. Standalone Components
- Modern Angular pattern (no NgModules)
- Each component is self-contained
- Explicit dependency declarations

### 2. Service-Oriented Architecture
- Separation of concerns
- Services handle business logic and API calls
- Components focus on presentation

### 3. Reactive Programming
- RxJS Observables for async operations
- HTTP requests return Observables
- Subscription-based data flow

### 4. Component Communication
- **Parent → Child**: `@Input()` properties
- **Child → Parent**: Event emitters (not currently used)
- **Service Communication**: Dependency injection

### 5. Responsive Design
- Tailwind CSS utility classes
- Mobile-first approach
- Responsive grid system

---

## Future-Ready Dependencies

The following packages are installed but not yet implemented:
- **@ngrx/signals** - For advanced state management
- **@angular-architects/ngrx-toolkit** - NgRx utilities
- **@tanstack/angular-query-experimental** - Server state management alternative

These suggest the application is prepared for more complex state management needs as it grows.

---

## Development Workflow

### Available Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run watch` - Build in watch mode
- `npm test` - Run unit tests
- `npm run format.write` - Format code with Prettier

### Code Quality
- **Prettier**: Automatic code formatting
- **TypeScript Strict Mode**: Enhanced type safety
- **Angular Strict Templates**: Template type checking

---

## Browser Support
- Modern browsers (ES2022 target)
- SSR support for server-side rendering
- Progressive enhancement via Angular Universal

---

*Last Updated: Based on Angular 20.2.1 and current project structure*

