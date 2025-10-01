import Phaser from 'phaser';

type PlayData = { words: string[] };

export default class PlayScene extends Phaser.Scene {
  constructor() {
    super('play');
  }

  create(data: PlayData) {
    const words = data?.words ?? ['cat', 'dog', 'sun'];
    const N = words.length;
    const { width, height } = this.scale;

    // compute grid
    const cols = Math.ceil(Math.sqrt(N));
    const rows = Math.ceil(N / cols);
    const pad = 12;
    const gridW = Math.min(width * 0.92, 900);
    const gridH = Math.min(height * 0.78, 640);
    const cellW = Math.floor((gridW - pad * (cols - 1)) / cols);
    const cellH = Math.floor((gridH - pad * (rows - 1)) / rows);
    const size = Math.min(cellW, cellH);
    const startX = (width - (size * cols + pad * (cols - 1))) / 2 + size / 2;
    const startY = (height - (size * rows + pad * (rows - 1))) / 2 + size / 2;

    for (let i = 0; i < N; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const x = startX + c * (size + pad);
      const y = startY + r * (size + pad);

      const card = this.add
        .rectangle(x, y, size, size, 0xffffff, 0.95)
        .setStrokeStyle(2, 0x0f3057)
        .setInteractive({ useHandCursor: true });
      const label = this.add
        .text(x, y, String(i + 1), {
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: Math.round(size * 0.35) + 'px',
          color: '#0f3057'
        })
        .setOrigin(0.5);

      card.on('pointerdown', () => {
        // Placeholder open animation: flip + emoji animal
        this.tweens.add({
          targets: card,
          scaleX: 0.1,
          duration: 120,
          yoyo: true,
          onYoyo: () => {
            card.setFillStyle(0xfff3c4);
            label.setText('🦊');
          }
        });
      });
    }
  }
}
