import { books, genres } from './data/books.js';
import { defaultFilters, restoreSaved, toggleWishlist } from './lib/books.js';
import { render } from './ui/render.js';

const storageKey = 'booknest:catalog:v1';
const state = {
  filters: defaultFilters(),
  wishlist: [],
  storageError: '',
};

try {
  Object.assign(state, restoreSaved(JSON.parse(localStorage.getItem(storageKey)), books, genres));
} catch {
  // Повреждённый JSON или запрет хранилища не мешает пользоваться каталогом.
  state.storageError = 'Не удалось прочитать сохранённые данные. Используются начальные настройки.';
}

function update() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ filters: state.filters, wishlist: state.wishlist }));
    state.storageError = '';
  } catch {
    state.storageError = 'Сохранение недоступно. Изменения действуют до перезагрузки страницы.';
  }
  render(state);
}

const form = document.querySelector('.filters__form');

// input всплывает от всех полей: один обработчик для комбинации фильтров.
form.addEventListener('input', () => {
  state.filters = {
    query: form.elements.q.value,
    genre: form.elements.genre.value,
    sort: form.elements.sort.value,
    available: form.elements.available.checked,
  };
  update();
});

form.addEventListener('submit', event => event.preventDefault());
form.addEventListener('reset', event => {
  event.preventDefault();
  state.filters = defaultFilters();
  update();
});

// Делегирование: обработчик остаётся на main при перерисовке карточек.
document.querySelector('main').addEventListener('click', event => {
  const button = event.target.closest('button[data-book-id]');
  if (!button) return;
  const id = Number(button.dataset.bookId);
  if (!books.some(book => book.id === id)) return;
  state.wishlist = button.dataset.action === 'remove'
    ? state.wishlist.filter(item => item !== id)
    : toggleWishlist(state.wishlist, id);
  update();
});

render(state);
