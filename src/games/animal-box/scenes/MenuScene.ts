import Phaser from 'phaser';
import { sampleList } from '../../../lists/sample';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('menu');
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height * 0.3, 'Animal Box', {
        fontFamily: 'Nunito, system-ui, sans-serif',
        fontSize: '48px',
        color: '#0f3057'
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.4, `${sampleList.name} — ${sampleList.words.length} boxes`, {
        fontFamily: 'Nunito, system-ui, sans-serif',
        fontSize: '20px',
        color: '#374151'
      })
      .setOrigin(0.5);

    const btn = this.add
      .rectangle(width / 2, height * 0.6, 220, 60, 0xffffff, 0.95)
      .setStrokeStyle(2, 0x0f3057)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(btn.x, btn.y, 'Play', {
        fontFamily: 'Nunito, system-ui, sans-serif',
        fontSize: '24px',
        color: '#0f3057'
      })
      .setOrigin(0.5);

    btn.on('pointerup', () => this.scene.start('play', { words: sampleList.words }));
  }
}
