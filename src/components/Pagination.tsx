import { PAGE_SIZE } from '../api/books';
import { Button } from './Button';

interface PaginationProps { page: number; total: number; onPageChange: (page: number) => void }

export function Pagination({ page, total, onPageChange }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return <nav className="pagination" aria-label="Страницы результатов">
    <Button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Назад</Button>
    <span role="status">Страница {page} из {pages}</span>
    <Button disabled={page >= pages} onClick={() => onPageChange(page + 1)}>Далее</Button>
  </nav>;
}
