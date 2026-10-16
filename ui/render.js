import { coverUrl, isWorkId, PAGE_SIZE } from '../api/books.js';

export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function bookCover(book, className) {
  const image = element('img', className);
  image.src = coverUrl(book);
  image.alt = `Обложка книги «${book.title}»`;
  image.width = 150;
  image.height = 225;
  image.loading = 'lazy';
  image.addEventListener('error', () => { image.src = 'img/cover-placeholder.svg'; }, { once: true });
  return image;
}

export function accessText(book) {
  if (!book.accessKnown) return 'Доступность электронной версии не указана';
  return book.available ? 'Можно читать бесплатно в Open Library' : 'Свободное чтение не подтверждено';
}

function card(book, selected, inWishlist) {
  const item = element('li', 'catalog__item');
  const article = element('article', 'book-card book-card--interactive');
  const title = element('h3', 'book-card__title');
  if (isWorkId(book.id)) {
    const link = element('a', '', book.title);
    link.href = `book.html?id=${encodeURIComponent(book.id)}`;
    title.append(link);
  } else title.textContent = book.title;
  const meta = element('p', 'book-card__meta', `${book.author} · ${book.year ?? 'Год не указан'}`);
  const rating = element('p', 'book-card__meta', book.rating === null ? 'Рейтинг не указан' : `Рейтинг ${book.rating.toFixed(1)} из 5`);
  const status = element('p', 'book-card__status', accessText(book));
  const button = element('button', 'btn btn--ghost book-card__wish', inWishlist ? 'Удалить из списка' : selected ? 'В моём списке' : 'Хочу прочитать');
  button.type = 'button';
  button.dataset.bookId = book.id;
  button.dataset.action = inWishlist ? 'remove' : 'toggle';
  button.setAttribute('aria-label', `${button.textContent}: ${book.title}`);
  if (!inWishlist) button.setAttribute('aria-pressed', String(selected));
  article.append(title, meta, bookCover(book, 'book-card__cover'), rating, status, button);
  item.append(article);
  return item;
}

export function render(state) {
  const catalog = document.querySelector('#catalog-list');
  const wishlist = document.querySelector('#wishlist-list');
  const active = document.activeElement;
  const focusedId = active?.dataset.bookId;
  const focusedList = active?.closest('ul')?.id;
  document.querySelector('#q').value = state.filters.query;
  document.querySelector('#genre').value = state.filters.genre;
  document.querySelector('#sort').value = state.filters.sort;
  document.querySelector('#available').checked = state.filters.available;
  document.querySelector('#list-title').textContent = state.status === 'success' ? `Найдено книг: ${state.total}` : 'Результаты поиска';
  document.querySelector('#wishlist-count').textContent = state.wishlist.length;
  document.querySelector('#wishlist-title').textContent = `Мой список: ${state.wishlist.length}`;
  document.querySelector('#wishlist-empty').hidden = state.wishlist.length > 0;
  document.querySelector('#storage-message').textContent = state.storageError;
  document.querySelector('#catalog-empty').textContent = state.emptyMessage;
  document.querySelector('#catalog-error-text').textContent = state.error;
  document.querySelector('#catalog-results').setAttribute('aria-busy', String(state.loading));
  for (const panel of document.querySelectorAll('[data-catalog-state]')) {
    panel.hidden = panel.dataset.catalogState !== state.status;
  }
  const pages = Math.max(1, Math.ceil(state.total / PAGE_SIZE));
  document.querySelector('#page-info').textContent = `Страница ${state.page} из ${pages}`;
  document.querySelector('[data-action="previous"]').disabled = state.loading || state.page <= 1;
  document.querySelector('[data-action="next"]').disabled = state.loading || state.page >= pages;
  catalog.replaceChildren(...(state.status === 'success' ? state.books.map(book => card(book, state.wishlist.some(item => item.id === book.id), false)) : []));
  wishlist.replaceChildren(...state.wishlist.map(book => card(book, true, true)));
  if (focusedId && focusedList) {
    const list = focusedList === 'catalog-list' ? catalog : wishlist;
    const replacement = [...list.querySelectorAll('button')].find(button => button.dataset.bookId === focusedId);
    (replacement ?? document.querySelector('#wishlist-title')).focus({ preventScroll: true });
  }
}
