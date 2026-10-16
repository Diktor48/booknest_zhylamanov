import { books, genres } from '../data/books.js';
import { selectBooks } from '../lib/books.js';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function card(book, selected, inWishlist) {
  const item = element('li', 'catalog__item');
  const article = element('article', 'book-card book-card--interactive');
  const title = element('h3', 'book-card__title', book.title);
  const meta = element('p', 'book-card__meta', `${book.author} · ${book.year < 0 ? `${-book.year} до н. э.` : book.year}`);
  const cover = element('img', 'book-card__cover');
  cover.src = 'img/cover-placeholder.svg';
  cover.alt = `Обложка книги «${book.title}»`;
  cover.width = 150;
  cover.height = 225;
  cover.loading = 'lazy';
  const details = element('p', 'book-card__meta', `${genres[book.genre]} · Рейтинг ${book.rating.toFixed(1)} из 5`);
  const status = element('p', 'book-card__status', book.available ? 'Доступна' : 'Выдана');
  const button = element('button', 'btn btn--ghost book-card__wish', inWishlist ? 'Удалить из списка' : selected ? 'В моём списке' : 'Хочу прочитать');
  button.type = 'button';
  button.dataset.bookId = book.id;
  button.dataset.action = inWishlist ? 'remove' : 'toggle';
  button.setAttribute('aria-label', `${button.textContent}: ${book.title}`);
  if (!inWishlist) button.setAttribute('aria-pressed', String(selected));
  article.append(title, meta, cover, details, status, button);
  item.append(article);
  return item;
}

export function render(state) {
  const catalog = document.querySelector('#catalog-list');
  const wishlist = document.querySelector('#wishlist-list');
  const active = document.activeElement;
  const focusedId = active?.dataset.bookId;
  const focusedList = active?.closest('ul')?.id;
  const found = selectBooks(books, state.filters);
  const wanted = books.filter(book => state.wishlist.includes(book.id));

  document.querySelector('#q').value = state.filters.query;
  document.querySelector('#genre').value = state.filters.genre;
  document.querySelector('#sort').value = state.filters.sort;
  document.querySelector('#available').checked = state.filters.available;
  document.querySelector('#list-title').textContent = `Найдено книг: ${found.length}`;
  document.querySelector('#wishlist-count').textContent = state.wishlist.length;
  document.querySelector('#wishlist-title').textContent = `Мой список: ${wanted.length}`;
  document.querySelector('#catalog-empty').hidden = found.length > 0;
  document.querySelector('#wishlist-empty').hidden = wanted.length > 0;
  document.querySelector('#storage-message').textContent = state.storageError;

  catalog.replaceChildren(...found.map(book => card(book, state.wishlist.includes(book.id), false)));
  wishlist.replaceChildren(...wanted.map(book => card(book, true, true)));

  // После замены карточек сохраняем позицию клавиатурного фокуса.
  if (focusedId && focusedList) {
    const list = focusedList === 'catalog-list' ? catalog : wishlist;
    const replacement = [...list.querySelectorAll('button')].find(button => button.dataset.bookId === focusedId);
    (replacement ?? document.querySelector('#wishlist-title')).focus({ preventScroll: true });
  }
}
