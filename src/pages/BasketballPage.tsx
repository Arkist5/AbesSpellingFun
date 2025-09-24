import { Basketball } from '../games/Basketball';
import { GamePage } from './GamePage';

export function BasketballPage() {
  return <GamePage title="Basketball" gameKey="basketball" scene={Basketball} />;
}
