import type { Book, Filters } from '../types';
import { FiltersPanel } from './FiltersPanel';
import { SearchResults } from './SearchResults';
import { Wishlist } from './Wishlist';

interface CatalogPageProps {
  filters: Filters; page: number; wishlist: Book[];
  onFiltersChange: (filters: Filters) => void; onPageChange: (page: number) => void; onToggle: (book: Book) => void;
}

export function CatalogPage({ filters, page, wishlist, onFiltersChange, onPageChange, onToggle }: CatalogPageProps) {
  return <main className="site-main catalog-page">
    <h1 className="page-title">Каталог книг</h1>
    <FiltersPanel filters={filters} onChange={onFiltersChange} />
    <SearchResults filters={filters} page={page} wishlist={wishlist} onPageChange={onPageChange} onToggle={onToggle} />
    <Wishlist books={wishlist} onToggle={onToggle} />
  </main>;
}
