import { useCallback, useState } from 'react';
import { getBook, isWorkId } from '../api/books';
import { API_BASE_URL } from '../api/client';
import { useRequest } from '../lib/useRequest';
import type { Book } from '../types';
import { Badge } from './Badge';
import { BookCover } from './BookCover';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { ErrorBox } from './ErrorBox';
import { Spinner } from './Spinner';

interface BookDetailsProps { id: string | null; wishlist: Book[]; onToggle: (book: Book) => void }

export function BookDetails({ id, wishlist, onToggle }: BookDetailsProps) {
  const [retry, setRetry] = useState(0);
  const load = useCallback((signal: AbortSignal) => getBook(id ?? '', signal), [id]);
  const request = useRequest(`${id}:${retry}`, isWorkId(id), load);
  const book = request.status === 'success' ? request.data : null;
  const selected = wishlist.some(item => item.id === id);
  return <main className="site-main book-page">
    <nav className="breadcrumbs" aria-label="Хлебные крошки"><ol className="breadcrumbs__list">
      <li className="breadcrumbs__item"><a href="index.html">Каталог</a></li>
      <li className="breadcrumbs__item" aria-current="page">{book?.title ?? 'Карточка книги'}</li>
    </ol></nav>
    <h1 className="page-title">{book?.title ?? 'Карточка книги'}</h1>
    <section aria-label="Данные книги" aria-busy={request.status === 'loading'} data-status={request.status}>
      {request.status === 'loading' && <Spinner message="Загрузка книги…" />}
      {request.status === 'empty' && <EmptyState message="Выберите книгу в каталоге: откройте ссылку с её названием." />}
      {request.status === 'error' && <ErrorBox message={request.message} onRetry={() => setRetry(value => value + 1)} />}
      {book && <article className="book">
        <figure className="book__cover"><BookCover book={book} className="book__cover-img" />
          <figcaption className="book__caption">Обложка из Open Library</figcaption>
        </figure>
        <section className="book__specs" aria-labelledby="specs-title">
          <h2 className="section-title" id="specs-title">Характеристики</h2>
          <dl className="specs">
            <dt className="specs__term">Автор</dt><dd className="specs__value">{book.author}</dd>
            <dt className="specs__term">Первое издание</dt><dd className="specs__value">{book.year ?? 'Не указан'}</dd>
            <dt className="specs__term">Рейтинг</dt><dd className="specs__value">{book.rating === null ? 'Не указан' : `${book.rating.toFixed(1)} из 5`}</dd>
            <dt className="specs__term">Чтение онлайн</dt><dd className="specs__value"><Badge tone={book.available ? 'positive' : 'normal'}>
              {!book.accessKnown ? 'Доступность не указана' : book.available ? 'Можно читать бесплатно' : 'Свободное чтение не подтверждено'}
            </Badge></dd>
            <dt className="specs__term">Темы</dt><dd className="specs__value">{book.subjects.join(', ') || 'Не указаны'}</dd>
          </dl>
          <Button className="book-card__wish" aria-pressed={selected} onClick={() => onToggle(book)}>{selected ? 'В моём списке' : 'Хочу прочитать'}</Button>
          <p><a href={`${API_BASE_URL}/works/${book.id}`}>Открыть книгу в Open Library</a></p>
        </section>
        <section className="book__description" aria-labelledby="desc-title">
          <h2 className="section-title" id="desc-title">Описание</h2>
          <p className="book__description-text">{book.description}</p>
        </section>
      </article>}
      {request.status !== 'success' && <p><a href="index.html">Вернуться в каталог</a></p>}
    </section>
  </main>;
}
