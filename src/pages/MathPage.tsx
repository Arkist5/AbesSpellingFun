import { ReactNode } from 'react';
import { Layout } from '../ui/Layout';
import { Link } from '../router';

type NavTileProps = {
  to: string;
  title: string;
  description?: ReactNode;
};

function NavTile({ to, title, description }: NavTileProps) {
  return (
    <Link to={to} aria-label={title} className="BigButton-link">
      <div style={{ width: '100%', textAlign: 'left' }}>
        <h2 style={{ margin: '0 0 0.5rem' }}>{title}</h2>
        {description}
      </div>
    </Link>
  );
}

export function MathPage() {
  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <header>
          <h1>Math</h1>
          <p>Explore new math practice modes designed for quick skills sessions.</p>
        </header>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <NavTile
            to="/math/flash-cards"
            title="Flash Cards"
            description={<p style={{ margin: 0 }}>Practice with quick math flash cards (coming soon)</p>}
          />
        </div>
      </div>
    </Layout>
  );
}
