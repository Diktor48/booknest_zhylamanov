import { ApiError, getJson } from './client.js';

export const PAGE_SIZE = 20;
export const MIN_QUERY_LENGTH = 2;
const fields = 'key,title,author_name,first_publish_year,cover_i,ratings_average,ebook_access';
const subjects = { scifi: 'science_fiction', history: 'history', poetry: 'poetry', cs: 'computer_science', classic: 'classics' };
const sorts = { title: 'title', year: 'new', rating: 'rating' };

export function isWorkId(id) {
  return typeof id === 'string' && /^OL\d+W$/.test(id);
}

function normalizeBook(doc) {
  if (!doc || typeof doc !== 'object') return null;
  const id = typeof doc.key === 'string' ? doc.key.replace('/works/', '') : '';
  if (!isWorkId(id)) return null;
  return {
    id,
    title: typeof doc.title === 'string' ? doc.title : 'Без названия',
    author: Array.isArray(doc.author_name) ? doc.author_name.filter(name => typeof name === 'string').join(', ') || 'Автор не указан' : 'Автор не указан',
    year: Number.isInteger(doc.first_publish_year) ? doc.first_publish_year : null,
    coverId: Number.isInteger(doc.cover_i) && doc.cover_i > 0 ? doc.cover_i : null,
    rating: typeof doc.ratings_average === 'number' && Number.isFinite(doc.ratings_average) ? doc.ratings_average : null,
    available: doc.ebook_access === 'public',
    accessKnown: typeof doc.ebook_access === 'string',
  };
}

export function coverUrl(book) {
  return book.coverId ? `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg` : 'img/cover-placeholder.svg';
}

export async function searchBooks(filters, page, signal) {
  const params = {
    q: filters.query.trim(), page, limit: PAGE_SIZE, fields, lang: 'ru',
  };
  if (Object.hasOwn(sorts, filters.sort)) params.sort = sorts[filters.sort];
  if (subjects[filters.genre]) params.subject = subjects[filters.genre];
  if (filters.available) params.q = `(${params.q}) AND ebook_access:public`;
  const data = await getJson('/search.json', params, signal);
  const total = data?.numFound ?? data?.num_found;
  if (!Array.isArray(data?.docs) || !Number.isFinite(total) || total < 0) {
    throw new ApiError('Open Library вернула неожиданный формат поиска.', 0, 'format');
  }
  return { books: data.docs.map(normalizeBook).filter(Boolean), total };
}

export async function getBook(id, signal) {
  if (!isWorkId(id)) throw new ApiError('Некорректный идентификатор книги.', 404);
  // Два независимых запроса: описание произведения и поисковые метаданные.
  const [work, search] = await Promise.all([
    getJson(`/works/${id}.json`, {}, signal),
    getJson('/search.json', { q: `key:/works/${id}`, limit: 1, fields }, signal),
  ]);
  if (typeof work?.title !== 'string') throw new ApiError('Некорректные данные книги.', 0, 'format');
  const doc = Array.isArray(search?.docs) ? search.docs.find(item => item?.key === `/works/${id}` || item?.key === id) : null;
  const book = normalizeBook(doc ?? { key: id, title: work.title, cover_i: work.covers?.find(cover => cover > 0) });
  book.title = work.title;
  book.description = typeof work.description === 'string'
    ? work.description : typeof work.description?.value === 'string' ? work.description.value : 'Описание пока не добавлено в Open Library.';
  book.subjects = Array.isArray(work.subjects) ? work.subjects.filter(subject => typeof subject === 'string').slice(0, 8) : [];
  return book;
}
