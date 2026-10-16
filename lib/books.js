export function defaultFilters() {
  return { query: '', genre: 'all', sort: 'title', available: false };
}

export function selectBooks(books, filters) {
  const query = filters.query.trim().toLocaleLowerCase('ru');
  const compare = {
    title: (a, b) => a.title.localeCompare(b.title, 'ru'),
    year: (a, b) => b.year - a.year || a.title.localeCompare(b.title, 'ru'),
    rating: (a, b) => b.rating - a.rating || a.title.localeCompare(b.title, 'ru'),
  };

  // filter создаёт новый массив: sort не меняет исходный каталог.
  return books.filter(book => (
    (!query || `${book.title} ${book.author}`.toLocaleLowerCase('ru').includes(query))
    && (filters.genre === 'all' || book.genre === filters.genre)
    && (!filters.available || book.available)
  )).sort(compare[filters.sort] ?? compare.title);
}

export function toggleWishlist(ids, id) {
  return ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id];
}

// Даже корректный JSON может содержать неверные типы или старые ID.
export function restoreSaved(saved, books, genres) {
  const filters = defaultFilters();
  const raw = saved?.filters;
  if (typeof raw?.query === 'string') filters.query = raw.query.slice(0, 100);
  if (raw?.genre === 'all' || Object.hasOwn(genres, raw?.genre)) filters.genre = raw.genre;
  if (['title', 'year', 'rating'].includes(raw?.sort)) filters.sort = raw.sort;
  if (typeof raw?.available === 'boolean') filters.available = raw.available;
  const validIds = new Set(books.map(book => book.id));
  const wishlist = Array.isArray(saved?.wishlist)
    ? [...new Set(saved.wishlist.filter(id => validIds.has(id)))] : [];
  return { filters, wishlist };
}
