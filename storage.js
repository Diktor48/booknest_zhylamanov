import { books as localBooks } from './data/books.js';
import { defaultFilters } from './lib/books.js';
import { isWorkId } from './api/books.js';

const storageKey = 'booknest:api:v1';

function validBook(book) {
  return book && (isWorkId(book.id) || /^local-\d+$/.test(book.id))
    && typeof book.title === 'string' && typeof book.author === 'string';
}

export function readSaved() {
  const result = { filters: defaultFilters(), wishlist: [], storageError: '' };
  try {
    const current = localStorage.getItem(storageKey);
    const saved = JSON.parse(current ?? localStorage.getItem('booknest:catalog:v1'));
    const raw = saved?.filters;
    if (typeof raw?.query === 'string') result.filters.query = raw.query.slice(0, 100);
    if (['all', 'scifi', 'history', 'poetry', 'cs', 'classic'].includes(raw?.genre)) result.filters.genre = raw.genre;
    if (['relevance', 'title', 'year', 'rating'].includes(raw?.sort)) result.filters.sort = raw.sort;
    if (typeof raw?.available === 'boolean') result.filters.available = raw.available;
    if (Array.isArray(saved?.wishlist)) {
      const candidates = current !== null ? saved.wishlist : saved.wishlist.map(id => {
        const book = localBooks.find(item => item.id === id);
        return book ? { ...book, id: `local-${id}`, coverId: null, accessKnown: false } : null;
      });
      result.wishlist = [...new Map(candidates.filter(validBook).map(book => [book.id, {
        id: book.id, title: book.title.slice(0, 500), author: book.author.slice(0, 500),
        year: Number.isInteger(book.year) ? book.year : null,
        coverId: Number.isInteger(book.coverId) && book.coverId > 0 ? book.coverId : null,
        rating: typeof book.rating === 'number' && Number.isFinite(book.rating) ? book.rating : null,
        available: book.available === true, accessKnown: book.accessKnown === true,
      }])).values()];
    }
  } catch {
    result.storageError = 'Не удалось прочитать сохранённые данные. Используются начальные настройки.';
  }
  return result;
}

export function saveCurrent(state) {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ filters: state.filters, wishlist: state.wishlist }));
    state.storageError = '';
  } catch {
    state.storageError = 'Сохранение недоступно. Список действует до перезагрузки страницы.';
  }
}
