import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { Layout } from '../ui/Layout';
import { Link } from '../router';
import { initKeyboardFocus, ensureKeyboardFocus } from '../core/input';

const EVENT_REPLAY = 'asgs:replay';

type GamePageProps = {
  title: string;
  gameKey: string;
  scene: Phaser.Types.Scenes.SceneType;
};

export function GamePage({ title, gameKey, scene }: GamePageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    initKeyboardFocus();
  }, []);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1024,
      height: 640,
      parent,
      backgroundColor: '#ffffff',
      scene
    };
    const game = new Phaser.Game(config);
    const focusInterval = window.setInterval(() => ensureKeyboardFocus(), 1500);
    return () => {
      window.clearInterval(focusInterval);
      game.destroy(true);
    };
  }, [scene]);

  const handleReplay = () => {
    const event = new CustomEvent(EVENT_REPLAY, { detail: { gameKey } });
    window.dispatchEvent(event);
  };

  return (
    <Layout>
      <div className="GameWrapper">
        <div className="GameTopBar">
          <Link to="/games">← Games</Link>
          <h2>{title}</h2>
          <button type="button" onClick={handleReplay} className="GameReplay">
            🔈 Hear word again
          </button>
        </div>
        <div ref={containerRef} className="GameCanvas" />
      </div>
    </Layout>
  );
}
