import type { Book } from '../types';
import { BookCard } from './BookCard';

interface BookListProps { books: Book[]; wishlist: Book[]; inWishlist?: boolean; onToggle: (book: Book) => void }

export function BookList({ books, wishlist, inWishlist = false, onToggle }: BookListProps) {
  return <ul className="catalog__list">{books.map(book => <li className="catalog__item" key={book.id}>
    <BookCard book={book} selected={wishlist.some(item => item.id === book.id)} inWishlist={inWishlist} onToggle={onToggle} />
  </li>)}</ul>;
}
