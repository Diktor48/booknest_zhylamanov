import { getBook, isWorkId } from './api/books.js';
import { API_BASE_URL, errorMessage } from './api/client.js';
import { readSaved, saveCurrent } from './storage.js';
import { accessText, bookCover } from './ui/render.js';

const id = new URLSearchParams(location.search).get('id');
const state = { ...readSaved(), status: 'loading', loading: false, book: null, error: '' };
let controller;

function render() {
  for (const panel of document.querySelectorAll('[data-book-state]')) panel.hidden = panel.dataset.bookState !== state.status;
  document.querySelector('#book-region').setAttribute('aria-busy', String(state.loading));
  document.querySelector('#book-error-text').textContent = state.error;
  document.querySelector('#storage-message').textContent = state.storageError;
  document.querySelector('#wishlist-count').textContent = state.wishlist.length;
  if (!state.book || state.status !== 'success') return;
  const book = state.book;
  document.title = `${book.title} — BookNest`;
  document.querySelector('#book-title').textContent = book.title;
  document.querySelector('#book-breadcrumb').textContent = book.title;
  document.querySelector('#book-cover').replaceChildren(bookCover(book, 'book__cover-img'));
  document.querySelector('#book-author').textContent = book.author;
  document.querySelector('#book-year').textContent = book.year ?? 'Не указан';
  document.querySelector('#book-rating').textContent = book.rating === null ? 'Не указан' : `${book.rating.toFixed(1)} из 5`;
  document.querySelector('#book-access').textContent = accessText(book);
  document.querySelector('#book-description').textContent = book.description;
  document.querySelector('#book-subjects').textContent = book.subjects.join(', ') || 'Не указаны';
  document.querySelector('#book-source').href = new URL(`/works/${id}`, API_BASE_URL).href;
  const button = document.querySelector('#book-wish');
  const selected = state.wishlist.some(item => item.id === id);
  button.setAttribute('aria-pressed', String(selected));
  button.textContent = selected ? 'В моём списке' : 'Хочу прочитать';
}

async function loadBook() {
  controller?.abort();
  controller = new AbortController();
  const signal = controller.signal;
  state.loading = true;
  state.status = 'loading';
  render();
  try {
    if (!isWorkId(id)) {
      state.status = 'empty';
      return;
    }
    state.book = await getBook(id, signal);
    state.status = 'success';
  } catch (error) {
    if (error.name === 'AbortError') return;
    state.status = 'error';
    state.error = errorMessage(error);
  } finally {
    if (!signal.aborted) {
      state.loading = false;
      render();
    }
  }
}

document.querySelector('#book-retry').addEventListener('click', () => { void loadBook(); });
document.querySelector('#book-wish').addEventListener('click', () => {
  if (!state.book) return;
  state.wishlist = state.wishlist.some(book => book.id === id)
    ? state.wishlist.filter(book => book.id !== id) : [...state.wishlist, state.book];
  saveCurrent(state);
  render();
});
window.addEventListener('storage', () => {
  Object.assign(state, readSaved());
  render();
});

void loadBook();
