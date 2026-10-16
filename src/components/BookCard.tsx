import type { Book } from '../types';
import { isWorkId } from '../api/books';
import { Badge } from './Badge';
import { BookCover } from './BookCover';
import { Button } from './Button';

interface BookCardProps { book: Book; selected: boolean; inWishlist?: boolean; onToggle: (book: Book) => void }

export function BookCard({ book, selected, inWishlist = false, onToggle }: BookCardProps) {
  const buttonText = inWishlist ? 'Удалить из списка' : selected ? 'В моём списке' : 'Хочу прочитать';
  return <article className="book-card book-card--interactive">
    <h3 className="book-card__title">{isWorkId(book.id) ? <a href={`book.html?id=${book.id}`}>{book.title}</a> : book.title}</h3>
    <p className="book-card__meta">{book.author} · {book.year ?? 'Год не указан'}</p>
    <BookCover book={book} />
    <p className="book-card__meta">{book.rating === null ? 'Рейтинг не указан' : `Рейтинг ${book.rating.toFixed(1)} из 5`}</p>
    <p className="book-card__status"><Badge tone={book.available ? 'positive' : 'normal'}>
      {!book.accessKnown ? 'Доступность не указана' : book.available ? 'Можно читать бесплатно' : 'Свободное чтение не подтверждено'}
    </Badge></p>
    <Button className="book-card__wish" aria-label={`${buttonText}: ${book.title}`}
      aria-pressed={inWishlist ? undefined : selected} onClick={() => onToggle(book)}>{buttonText}</Button>
  </article>;
}
