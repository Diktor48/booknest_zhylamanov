import type { Book } from '../types';
import { BookList } from './BookList';
import { EmptyState } from './EmptyState';

interface WishlistProps { books: Book[]; onToggle: (book: Book) => void }

export function Wishlist({ books, onToggle }: WishlistProps) {
  return <section className="wishlist" id="wishlist" aria-labelledby="wishlist-title">
    <h2 className="section-title" id="wishlist-title" aria-live="polite">Мой список: {books.length}</h2>
    {books.length ? <BookList books={books} wishlist={books} inWishlist onToggle={onToggle} />
      : <EmptyState message="Список пока пуст. Нажмите «Хочу прочитать» на карточке книги." />}
  </section>;
}
