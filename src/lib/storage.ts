import type { Book, SavedState } from '../types';
import { defaultFilters, isGenre, isRecord, isSortOrder } from './filters';
import { isWorkId } from '../api/books';
import { legacyBooks } from '../data/legacy-books';

export const STORAGE_KEY = 'booknest:api:v1';

function snapshot(value: unknown): Book | null {
  if (!isRecord(value) || typeof value.id !== 'string' || (!isWorkId(value.id) && !/^local-\d+$/.test(value.id))
    || typeof value.title !== 'string' || typeof value.author !== 'string') return null;
  return {
    id: value.id, title: value.title.slice(0, 500), author: value.author.slice(0, 500),
    year: typeof value.year === 'number' && Number.isInteger(value.year) ? value.year : null,
    coverId: typeof value.coverId === 'number' && Number.isInteger(value.coverId) && value.coverId > 0 ? value.coverId : null,
    rating: typeof value.rating === 'number' && Number.isFinite(value.rating) ? value.rating : null,
    available: value.available === true, accessKnown: value.accessKnown === true,
  };
}

export function readSaved(): SavedState {
  const result: SavedState = { filters: defaultFilters(), wishlist: [], storageError: '' };
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    const saved: unknown = JSON.parse(current ?? localStorage.getItem('booknest:catalog:v1') ?? 'null');
    if (!isRecord(saved)) return result;
    if (isRecord(saved.filters)) {
      if (typeof saved.filters.query === 'string') result.filters.query = saved.filters.query.slice(0, 100);
      if (isGenre(saved.filters.genre)) result.filters.genre = saved.filters.genre;
      if (isSortOrder(saved.filters.sort)) result.filters.sort = saved.filters.sort;
      if (typeof saved.filters.available === 'boolean') result.filters.available = saved.filters.available;
    }
    if (Array.isArray(saved.wishlist)) {
      const candidates: unknown[] = current !== null ? saved.wishlist
        : saved.wishlist.map((id: unknown) => legacyBooks.find(book => book.id === `local-${String(id)}`));
      const books = candidates.map(snapshot).filter((book): book is Book => book !== null);
      result.wishlist = [...new Map(books.map(book => [book.id, book])).values()];
    }
  } catch {
    result.storageError = 'Не удалось прочитать сохранённые данные. Используются начальные настройки.';
  }
  return result;
}

export function saveCurrent(saved: SavedState): string {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ filters: saved.filters, wishlist: saved.wishlist.map(snapshot) }));
    return '';
  } catch {
    return 'Сохранение недоступно. Список действует до перезагрузки страницы.';
  }
}
