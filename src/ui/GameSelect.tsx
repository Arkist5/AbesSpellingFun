import { Card } from './Components';
import { Link } from '../router';

const games = [
  {
    key: 'animal-box',
    title: 'Animal Box',
    description: 'Unlock a parade of cute critters every three words you master.'
  },
  {
    key: 'green-light-squad',
    title: 'Green Light Squad',
    description: 'Clear traffic with each correct letter—trigger green waves for big streaks!'
  },
  {
    key: 'block-builder',
    title: 'Block Builder',
    description: 'Stack letter blocks sky-high—unless a rogue block knocks them down!'
  },
  {
    key: 'basketball',
    title: 'Basketball',
    description: 'Shoot spelling shots for points and chase that perfect streak.'
  },
  {
    key: 'block-breaker',
    title: 'Block Breaker',
    description: 'Coming soon! A phonics Peggle mash-up in the works.'
  }
];

export function GameSelect() {
  const mathUrl = import.meta.env.BASE_URL + 'math/';

  return (
    <div className="GameCards">
      {games.map((game) => (
        <Card
          key={game.key}
          title={game.title}
          description={game.description}
          actions={
            <Link to={`/games/${game.key}`} className="BigButton-link">
              Play
            </Link>
          }
        />
      ))}
      <a
        href={mathUrl}
        style={{
          display: 'block',
          padding: '16px',
          borderRadius: 12,
          background: '#171b24',
          color: '#f2f5fb',
          textDecoration: 'none',
          boxShadow: '0 8px 20px rgba(0,0,0,0.35)'
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
          Math — Addition Flashcards
        </div>
        <div style={{ opacity: 0.8 }}>1+1 to 10+10 • Multiple choice or type-in</div>
      </a>
    </div>
  );
}
