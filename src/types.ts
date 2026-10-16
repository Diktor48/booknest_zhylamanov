export type Genre = 'all' | 'scifi' | 'history' | 'poetry' | 'cs' | 'classic';
export type SortOrder = 'relevance' | 'title' | 'year' | 'rating';
export type ErrorKind = 'http' | 'network' | 'timeout' | 'format';

export interface Filters {
  query: string;
  genre: Genre;
  sort: SortOrder;
  available: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  year: number | null;
  coverId: number | null;
  rating: number | null;
  available: boolean;
  accessKnown: boolean;
}

export interface BookDetails extends Book {
  description: string;
  subjects: string[];
}

export interface SearchResult {
  books: Book[];
  total: number;
}

export interface SavedState {
  filters: Filters;
  wishlist: Book[];
  storageError: string;
}

export type RequestState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'empty' }
  | { status: 'error'; message: string };
