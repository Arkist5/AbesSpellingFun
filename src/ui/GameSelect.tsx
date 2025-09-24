import { Card } from './Components';
import { Link } from '../router';

const games = [
  {
    key: 'animal-box',
    title: 'Animal Box',
    description: 'Unlock a parade of cute critters every three words you master.'
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
    </div>
  );
}
