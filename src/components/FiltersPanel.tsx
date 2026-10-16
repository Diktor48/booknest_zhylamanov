import type { Filters } from '../types';
import { defaultFilters, genres, isGenre, isSortOrder, sortOrders } from '../lib/filters';
import { Button } from './Button';

interface FiltersPanelProps { filters: Filters; onChange: (filters: Filters) => void }

export function FiltersPanel({ filters, onChange }: FiltersPanelProps) {
  return <section className="filters" aria-labelledby="filters-title">
    <h2 className="section-title" id="filters-title">Фильтры</h2>
    <form className="form filters__form" onSubmit={event => event.preventDefault()}
      onReset={event => { event.preventDefault(); onChange(defaultFilters()); }}>
      <p className="form__field"><label className="form__label" htmlFor="q">Название или автор</label>
        <input className="form__input" id="q" name="q" type="search" maxLength={100} minLength={2}
          value={filters.query} placeholder="Например, Solaris или Tolkien" aria-describedby="search-hint"
          onChange={event => onChange({ ...filters, query: event.target.value })} />
        <small id="search-hint">Введите минимум 2 символа. Поиск по Open Library.</small>
      </p>
      <p className="form__field"><label className="form__label" htmlFor="genre">Жанр</label>
        <select className="form__select" id="genre" name="genre" value={filters.genre} onChange={event => {
          if (isGenre(event.target.value)) onChange({ ...filters, genre: event.target.value });
        }}>{genres.map(genre => <option value={genre.value} key={genre.value}>{genre.label}</option>)}</select>
      </p>
      <p className="form__field"><label className="form__label" htmlFor="sort">Сортировка</label>
        <select className="form__select" id="sort" name="sort" value={filters.sort} onChange={event => {
          if (isSortOrder(event.target.value)) onChange({ ...filters, sort: event.target.value });
        }}>{sortOrders.map(sort => <option value={sort.value} key={sort.value}>{sort.label}</option>)}</select>
      </p>
      <p className="form__field form__field--check">
        <input className="form__check" id="available" name="available" type="checkbox" checked={filters.available}
          onChange={event => onChange({ ...filters, available: event.target.checked })} />
        <label className="form__label form__label--inline" htmlFor="available">Можно читать бесплатно</label>
      </p>
      <Button type="reset">Сбросить</Button>
    </form>
  </section>;
}
