import { MIN_QUERY_LENGTH, searchBooks } from './api/books.js';
import { errorMessage } from './api/client.js';
import { defaultFilters } from './lib/books.js';
import { readSaved, saveCurrent } from './storage.js';
import { render } from './ui/render.js';

const state = {
  ...readSaved(),
  status: 'empty', loading: false, books: [], total: 0, page: 1,
  error: '', emptyMessage: `Введите не менее ${MIN_QUERY_LENGTH} символов для поиска в Open Library.`,
};
const form = document.querySelector('.filters__form');
let controller;
let debounceTimer;
let requestNumber = 0;

function cancelSearch() {
  clearTimeout(debounceTimer);
  requestNumber += 1;
  controller?.abort();
}

async function loadBooks() {
  cancelSearch();
  const number = requestNumber;
  if (state.filters.query.trim().length < MIN_QUERY_LENGTH) {
    state.status = 'empty';
    state.loading = false;
    state.books = [];
    state.total = 0;
    state.emptyMessage = `Введите не менее ${MIN_QUERY_LENGTH} символов для поиска в Open Library.`;
    render(state);
    return;
  }
  controller = new AbortController();
  const signal = controller.signal;
  state.status = 'loading';
  state.loading = true;
  state.error = '';
  render(state);
  try {
    const result = await searchBooks(state.filters, state.page, signal);
    if (number !== requestNumber) return;
    state.books = result.books;
    state.total = result.total;
    state.status = state.books.length ? 'success' : 'empty';
    state.emptyMessage = 'Книги не найдены. Измените запрос или сбросьте фильтры.';
  } catch (error) {
    if (number !== requestNumber || error.name === 'AbortError') return;
    state.status = 'error';
    state.error = errorMessage(error);
    state.books = [];
    state.total = 0;
  } finally {
    // Старый запрос не должен снимать загрузку нового.
    if (number === requestNumber) {
      state.loading = false;
      render(state);
    }
  }
}

form.addEventListener('input', event => {
  cancelSearch();
  state.filters = {
    query: form.elements.q.value, genre: form.elements.genre.value,
    sort: form.elements.sort.value, available: form.elements.available.checked,
  };
  state.page = 1;
  saveCurrent(state);
  if (state.filters.query.trim().length < MIN_QUERY_LENGTH) {
    void loadBooks();
    return;
  }
  state.status = 'loading';
  state.loading = true;
  render(state);
  if (event.target.name === 'q') debounceTimer = setTimeout(loadBooks, 350);
  else void loadBooks();
});

form.addEventListener('submit', event => {
  event.preventDefault();
  void loadBooks();
});
form.addEventListener('reset', event => {
  event.preventDefault();
  state.filters = defaultFilters();
  state.page = 1;
  saveCurrent(state);
  void loadBooks();
});

document.querySelector('main').addEventListener('click', event => {
  const action = event.target.closest('button[data-action]');
  if (!action || action.disabled) return;
  if (action.dataset.action === 'retry') { void loadBooks(); return; }
  if (action.dataset.action === 'previous' || action.dataset.action === 'next') {
    state.page += action.dataset.action === 'next' ? 1 : -1;
    void loadBooks();
    return;
  }
  const id = action.dataset.bookId;
  const selected = state.wishlist.some(book => book.id === id);
  const book = state.books.find(item => item.id === id);
  if (selected) state.wishlist = state.wishlist.filter(item => item.id !== id);
  else if (book && action.dataset.action === 'toggle') state.wishlist = [...state.wishlist, book];
  saveCurrent(state);
  render(state);
});

window.addEventListener('storage', () => {
  const saved = readSaved();
  state.wishlist = saved.wishlist;
  state.storageError = saved.storageError;
  render(state);
});

void loadBooks();
