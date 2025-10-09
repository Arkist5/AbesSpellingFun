import { Layout } from '../ui/Layout';
import { GameSelect } from '../ui/GameSelect';

export function SpellingPage() {
  return (
    <Layout>
      <div className="GameWrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <header>
          <h1>Spelling Games</h1>
          <p>Choose a game below to practice your spelling list.</p>
        </header>
        <GameSelect />
      </div>
    </Layout>
  );
}
