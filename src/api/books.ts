import { ApiError, getJson } from './client';
import { isRecord } from '../lib/filters';
import type { Book, BookDetails, Filters, Genre, SearchResult, SortOrder } from '../types';

export const PAGE_SIZE = 20;
export const MIN_QUERY_LENGTH = 2;
export const PLACEHOLDER_COVER = `${import.meta.env.BASE_URL}img/cover-placeholder.svg`;
const fields = 'key,title,author_name,first_publish_year,cover_i,ratings_average,ebook_access';
const subjects: Partial<Record<Genre, string>> = { scifi: 'science_fiction', history: 'history', poetry: 'poetry', cs: 'computer_science', classic: 'classics' };
const sorts: Partial<Record<SortOrder, string>> = { title: 'title', year: 'new', rating: 'rating' };

export function isWorkId(value: unknown): value is string {
  return typeof value === 'string' && /^OL\d+W$/.test(value);
}

export function normalizeBook(value: unknown): Book | null {
  if (!isRecord(value)) return null;
  const id = typeof value.key === 'string' ? value.key.replace('/works/', '') : '';
  if (!isWorkId(id)) return null;
  const authors = Array.isArray(value.author_name) ? value.author_name.filter((name): name is string => typeof name === 'string') : [];
  return {
    id, title: typeof value.title === 'string' ? value.title : 'Без названия',
    author: authors.join(', ') || 'Автор не указан',
    year: typeof value.first_publish_year === 'number' && Number.isInteger(value.first_publish_year) ? value.first_publish_year : null,
    coverId: typeof value.cover_i === 'number' && Number.isInteger(value.cover_i) && value.cover_i > 0 ? value.cover_i : null,
    rating: typeof value.ratings_average === 'number' && Number.isFinite(value.ratings_average) ? value.ratings_average : null,
    available: value.ebook_access === 'public', accessKnown: typeof value.ebook_access === 'string',
  };
}

export async function searchBooks(filters: Filters, page: number, signal: AbortSignal): Promise<SearchResult> {
  const params: Record<string, string | number> = { q: filters.query.trim(), page, limit: PAGE_SIZE, fields, lang: 'ru' };
  const sort = sorts[filters.sort];
  const subject = subjects[filters.genre];
  if (sort) params.sort = sort;
  if (subject) params.subject = subject;
  if (filters.available) params.q = `(${filters.query.trim()}) AND ebook_access:public`;
  const data = await getJson('/search.json', params, signal);
  if (!isRecord(data)) throw new ApiError('Неожиданный формат поиска.', 0, 'format');
  const total = data.numFound ?? data.num_found;
  if (!Array.isArray(data.docs) || typeof total !== 'number' || !Number.isFinite(total) || total < 0) {
    throw new ApiError('Open Library вернула неожиданный формат поиска.', 0, 'format');
  }
  return { books: data.docs.map(normalizeBook).filter((book): book is Book => book !== null), total };
}

export async function getBook(id: string, signal: AbortSignal): Promise<BookDetails> {
  if (!isWorkId(id)) throw new ApiError('Некорректный идентификатор книги.', 404);
  const [work, search] = await Promise.all([
    getJson(`/works/${id}.json`, {}, signal),
    getJson('/search.json', { q: `key:/works/${id}`, limit: 1, fields }, signal),
  ]);
  if (!isRecord(work) || typeof work.title !== 'string') throw new ApiError('Некорректные данные книги.', 0, 'format');
  const doc: unknown = isRecord(search) && Array.isArray(search.docs)
    ? search.docs.find((item: unknown) => isRecord(item) && (item.key === `/works/${id}` || item.key === id)) : undefined;
  const cover: unknown = Array.isArray(work.covers) ? work.covers.find((value: unknown) => typeof value === 'number' && value > 0) : undefined;
  const book = normalizeBook(doc) ?? normalizeBook({ key: id, title: work.title, cover_i: cover });
  if (!book) throw new ApiError('Не удалось прочитать книгу.', 0, 'format');
  return {
    ...book, title: work.title,
    description: typeof work.description === 'string' ? work.description
      : isRecord(work.description) && typeof work.description.value === 'string' ? work.description.value : 'Описание пока не добавлено в Open Library.',
    subjects: Array.isArray(work.subjects) ? work.subjects.filter((value): value is string => typeof value === 'string').slice(0, 8) : [],
  };
}
