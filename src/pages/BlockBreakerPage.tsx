import { BlockBreaker } from '../games/BlockBreaker';
import { GamePage } from './GamePage';

export function BlockBreakerPage() {
  return <GamePage title="Block Breaker" gameKey="block-breaker" scene={BlockBreaker} />;
}
