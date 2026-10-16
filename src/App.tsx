import { useEffect, useState } from 'react';
import { readSaved, saveCurrent, STORAGE_KEY } from './lib/storage';
import type { Book, Filters, SavedState } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CatalogPage } from './components/CatalogPage';
import { BookDetails } from './components/BookDetails';

export default function App() {
  const [saved, setSaved] = useState<SavedState>(readSaved);
  const [page, setPage] = useState(1);
  const details = window.location.pathname.endsWith('/book.html');
  const id = new URLSearchParams(window.location.search).get('id');

  useEffect(() => {
    function synchronize(event: StorageEvent) {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      const updated = readSaved();
      setSaved(current => ({ ...current, wishlist: updated.wishlist, storageError: updated.storageError }));
    }
    window.addEventListener('storage', synchronize);
    return () => window.removeEventListener('storage', synchronize);
  }, []);

  function changeFilters(filters: Filters) {
    const next = { ...saved, filters };
    setSaved({ ...next, storageError: saveCurrent(next) });
    setPage(1);
  }

  function toggleBook(book: Book) {
    const wishlist = saved.wishlist.some(item => item.id === book.id)
      ? saved.wishlist.filter(item => item.id !== book.id) : [...saved.wishlist, book];
    const next = { ...saved, wishlist };
    setSaved({ ...next, storageError: saveCurrent(next) });
  }

  return <div className="page">
    <Header wishlistCount={saved.wishlist.length} details={details} />
    {saved.storageError && <p className="storage-notice" role="status">{saved.storageError}</p>}
    {details ? <BookDetails id={id} wishlist={saved.wishlist} onToggle={toggleBook} />
      : <CatalogPage filters={saved.filters} page={page} wishlist={saved.wishlist}
        onFiltersChange={changeFilters} onPageChange={setPage} onToggle={toggleBook} />}
    <Footer />
  </div>;
}
