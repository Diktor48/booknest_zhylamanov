import { PLACEHOLDER_COVER } from '../api/books';
import type { Book } from '../types';

interface BookCoverProps { book: Book; className?: string }

export function BookCover({ book, className = 'book-card__cover' }: BookCoverProps) {
  return <img className={className} alt={`Обложка книги «${book.title}»`}
    src={book.coverId ? `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg` : PLACEHOLDER_COVER}
    width={150} height={225} loading="lazy"
    onError={event => {
      const image = event.currentTarget;
      if (!image.src.endsWith('cover-placeholder.svg')) image.src = PLACEHOLDER_COVER;
    }} />;
}
