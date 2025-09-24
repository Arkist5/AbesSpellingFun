import { ReactNode, useEffect, useState } from 'react';
import { ensureDefaultList, subscribe } from '../core/store';
import { Link } from '../router';
import './layout.css';

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  const [listName, setListName] = useState<string>('');

  useEffect(() => {
    ensureDefaultList();
    return subscribe((next) => {
      const current = next.lists.find((list) => list.id === next.currentListId);
      setListName(current?.name ?? '');
    });
  }, []);

  return (
    <div className="AppShell">
      <header className="AppShell-header">
        <h1>Abe's Spelling Fun</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/games">Games</Link>
          <Link to="/settings">Settings</Link>
        </nav>
        {listName && <span className="AppShell-list">Current list: {listName}</span>}
      </header>
      <main className="AppShell-main">{children}</main>
    </div>
  );
}
