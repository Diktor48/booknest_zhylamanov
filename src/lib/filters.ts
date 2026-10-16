import type { Filters, Genre, SortOrder } from '../types';

export const genres: { value: Genre; label: string }[] = [
  { value: 'all', label: 'Все жанры' },
  { value: 'scifi', label: 'Фантастика' },
  { value: 'history', label: 'История' },
  { value: 'poetry', label: 'Поэзия' },
  { value: 'cs', label: 'Информатика' },
  { value: 'classic', label: 'Классика' },
];
export const sortOrders: { value: SortOrder; label: string }[] = [
  { value: 'relevance', label: 'По соответствию запросу' },
  { value: 'title', label: 'По названию (А–Я)' },
  { value: 'year', label: 'По году (новые сначала)' },
  { value: 'rating', label: 'По рейтингу' },
];

export function defaultFilters(): Filters {
  return { query: '', genre: 'all', sort: 'relevance', available: false };
}

export function isGenre(value: unknown): value is Genre {
  return genres.some(genre => genre.value === value);
}

export function isSortOrder(value: unknown): value is SortOrder {
  return sortOrders.some(sort => sort.value === value);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
