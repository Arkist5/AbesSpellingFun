import { AnimalBoxGame } from '../games/AnimalBoxGame';
import { GamePage } from './GamePage';

export function AnimalBoxPage() {
  return <GamePage title="Animal Box" gameKey="animal-box" scene={AnimalBoxGame} />;
}
