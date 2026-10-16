interface HeaderProps { wishlistCount: number; details: boolean }

export function Header({ wishlistCount, details }: HeaderProps) {
  return <header className="site-header">
    <a className="site-logo" href="index.html" aria-label="BookNest, на главную">BookNest</a>
    <nav className="site-nav" aria-label="Основная навигация"><ul className="site-nav__list">
      <li><a className="site-nav__link" href="index.html" aria-current={!details ? 'page' : undefined}>Каталог</a></li>
      <li><a className="site-nav__link" href="book.html" aria-current={details ? 'page' : undefined}>Карточка книги</a></li>
      <li><a className="site-nav__link" href="loan.html">Выдача книги</a></li>
      <li><a className="site-nav__link" href={details ? 'index.html#wishlist' : '#wishlist'}>Мой список ({wishlistCount})</a></li>
    </ul></nav>
  </header>;
}
