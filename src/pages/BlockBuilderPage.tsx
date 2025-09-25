import { BlockBuilder } from '../games/BlockBuilder';
import { GamePage } from './GamePage';

export function BlockBuilderPage() {
  return <GamePage title="Block Builder" gameKey="block-builder" scene={BlockBuilder} />;
}
