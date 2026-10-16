import { useCallback, useState } from 'react';
import { MIN_QUERY_LENGTH, searchBooks } from '../api/books';
import type { Book, Filters } from '../types';
import { useRequest } from '../lib/useRequest';
import { BookList } from './BookList';
import { Pagination } from './Pagination';
import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';
import { ErrorBox } from './ErrorBox';

interface SearchResultsProps {
  filters: Filters; page: number; wishlist: Book[];
  onPageChange: (page: number) => void; onToggle: (book: Book) => void;
}

export function SearchResults({ filters, page, wishlist, onPageChange, onToggle }: SearchResultsProps) {
  const [retry, setRetry] = useState(0);
  const load = useCallback((signal: AbortSignal) => searchBooks(filters, page, signal), [filters, page]);
  const enabled = filters.query.trim().length >= MIN_QUERY_LENGTH;
  const request = useRequest(JSON.stringify([filters, page, retry]), enabled, load, 350);
  const empty = request.status === 'empty' || request.status === 'success' && request.data.books.length === 0;
  const status = empty ? 'empty' : request.status;
  return <section className="catalog" aria-labelledby="list-title" aria-busy={status === 'loading'} data-status={status}>
    <h2 className="section-title" id="list-title" aria-live="polite">
      {request.status === 'success' && !empty ? `Найдено книг: ${request.data.total}` : 'Результаты поиска'}
    </h2>
    {status === 'loading' && <Spinner message="Загрузка книг из Open Library…" />}
    {request.status === 'error' && <ErrorBox message={request.message} onRetry={() => setRetry(value => value + 1)} />}
    {empty && <EmptyState message={enabled ? 'Книги не найдены. Измените запрос или сбросьте фильтры.' : 'Введите не менее 2 символов для поиска в Open Library.'} />}
    {request.status === 'success' && !empty && <div className="api-panel">
      <BookList books={request.data.books} wishlist={wishlist} onToggle={onToggle} />
      <Pagination page={page} total={request.data.total} onPageChange={onPageChange} />
    </div>}
  </section>;
}
